/**
 * Email service using Nodemailer.
 * Configure SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS in server/.env
 */

const nodemailer = require('nodemailer');

let transporter = null;

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,   // SSL on 465, STARTTLS on 587
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,  // accept IONOS/self-signed certs
    },
    connectionTimeout: 15000,
    socketTimeout: 20000,
  });
}

/**
 * @param {{ to: string, subject: string, body: string, html?: string, from_name?: string }} opts
 */
async function sendEmail({ to, subject, body, html, from_name = '7% Team' }) {
  if (!transporter) {
    transporter = createTransporter();
  }

  // Fallback to Ethereal test account when SMTP is not configured
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('[email] No SMTP configured - using Ethereal:', testAccount.web);
  }

  const fromAddr = process.env.SMTP_USER || 'team@7percent.info';

  try {
    const info = await transporter.sendMail({
      from: `"${from_name}" <${fromAddr}>`,
      to,
      subject,
      text: body,   // plain-text fallback for email clients that don't render HTML
      html: html || undefined,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('[email] Ethereal preview:', previewUrl);
    } else {
      console.log('[email] Sent to', to, '-', subject);
    }
  } catch (err) {
    console.error('[email] Send failed:', err.message);
    transporter = null;
    throw err;
  }
}

module.exports = { sendEmail };
