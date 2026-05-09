/**
 * Branded HTML email template matching the 7% app dark theme.
 * All styles are inlined for maximum email client compatibility.
 *
 * @param {{ title: string, preheader?: string, body: string, buttonText?: string, buttonUrl?: string, footer?: string }} opts
 */
function buildEmail({ title, preheader = '', body, buttonText, buttonUrl, footer }) {
  const btn = buttonText && buttonUrl ? `
    <tr>
      <td align="center" style="padding: 28px 0 8px 0;">
        <a href="${buttonUrl}"
           target="_blank"
           style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;letter-spacing:0.02em;">
          ${buttonText}
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:8px 0 0 0;">
        <p style="margin:0;font-size:12px;color:#71717a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          Button not working? Copy this link into your browser:<br>
          <a href="${buttonUrl}" style="color:#f59e0b;word-break:break-all;">${buttonUrl}</a>
        </p>
      </td>
    </tr>` : '';

  const footerText = footer || 'You received this email because an action was taken on your 7% account.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;">
  <!-- preheader (hidden preview text) -->
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</span>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#09090b;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#18181b;border-radius:16px;border:1px solid #27272a;overflow:hidden;">

          <!-- Header bar -->
          <tr>
            <td style="background:linear-gradient(135deg,#1c1400,#18181b);padding:28px 40px 24px 40px;border-bottom:1px solid #27272a;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:28px;font-weight:900;color:#f59e0b;letter-spacing:-0.5px;">7%</span>
                    <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;font-weight:600;color:#71717a;letter-spacing:0.15em;text-transform:uppercase;margin-left:10px;">TEAM</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">

                <!-- Title -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <h1 style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:22px;font-weight:800;color:#ffffff;line-height:1.3;">
                      ${title}
                    </h1>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding-bottom:24px;">
                    <div style="height:2px;background:linear-gradient(90deg,#f59e0b,transparent);border-radius:2px;"></div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:1.7;color:#a1a1aa;">
                    ${body}
                  </td>
                </tr>

                <!-- Button -->
                ${btn}

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0f0f10;border-top:1px solid #27272a;padding:20px 40px;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;color:#52525b;line-height:1.6;text-align:center;">
                ${footerText}<br>
                <span style="color:#3f3f46;">© ${new Date().getFullYear()} 7% · team@7percent.info</span>
              </p>
            </td>
          </tr>

        </table>
        <!-- / Card -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { buildEmail };
