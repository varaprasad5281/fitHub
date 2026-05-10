const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Points = require('../models/Points');
const Subscription = require('../models/Subscription');
const IPLoginHistory = require('../models/IPLoginHistory');
const { protect } = require('../middleware/auth');
const { notify } = require('../utils/notify');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');

// Number of early-access users who receive the Founder badge automatically.
// Override by setting FOUNDER_LIMIT in your .env (default: 100).
const FOUNDER_LIMIT = parseInt(process.env.FOUNDER_LIMIT || '100', 10);

/**
 * Award the Beta Founder badge to a new user if they are within the first
 * FOUNDER_LIMIT users. Runs asynchronously — never blocks the register response.
 */
async function maybeAwardFounderBadge(userEmail, userNumber) {
  if (userNumber > FOUNDER_LIMIT) return;
  try {
    const badge = await Badge.findOne({ badge_code: 'FOUNDER' }).lean();
    if (!badge) return; // seed not run yet — silently skip
    await UserBadge.create({
      created_by: userEmail,
      badge_id: badge._id,
      badge_code: 'FOUNDER',
      achievement_notes: `Auto-awarded: user #${userNumber} of the first ${FOUNDER_LIMIT}`,
    });
    notify(
      userEmail,
      '✨ You earned the Beta Founder badge — a permanent mark of being here from day one.',
      'badge_earned'
    );
  } catch (err) {
    if (err.code !== 11000) {
      console.error('[register] Founder badge error:', err.message);
    }
  }
}

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, full_name, password } = req.body;

    if (!email || !full_name || !password) {
      return res.status(400).json({ error: 'email, full_name, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({ email: email.toLowerCase(), full_name, password });

    // Bootstrap related records
    await Promise.all([
      Profile.create({ created_by: user.email, email: user.email, username: full_name }),
      Points.create({ created_by: user.email }),
      Subscription.create({ created_by: user.email }),
    ]);

    // Welcome notification
    notify(user.email,
      `Welcome to 7%, ${full_name}! 🎉 Start by logging your first workout or meal to earn points.`,
      'welcome'
    );

    // Founder badge — check eligibility async, never block the response
    const totalUsers = await User.countDocuments({});
    setImmediate(() => maybeAwardFounderBadge(user.email, totalUsers));

    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, email: user.email, full_name: user.full_name } });
  } catch (err) {
    console.error('[register]', err);
    const isDbError = err.name === 'MongoNetworkError' || err.name === 'AggregateError' || err.message?.includes('connect');
    res.status(500).json({ error: isDbError ? 'Service temporarily unavailable. Please try again shortly.' : err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Record IP login
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    IPLoginHistory.create({ ip_address: ip, user_email: user.email }).catch(() => {});

    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, email: user.email, full_name: user.full_name } });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me  — replaces base44.auth.me()
router.get('/me', protect, async (req, res) => {
  try {
    const user = req.user;
    res.json({ id: user._id, email: user.email, full_name: user.full_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password  — token from password reset email
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'token and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password +passwordResetToken +passwordResetExpires');

    if (!user) return res.status(400).json({ error: 'Reset link is invalid or has expired' });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const newToken = signToken(user._id);
    res.json({ success: true, token: newToken, user: { id: user._id, email: user.email, full_name: user.full_name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', protect, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(current_password))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    user.password = new_password;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
