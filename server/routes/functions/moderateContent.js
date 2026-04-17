/**
 * Handles: sanitizeChat, moderateProfilePicture
 * Basic content moderation helpers.
 */

// Simple word-list for chat — extend as needed
const BLOCKED_WORDS = ['spam', 'hate', 'abuse'];

// ── sanitizeChat ───────────────────────────────────────────────────────────────
async function sanitizeChat(req, res) {
  const { message = '' } = req.body;
  const lower = message.toLowerCase();
  const blocked = BLOCKED_WORDS.some(w => lower.includes(w));

  res.json({
    data: {
      safe: !blocked,
      sanitized: blocked ? '[Message removed by moderation]' : message,
    },
  });
}

// ── moderateProfilePicture ─────────────────────────────────────────────────────
async function moderateProfilePicture(req, res) {
  // Without an image recognition service we approve all uploads;
  // integrate a vision model here if needed.
  res.json({ data: { approved: true, reason: 'ok' } });
}

module.exports = { sanitizeChat, moderateProfilePicture };
