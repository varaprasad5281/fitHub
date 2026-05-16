/**
 * Email service.
 * Priority: Resend API (RESEND_API_KEY) → Nodemailer SMTP (SMTP_HOST + credentials)
 *
 * Resend setup  : sign up at resend.com, get an API key, set RESEND_API_KEY in .env
 * SMTP setup    : set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASSWORD in .env
 */

const nodemailer = require('nodemailer');

let _smtpTransporter = null;

function getSmtpTransporter() {
  if (_smtpTransporter) return _smtpTransporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  _smtpTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    socketTimeout: 20000,
  });

  return _smtpTransporter;
}

async function sendViaResend({ to, subject, body, html, from_name, fromAddr }) {
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: `${from_name} <${fromAddr}>`,
    to,
    subject,
    text: body,
    html: html || undefined,
  });

  if (error) throw new Error(error.message || JSON.stringify(error));
  console.log('[email] Sent via Resend to', to);
}

async function sendViaSmtp({ to, subject, body, html, from_name, fromAddr }) {
  const transporter = getSmtpTransporter();
  if (!transporter) {
    throw new Error(
      'No email provider configured. Add RESEND_API_KEY (recommended) or SMTP credentials to server/.env'
    );
  }

  try {
    await transporter.sendMail({
      from: `"${from_name}" <${fromAddr}>`,
      to,
      subject,
      text: body,
      html: html || undefined,
    });
    console.log('[email] Sent via SMTP to', to);
  } catch (err) {
    _smtpTransporter = null; // reset so next call retries
    throw err;
  }
}

/**
 * @param {{ to: string, subject: string, body: string, html?: string, from_name?: string }} opts
 */
async function sendEmail({ to, subject, body, html, from_name = '7% Team' }) {
  const fromAddr = process.env.SMTP_USER || process.env.RESEND_FROM || 'team@7percent.info';

  if (process.env.RESEND_API_KEY) {
    return sendViaResend({ to, subject, body, html, from_name, fromAddr });
  }

  return sendViaSmtp({ to, subject, body, html, from_name, fromAddr });
}

module.exports = { sendEmail };
