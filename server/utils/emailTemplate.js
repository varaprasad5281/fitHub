/**
 * Branded HTML email template — 7% app theme.
 * Dark background, amber/gold accents, fully inline-styled for all email clients.
 *
 * @param {{
 *   title:       string,
 *   preheader?:  string,
 *   body:        string,          — already-formatted HTML paragraphs
 *   buttonText?: string,
 *   buttonUrl?:  string,
 *   icon?:       string,          — emoji shown in the hero circle (e.g. '🔐', '✉️')
 *   infoBox?:    string,          — optional highlighted info block (plain text)
 *   footer?:     string,
 * }} opts
 */
function buildEmail({ title, preheader = '', body, buttonText, buttonUrl, icon, infoBox, footer }) {

  // ── CTA button ────────────────────────────────────────────────────────────
  const btn = buttonText && buttonUrl ? `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 8px;">
      <tr>
        <td align="center">
          <a href="${buttonUrl}" target="_blank"
             style="display:inline-block;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;font-weight:800;text-decoration:none;padding:16px 44px;border-radius:100px;letter-spacing:0.03em;box-shadow:0 4px 24px rgba(245,158,11,0.35);">
            ${buttonText} &rarr;
          </a>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0 0;">
      <tr>
        <td align="center">
          <p style="margin:0;font-size:12px;color:#52525b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;">
            Button not working? Paste this URL into your browser:<br>
            <a href="${buttonUrl}" style="color:#f59e0b;word-break:break-all;text-decoration:none;">${buttonUrl}</a>
          </p>
        </td>
      </tr>
    </table>` : '';

  // ── Optional info/warning box ─────────────────────────────────────────────
  const infoBlock = infoBox ? `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
      <tr>
        <td style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.25);border-left:3px solid #f59e0b;border-radius:8px;padding:14px 18px;">
          <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;color:#d4a20a;line-height:1.6;">
            ${infoBox}
          </p>
        </td>
      </tr>
    </table>` : '';

  // ── Icon hero ─────────────────────────────────────────────────────────────
  const iconBlock = icon ? `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;width:64px;height:64px;background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(217,119,6,0.08));border:1px solid rgba(245,158,11,0.3);border-radius:18px;font-size:30px;line-height:64px;text-align:center;">
            ${icon}
          </div>
        </td>
      </tr>
    </table>` : '';

  const footerText = footer || 'You received this email because an action was taken on your 7% account.';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${title}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#09090b;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;</div>

  <!-- Page wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#09090b;background-image:radial-gradient(ellipse at top,#1c1400 0%,#09090b 60%);">
    <tr>
      <td align="center" style="padding:48px 16px 64px;">

        <!-- ═══ CARD ═══ -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"
               style="width:100%;max-width:560px;border-collapse:separate;">

          <!-- Top amber glow bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,transparent,#f59e0b,#d97706,#f59e0b,transparent);border-radius:3px 3px 0 0;"></td>
          </tr>

          <!-- ── HEADER ──────────────────────────────────────────── -->
          <tr>
            <td style="background:linear-gradient(170deg,#1c1400 0%,#18181b 55%,#111111 100%);
                       padding:30px 44px 26px;
                       border-left:1px solid #2a2a2a;
                       border-right:1px solid #2a2a2a;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <!-- Wordmark -->
                    <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                                 font-size:38px;font-weight:900;
                                 background:linear-gradient(135deg,#fbbf24,#f59e0b,#d97706);
                                 -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                                 color:#f59e0b;letter-spacing:-2px;line-height:1;">7%</span>
                    <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                                 font-size:11px;font-weight:600;color:#3f3f46;
                                 letter-spacing:0.22em;text-transform:uppercase;
                                 margin-left:14px;vertical-align:middle;">7 Percent</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:6px;">
                    <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                                 font-size:11px;color:#3f3f46;letter-spacing:0.18em;text-transform:uppercase;">
                      Discipline &middot; Progress &middot; Consistency
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Amber divider line -->
          <tr>
            <td style="background:#18181b;border-left:1px solid #2a2a2a;border-right:1px solid #2a2a2a;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(245,158,11,0.6),rgba(245,158,11,0.9),rgba(245,158,11,0.6),transparent);"></div>
            </td>
          </tr>

          <!-- ── BODY ────────────────────────────────────────────── -->
          <tr>
            <td style="background:#18181b;
                       padding:40px 44px 44px;
                       border-left:1px solid #2a2a2a;
                       border-right:1px solid #2a2a2a;">

              <!-- Icon -->
              ${iconBlock}

              <!-- Title -->
              <h1 style="margin:0 0 20px;
                          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                          font-size:26px;font-weight:800;color:#ffffff;
                          line-height:1.2;letter-spacing:-0.4px;">
                ${title}
              </h1>

              <!-- Title underline accent -->
              <div style="width:48px;height:3px;background:linear-gradient(90deg,#f59e0b,#d97706);border-radius:2px;margin:0 0 28px;"></div>

              <!-- Body text -->
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                           font-size:15px;line-height:1.8;color:#a1a1aa;">
                ${body}
              </div>

              <!-- Info box (optional) -->
              ${infoBlock}

              <!-- CTA button -->
              ${btn}

            </td>
          </tr>

          <!-- ── DIVIDER ──────────────────────────────────────────── -->
          <tr>
            <td style="background:#0f0f11;border-left:1px solid #2a2a2a;border-right:1px solid #2a2a2a;">
              <div style="height:1px;background:#1f1f23;"></div>
            </td>
          </tr>

          <!-- ── FOOTER ──────────────────────────────────────────── -->
          <tr>
            <td style="background:#0f0f11;
                       padding:24px 44px 28px;
                       border-left:1px solid #2a2a2a;
                       border-right:1px solid #2a2a2a;
                       border-bottom:1px solid #2a2a2a;
                       border-radius:0 0 12px 12px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                <!-- Footer text -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                               font-size:12px;color:#52525b;line-height:1.7;text-align:center;">
                      ${footerText}
                    </p>
                  </td>
                </tr>

                <!-- Thin separator -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <div style="width:40px;height:1px;background:#27272a;margin:0 auto;"></div>
                  </td>
                </tr>

                <!-- Brand + links -->
                <tr>
                  <td align="center">
                    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                               font-size:11px;color:#3f3f46;text-align:center;line-height:1.8;">
                      <span style="color:#f59e0b;font-weight:700;">7%</span>
                      &nbsp;&middot;&nbsp;
                      <a href="https://7percent.info" target="_blank"
                         style="color:#52525b;text-decoration:none;">7percent.info</a>
                      &nbsp;&middot;&nbsp;
                      <a href="mailto:team@7percent.info"
                         style="color:#52525b;text-decoration:none;">team@7percent.info</a>
                    </p>
                    <p style="margin:4px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                               font-size:11px;color:#27272a;text-align:center;">
                      &copy; ${year} 7 Percent. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

        </table>
        <!-- ═══ / CARD ═══ -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

module.exports = { buildEmail };
