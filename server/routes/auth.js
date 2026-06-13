const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Points = require('../models/Points');
const Subscription = require('../models/Subscription');
const Referral = require('../models/Referral');
const IPLoginHistory = require('../models/IPLoginHistory');
const { protect } = require('../middleware/auth');
const { notify } = require('../utils/notify');
const { sendEmail } = require('../services/email');
const { buildEmail } = require('../utils/emailTemplate');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');

function generateReferralCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Number of early-access users who receive the Founder badge automatically.
// Override by setting FOUNDER_LIMIT in your .env (default: 100).
const FOUNDER_LIMIT = parseInt(process.env.FOUNDER_LIMIT || '100', 10);

/**
 * Award the Beta Founder badge to a new user if they are within the first
 * FOUNDER_LIMIT users. Runs asynchronously - never blocks the register response.
 */
async function maybeAwardFounderBadge(userEmail, userNumber) {
  if (userNumber > FOUNDER_LIMIT) return;
  try {
    const badge = await Badge.findOne({ badge_code: 'FOUNDER' }).lean();
    if (!badge) return; // seed not run yet - silently skip
    await UserBadge.create({
      created_by: userEmail,
      badge_id: badge._id,
      badge_code: 'FOUNDER',
      achievement_notes: `Auto-awarded: user #${userNumber} of the first ${FOUNDER_LIMIT}`,
    });
    notify(
      userEmail,
      '✨ You earned the Beta Founder badge - a permanent mark of being here from day one.',
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
    const { email, full_name, password, referral_code: inboundCode } = req.body;

    if (!email || !full_name || !password) {
      return res.status(400).json({ error: 'email, full_name, and password are required' });
    }

    if (!/^[A-Za-z ]+$/.test(full_name.trim())) {
      return res.status(400).json({ error: 'Full name can only contain letters and spaces' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    // Resolve referrer if a valid code was supplied
    let referrerEmail = null;
    if (inboundCode) {
      const referrer = await User.findOne({ referral_code: inboundCode.toUpperCase().trim() });
      if (referrer && referrer.email !== email.toLowerCase()) {
        referrerEmail = referrer.email;
      }
    }

    // Generate a unique referral code for the new user
    let newCode;
    for (let i = 0; i < 5; i++) {
      const candidate = generateReferralCode();
      const taken = await User.findOne({ referral_code: candidate });
      if (!taken) { newCode = candidate; break; }
    }

    const user = await User.create({
      email: email.toLowerCase(),
      full_name,
      password,
      referral_code: newCode,
      referred_by: referrerEmail,
    });

    // Bootstrap related records
    await Promise.all([
      Profile.create({ created_by: user.email, email: user.email, username: full_name }),
      Points.create({ created_by: user.email }),
      Subscription.create({ created_by: user.email }),
    ]);

    // Track the referral (pending until referred user subscribes)
    if (referrerEmail) {
      Referral.create({ referrer_email: referrerEmail, referred_email: user.email }).catch(() => {});
    }

    // Welcome notification
    notify(user.email,
      `Welcome to 7%, ${full_name}! 🎉 Start by logging your first workout or meal to earn points.`,
      'welcome'
    );

    // Welcome email - never blocks the response
    sendEmail({
      to: user.email,
      subject: 'Welcome to 7%! 🎉',
      from_name: '7% Team',
      body: `Hi ${full_name},\n\nWelcome to 7%! We're excited to have you on board.\n\nStart by logging your first workout or meal to earn points and kick off your streak.\n\n- The 7% Team`,
      html: buildEmail({
        title: `Welcome to 7%, ${full_name}!`,
        preheader: 'Your account is ready - start logging your first workout or meal to earn points.',
        icon: '🎉',
        body: `
          <p style="margin:0 0 16px 0;color:#ffffff;font-weight:600;font-size:16px;">Hi ${full_name},</p>
          <p style="margin:0 0 16px 0;">Welcome to <strong style="color:#f59e0b;">7%</strong>! We're excited to have you on board.</p>
          <p style="margin:0 0 0 0;">Start by logging your first workout or meal to earn points and kick off your streak.</p>
        `,
        buttonText: 'Go to Dashboard',
        buttonUrl: `${process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? 'https://7percent.info' : 'http://localhost:5173')}/dashboard`,
      }),
    }).catch((err) => console.error('[register] Welcome email error:', err.message));

    // Founder badge - check eligibility async, never block the response
    const totalUsers = await User.countDocuments({});
    setImmediate(() => maybeAwardFounderBadge(user.email, totalUsers));

    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, email: user.email, full_name: user.full_name } });
  } catch (err) {
    console.error('[register]', err);
    const isDbError = err.name === 'MongoNetworkError' || err.name === 'AggregateError' || err.message?.includes('connect');
    const message = isDbError
      ? 'Service temporarily unavailable. Please try again shortly.'
      : err.name === 'ValidationError'
        ? 'Please check your details and try again.'
        : 'Could not create your account. Please try again.';
    res.status(500).json({ error: message });
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
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me  - replaces base44.auth.me()
router.get('/me', protect, async (req, res) => {
  try {
    const user = req.user;
    res.json({ id: user._id, email: user.email, full_name: user.full_name });
  } catch (err) {
    console.error('[auth/me]', err.message);
    res.status(500).json({ error: 'Could not load your profile. Please refresh the page.' });
  }
});

// POST /api/auth/reset-password  - token from password reset email
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
    console.error('[reset-password]', err.message);
    res.status(500).json({ error: 'Could not reset your password. Please try again or request a new link.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', protect, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(current_password))) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    user.password = new_password;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error('[change-password]', err.message);
    res.status(500).json({ error: 'Could not update your password. Please try again.' });
  }
});

module.exports = router;
