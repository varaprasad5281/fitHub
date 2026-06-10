/**
 * Generic entity CRUD router.
 * Replaces base44.entities.X.list() / .filter() / .create() / .update() / .delete()
 *
 * Routes:
 *   GET    /api/entities/:model           → list all (scoped to user)
 *   POST   /api/entities/:model/filter    → filter with query params
 *   POST   /api/entities/:model           → create
 *   PUT    /api/entities/:model/:id       → update
 *   DELETE /api/entities/:model/:id       → delete
 */

const express = require('express');
const models = require('../models');
const { protect } = require('../middleware/auth');
const checkAndAwardBadges = require('../utils/checkAndAwardBadges');

// Models whose creation should trigger a badge check (lowercase model name → true)
const BADGE_CHECK_ON_CREATE = new Set(['meallog']);

const router = express.Router();
router.use(protect);

// Map URL segment (lowercase) to model name
const MODEL_MAP = {};
Object.keys(models).forEach((key) => {
  MODEL_MAP[key.toLowerCase()] = models[key];
});

// Aliases for names used by the frontend that differ from model names
MODEL_MAP['activityfeed']   = models.UserActivityEvent;
MODEL_MAP['activitylog']    = models.UserActivityEvent;
MODEL_MAP['friendrequest']  = models.Friendship;

function getModel(name) {
  return MODEL_MAP[name.toLowerCase()];
}

// Normalize a doc or array: add `id` = `_id` so the frontend can use either
function normalize(docOrDocs) {
  if (Array.isArray(docOrDocs)) return docOrDocs.map(normalize);
  if (!docOrDocs) return docOrDocs;
  const obj = typeof docOrDocs.toObject === 'function' ? docOrDocs.toObject() : { ...docOrDocs };
  obj.id = String(obj._id);
  return obj;
}

// Determine if a model is user-scoped (has created_by field)
function userScope(model, userEmail) {
  const paths = model.schema.paths;
  if (paths.created_by) return { created_by: userEmail };
  return {};
}

// GET /api/entities/:model
router.get('/:model', async (req, res) => {
  try {
    const Model = getModel(req.params.model);
    if (!Model) return res.status(404).json({ error: 'Unknown model' });

    const scope = userScope(Model, req.user.email);
    const docs = await Model.find(scope).sort({ createdAt: -1 }).lean();
    res.json(normalize(docs));
  } catch (err) {
    console.error(`[entities/list/${req.params.model}]`, err.message);
    res.status(500).json({ error: 'Could not load your data. Please try again.' });
  }
});

// POST /api/entities/:model/filter
router.post('/:model/filter', async (req, res) => {
  try {
    const Model = getModel(req.params.model);
    if (!Model) return res.status(404).json({ error: 'Unknown model' });

    const scope = userScope(Model, req.user.email);
    const query = { ...scope, ...req.body };
    const docs = await Model.find(query).sort({ createdAt: -1 }).lean();
    res.json(normalize(docs));
  } catch (err) {
    console.error(`[entities/filter/${req.params.model}]`, err.message);
    res.status(500).json({ error: 'Could not load your data. Please try again.' });
  }
});

// POST /api/entities/:model
router.post('/:model', async (req, res) => {
  try {
    const Model = getModel(req.params.model);
    if (!Model) return res.status(404).json({ error: 'Unknown model' });

    const paths = Model.schema.paths;
    const data = { ...req.body };
    if (paths.created_by && !data.created_by) data.created_by = req.user.email;

    const doc = await Model.create(data);
    res.status(201).json(normalize(doc));

    // Fire badge check after response is sent for models that warrant it
    if (BADGE_CHECK_ON_CREATE.has(req.params.model.toLowerCase())) {
      checkAndAwardBadges(req.user.email).catch(err =>
        console.error('[entities/create] badge check failed:', err.message)
      );
    }
  } catch (err) {
    console.error(`[entities/create/${req.params.model}]`, err.message);
    const message = err.name === 'ValidationError'
      ? 'Could not save - please check your input and try again.'
      : 'Could not save. Please try again.';
    res.status(500).json({ error: message });
  }
});

// PUT /api/entities/:model/:id
router.put('/:model/:id', async (req, res) => {
  try {
    const Model = getModel(req.params.model);
    if (!Model) return res.status(404).json({ error: 'Unknown model' });

    const scope = userScope(Model, req.user.email);
    const filter = { _id: req.params.id, ...scope };

    const doc = await Model.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Item not found.' });
    res.json(normalize(doc));
  } catch (err) {
    console.error(`[entities/update/${req.params.model}]`, err.message);
    const message = err.name === 'ValidationError'
      ? 'Could not save your changes - please check your input and try again.'
      : 'Could not save your changes. Please try again.';
    res.status(500).json({ error: message });
  }
});

// DELETE /api/entities/:model/:id
router.delete('/:model/:id', async (req, res) => {
  try {
    const Model = getModel(req.params.model);
    if (!Model) return res.status(404).json({ error: 'Unknown model' });

    const scope = userScope(Model, req.user.email);
    const filter = { _id: req.params.id, ...scope };

    const doc = await Model.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ error: 'Item not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error(`[entities/delete/${req.params.model}]`, err.message);
    res.status(500).json({ error: 'Could not delete this item. Please try again.' });
  }
});

module.exports = router;
