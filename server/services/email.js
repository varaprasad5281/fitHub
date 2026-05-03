/**
 * Email service — replaces base44.integrations.Core.SendEmail()
 * Uses Nodemailer. Configure SMTP_* env vars or swap for SendGrid/Resend.
 */

const nodemailer = require('nodemailer');

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Use real SMTP (Gmail or any provider)
    const port = parseInt(process.env.SMTP_PORT || '587');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // No SMTP configured — spin up a free Ethereal test account
    // Emails won't be delivered but you can preview them at the URL logged below
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[email] No SMTP configured — using Ethereal test inbox:', testAccount.web);
  }

  return transporter;
}

/**
 * @param {{ to: string, subject: string, body: string, from_name?: string }} opts
 */
async function sendEmail({ to, subject, body, from_name = '7%' }) {
  try {
    const transport = await getTransporter();
    const fromAddr = process.env.SMTP_USER || 'noreply@7percent.app';
    const info = await transport.sendMail({
      from: `"${from_name}" <${fromAddr}>`,
      to,
      subject,
      text: body,
    });
    // If using Ethereal, log the preview URL so you can read the email
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('[email] Preview:', previewUrl);
    } else {
      console.log('[email] Sent to', to, '|', subject);
    }
  } catch (err) {
    console.error('[email] Send failed:', err.message);
    // Reset transporter so next call retries with fresh config
    transporter = null;
    throw err;
  }
}

module.exports = { sendEmail };
