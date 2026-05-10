/**
 * Lightweight helper to create in-app notifications.
 * All errors are swallowed - notifications are non-critical.
 */
const Notification = require('../models/Notification');

/**
 * @param {string} email - The user's email (created_by)
 * @param {string} message - The notification text
 * @param {string} [type] - One of: welcome, workout_completed, streak_milestone,
 *                          coaching_ready, subscription, goal_achieved, general
 * @param {object} [metadata]
 */
async function notify(email, message, type = 'general', metadata = {}) {
  try {
    await Notification.create({ created_by: email, message, type, read: false, metadata });
  } catch (err) {
    console.error('[notify] Failed:', err.message);
  }
}

module.exports = { notify };
