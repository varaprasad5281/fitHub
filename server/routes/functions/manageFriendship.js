/**
 * Handles: friendRequest, manageFriendRequest, searchUsers, suggestedFriends, getFriendComparison
 */

const Friendship = require('../../models/Friendship');
const Profile = require('../../models/Profile');
const Points = require('../../models/Points');
const User = require('../../models/User');
const checkAndAwardBadges = require('../../utils/checkAndAwardBadges');

// ── friendRequest ──────────────────────────────────────────────────────────────
// action: 'send' | 'accept' | 'reject' | 'remove'
async function friendRequest(req, res) {
  const userEmail = req.user.email;
  const { target_email, action = 'send' } = req.body;

  if (!target_email) return res.status(400).json({ error: 'target_email is required' });
  if (target_email === userEmail) return res.status(400).json({ error: 'Cannot friend yourself' });

  if (action === 'send') {
    const existing = await Friendship.findOne({
      $or: [
        { requester_email: userEmail, receiver_email: target_email },
        { requester_email: target_email, receiver_email: userEmail },
      ],
    });
    if (existing) return res.json({ data: existing, message: 'Request already exists' });

    const friendship = await Friendship.create({ requester_email: userEmail, receiver_email: target_email });
    return res.json({ data: friendship });
  }

  if (action === 'accept') {
    const req_ = await Friendship.findOneAndUpdate(
      { requester_email: target_email, receiver_email: userEmail, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );
    if (!req_) return res.status(404).json({ error: 'Friend request not found' });
    // Check badges for both users (both now have +1 friend)
    checkAndAwardBadges(userEmail).catch(() => {});
    checkAndAwardBadges(target_email).catch(() => {});
    return res.json({ data: req_ });
  }

  if (action === 'reject') {
    await Friendship.findOneAndDelete({ requester_email: target_email, receiver_email: userEmail, status: 'pending' });
    return res.json({ success: true });
  }

  if (action === 'remove') {
    await Friendship.findOneAndDelete({
      $or: [
        { requester_email: userEmail, receiver_email: target_email },
        { requester_email: target_email, receiver_email: userEmail },
      ],
    });
    return res.json({ success: true });
  }

  res.status(400).json({ error: `Unknown action: ${action}` });
}

// ── manageFriendRequest ────────────────────────────────────────────────────────
// Same as friendRequest but with slightly different param names for compatibility
async function manageFriendRequest(req, res) {
  // Normalise params: some callers use requestId + action
  const { requestId, request_id, action, target_email } = req.body;
  const id = requestId || request_id;

  if (id && (action === 'accept' || action === 'reject')) {
    const friendship = await Friendship.findById(id);
    if (!friendship) return res.status(404).json({ error: 'Request not found' });

    if (action === 'accept') {
      friendship.status = 'accepted';
      await friendship.save();
      // Check badges for both sides of the friendship
      checkAndAwardBadges(friendship.requester_email).catch(() => {});
      checkAndAwardBadges(friendship.receiver_email).catch(() => {});
    } else {
      await friendship.deleteOne();
    }
    return res.json({ success: true, data: friendship });
  }

  // Fall through to friendRequest logic
  return friendRequest(req, res);
}

// ── searchUsers ────────────────────────────────────────────────────────────────
async function searchUsers(req, res) {
  const userEmail = req.user.email;
  const { query = '', limit = 20 } = req.body;

  if (!query.trim()) return res.json({ data: [] });

  const regex = new RegExp(query.trim(), 'i');

  // Search profiles (users who completed onboarding)
  const profiles = await Profile.find({
    created_by: { $ne: userEmail },
    $or: [{ username: regex }, { email: regex }, { created_by: regex }],
  }).limit(Number(limit));

  const profileEmails = new Set(profiles.map(p => p.created_by));

  // Also search User collection for registered users who have no profile yet
  const users = await User.find({
    email: { $ne: userEmail, $nin: [...profileEmails] },
    $or: [{ email: regex }, { full_name: regex }],
  }).limit(Number(limit));

  // Get existing friendship statuses
  const friends = await Friendship.find({
    $or: [{ requester_email: userEmail }, { receiver_email: userEmail }],
  });

  const friendMap = {};
  friends.forEach(f => {
    const other = f.requester_email === userEmail ? f.receiver_email : f.requester_email;
    friendMap[other] = f.status;
  });

  const results = [
    ...profiles.map(p => {
      const obj = p.toObject();
      // Strip the raw email field - UI uses username; created_by is used only for friend requests
      delete obj.email;
      return { ...obj, friendship_status: friendMap[p.created_by] || null };
    }),
    // Users without a profile - only expose display name and the opaque created_by key
    ...users.map(u => ({
      created_by: u.email,
      username: null,
      full_name: u.full_name,
      // email intentionally omitted from response
      friendship_status: friendMap[u.email] || null,
    })),
  ];

  res.json({ data: results });
}

// ── suggestedFriends ───────────────────────────────────────────────────────────
async function suggestedFriends(req, res) {
  const userEmail = req.user.email;

  // Get current connections
  const existing = await Friendship.find({
    $or: [{ requester_email: userEmail }, { receiver_email: userEmail }],
  });
  const connectedEmails = new Set(
    existing.flatMap(f => [f.requester_email, f.receiver_email]).filter(e => e !== userEmail)
  );
  connectedEmails.add(userEmail);

  // Get user profile for matching
  const myProfile = await Profile.findOne({ created_by: userEmail });

  // Find profiles with similar fitness goal, excluding connected users
  const query = { created_by: { $nin: [...connectedEmails] } };
  if (myProfile?.fitness_goal) query.fitness_goal = myProfile.fitness_goal;

  const suggestions = await Profile.find(query).limit(10);
  res.json({ data: suggestions });
}

// ── getFriendComparison ────────────────────────────────────────────────────────
async function getFriendComparison(req, res) {
  const userEmail = req.user.email;
  const { friend_email } = req.body;
  if (!friend_email) return res.status(400).json({ error: 'friend_email is required' });

  const [myPoints, friendPoints] = await Promise.all([
    Points.findOne({ created_by: userEmail }),
    Points.findOne({ created_by: friend_email }),
  ]);

  res.json({
    data: {
      me: { email: userEmail, total_points: myPoints?.total_points || 0, weekly_points: myPoints?.weekly_points || 0 },
      friend: { email: friend_email, total_points: friendPoints?.total_points || 0, weekly_points: friendPoints?.weekly_points || 0 },
    },
  });
}

module.exports = { friendRequest, manageFriendRequest, searchUsers, suggestedFriends, getFriendComparison };
