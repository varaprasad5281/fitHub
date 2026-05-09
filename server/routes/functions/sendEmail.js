/**
 * Replaces: base44.integrations.Core.SendEmail({ to, subject, body, from_name })
 */
const { sendEmail } = require('../../services/email');
const { buildEmail } = require('../../utils/emailTemplate');

function textToHtml(text) {
  return text
    .split(/\n{2,}/)
    .map(para => `<p style="margin:0 0 14px 0;">${para.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

module.exports = async (req, res) => {
  const { to, subject, body, from_name } = req.body;
  if (!to || !subject || !body) return res.status(400).json({ error: 'to, subject, and body are required' });

  const html = buildEmail({
    title: subject,
    preheader: body.replace(/\n/g, ' ').slice(0, 120),
    body: textToHtml(body),
  });

  try {
    await sendEmail({ to, subject, body, html, from_name });
    res.json({ success: true });
  } catch (err) {
    console.error('[sendEmail] Failed:', err.message);
    res.status(500).json({ error: 'Failed to send email', detail: err.message });
  }
};
