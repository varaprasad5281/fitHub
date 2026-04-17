/**
 * Email service — replaces base44.integrations.Core.SendEmail()
 * Uses Nodemailer. Configure SMTP_* env vars or swap for SendGrid/Resend.
 */

const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * @param {{ to: string, subject: string, body: string, from_name?: string }} opts
 */
async function sendEmail({ to, subject, body, from_name = '7%' }) {
  if (!process.env.SMTP_USER) {
    console.warn('[email] SMTP not configured — skipping email to', to);
    return;
  }
  const transport = getTransporter();
  await transport.sendMail({
    from: `"${from_name}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: body,
  });
  console.log('[email] Sent to', to, '|', subject);
}

module.exports = { sendEmail };
