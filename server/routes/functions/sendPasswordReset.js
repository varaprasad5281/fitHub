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

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset your 7% password',
    from_name: '7% Team',
    body: `Hi ${user.full_name},\n\nYou requested a password reset. Click the link below to set a new password:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.\n\n— The 7% Team`,
  });

  res.json({ success: true });
};
