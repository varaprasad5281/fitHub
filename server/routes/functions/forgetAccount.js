/**
 * forgetAccount - delete or anonymize a user account.
 * deleteMode: 'remove_from_quick_login' | 'delete_account'
 */

const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Points = require('../../models/Points');
const Subscription = require('../../models/Subscription');

module.exports = async (req, res) => {
  const { email, deleteMode } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  if (deleteMode === 'delete_account') {
    // Only allow self-deletion
    if (req.user.email !== email) {
      return res.status(403).json({ error: 'You can only delete your own account' });
    }

    await Promise.all([
      User.findOneAndDelete({ email }),
      Profile.findOneAndDelete({ created_by: email }),
      Points.findOneAndDelete({ created_by: email }),
      Subscription.findOneAndDelete({ created_by: email }),
    ]);

    return res.json({ success: true, message: 'Account permanently deleted.' });
  }

  // 'remove_from_quick_login' - no action needed with JWT auth
  // (quick login list was a Base44-specific feature)
  res.json({ success: true, message: 'Removed from quick login list.' });
};
