/**
 * getFriendsList
 * type: 'accepted' | 'pending'
 */
const Friendship = require('../../models/Friendship');
const Profile = require('../../models/Profile');
const Points = require('../../models/Points');

module.exports = async (req, res) => {
  const user = req.user;
  const type = req.body?.type || 'accepted';

  if (type === 'pending') {
    const pendingFriendships = await Friendship.find({
      $or: [{ requester_email: user.email }, { receiver_email: user.email }],
      status: 'pending',
    }).lean();

    const otherEmails = pendingFriendships.map(f =>
      f.requester_email === user.email ? f.receiver_email : f.requester_email
    );

    const profiles = otherEmails.length
      ? await Profile.find({ created_by: { $in: otherEmails } }).lean()
      : [];
    const profileMap = {};
    profiles.forEach(p => { profileMap[p.created_by] = p; });

    const friends = pendingFriendships.map((f) => {
      const isRequester = f.requester_email === user.email;
      const otherEmail = isRequester ? f.receiver_email : f.requester_email;
      const profile = profileMap[otherEmail] || {};
      return {
        id: f._id.toString(),
        email: otherEmail,
        is_requester: isRequester,
        friend_name: profile.username || otherEmail.split('@')[0],
        username: profile.username || otherEmail.split('@')[0],
        profile_picture: profile.profile_picture_url || null,
      };
    });

    return res.json({ success: true, friends });
  }

  // ── accepted friends ─────────────────────────────────────────────────────
  const friendships = await Friendship.find({
    $or: [{ requester_email: user.email }, { receiver_email: user.email }],
    status: 'accepted',
  }).lean();

  const friendEmails = friendships.map((f) =>
    f.requester_email === user.email ? f.receiver_email : f.requester_email
  );

  const [profiles, pointsRecords] = friendEmails.length ? await Promise.all([
    Profile.find({ created_by: { $in: friendEmails } }).lean(),
    Points.find({ created_by: { $in: friendEmails } }).lean(),
  ]) : [[], []];

  const profileMap = {};
  profiles.forEach((p) => { profileMap[p.created_by] = p; });
  const pointsMap = {};
  pointsRecords.forEach((p) => { pointsMap[p.created_by] = p; });

  const friends = friendEmails.map((email) => ({
    id: friendships.find(f =>
      f.requester_email === email || f.receiver_email === email
    )?._id.toString(),
    email,
    // Profile stores picture as profile_picture_url
    username: profileMap[email]?.username || email.split('@')[0],
    avatar_url: profileMap[email]?.profile_picture_url || profileMap[email]?.avatar_url || null,
    level: pointsMap[email]?.level || 1,
    weekly_points: pointsMap[email]?.weekly_points || 0,
    fitness_goal: profileMap[email]?.fitness_goal,
  }));

  res.json({ success: true, friends });
};
