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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    if (!doc) return res.status(404).json({ error: 'Document not found or unauthorized' });
    res.json(normalize(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    if (!doc) return res.status(404).json({ error: 'Document not found or unauthorized' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
