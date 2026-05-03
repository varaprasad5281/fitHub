/**
 * Replaces: base44.integrations.Core.SendEmail({ to, subject, body, from_name })
 */
const { sendEmail } = require('../../services/email');

module.exports = async (req, res) => {
  const { to, subject, body, from_name } = req.body;
  if (!to || !subject || !body) return res.status(400).json({ error: 'to, subject, and body are required' });

  try {
    await sendEmail({ to, subject, body, from_name });
    res.json({ success: true });
  } catch (err) {
    console.error('[sendEmail] Failed:', err.message);
    res.status(500).json({ error: 'Failed to send email', detail: err.message });
  }
};
