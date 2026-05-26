/**
 * Sends a password reset email with a one-time link.
 * Called by PasswordResetForm on the frontend.
 *
 * POST /api/functions/sendPasswordReset
 * Body: { email }
 */

const crypto = require('crypto');
const User = require('../../models/User');
const { sendEmail } = require('../../services/email');
const { buildEmail } = require('../../utils/emailTemplate');

module.exports = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  // Always respond with success to avoid leaking whether an account exists
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.json({ success: true });
  }

  // Generate a secure random token (hex, 32 bytes)
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.passwordResetToken = token;
  user.passwordResetExpires = expires;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? 'https://7percent.info' : 'http://localhost:5173')}/reset-password?token=${token}`;

  try {
    await sendEmail({
      to: email,
      subject: 'Reset your 7% password',
      from_name: '7% Team',
      body: `Hi ${user.full_name},\n\nYou requested a password reset. Click the link below:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.\n\n- The 7% Team`,
      html: buildEmail({
        title: 'Reset Your Password',
        preheader: 'Click the button below to set a new password for your 7% account.',
        icon: '🔐',
        body: `
          <p style="margin:0 0 16px 0;color:#ffffff;font-weight:600;font-size:16px;">Hi ${user.full_name},</p>
          <p style="margin:0 0 16px 0;">We received a request to reset the password for your <strong style="color:#f59e0b;">7%</strong> account.</p>
          <p style="margin:0 0 0 0;">Click the button below to choose a new password. If you didn't request this, you can safely ignore this email — your password won't change.</p>
        `,
        infoBox: '⏱ This link expires in 1 hour and can only be used once.',
        buttonText: 'Reset My Password',
        buttonUrl: resetUrl,
        footer: 'This password reset link expires in 1 hour and can only be used once.',
      }),
    });
  } catch (emailErr) {
    console.error('[sendPasswordReset] SMTP error:', emailErr.message);
    return res.status(500).json({
      error: `Email delivery failed: ${emailErr.message}`,
    });
  }

  res.json({ success: true });
};
