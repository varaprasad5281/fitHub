const User = require('../../models/User');
const Referral = require('../../models/Referral');

module.exports = async (req, res) => {
  const userEmail = req.user.email;

  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });

  const [completed, pending] = await Promise.all([
    Referral.countDocuments({ referrer_email: userEmail, status: 'completed' }),
    Referral.countDocuments({ referrer_email: userEmail, status: 'pending' }),
  ]);

  const clientUrl = process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? 'https://7percent.info' : 'http://localhost:5173');
  const referralLink = `${clientUrl}/Onboarding?ref=${user.referral_code || ''}`;

  res.json({
    referral_code: user.referral_code || null,
    referral_link: referralLink,
    completed,
    pending,
    rewards_granted: user.referral_rewards_granted || [],
  });
};
