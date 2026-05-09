/**
 * chatMessage — action: 'init' | 'send' | 'list' | 'conversations' | 'mark_read'
 *
 * action: 'init'          → get or create a 1:1 conversation with a friend
 * action: 'send'          → send a message to an existing conversation
 * action: 'list'          → fetch messages for a conversation (paginated, newest-last)
 * action: 'conversations' → list all conversations for the current user with friend info
 * action: 'mark_read'     → mark all unread messages in a conversation as read
 */

const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const Friendship = require('../../models/Friendship');
const Profile = require('../../models/Profile');

// Basic profanity filter
const BLOCKED_WORDS = ['spam', 'scam'];
function sanitize(text) {
  let clean = text.replace(/<[^>]*>/g, '').trim();
  BLOCKED_WORDS.forEach((w) => {
    clean = clean.replace(new RegExp(w, 'gi'), '***');
  });
  return clean;
}

module.exports = async (req, res) => {
  const user = req.user;
  const { action, conversation_id, recipient_email, body, limit = 50, before } = req.body;

  // ── action: 'conversations' ──────────────────────────────────────────────
  // List all conversations for the current user, enriched with friend profile info
  if (action === 'conversations') {
    const conversations = await Conversation.find({
      participant_emails: user.email,
    })
      .sort({ last_message_at: -1 })
      .lean();

    // Collect all friend emails across all conversations
    const friendEmails = conversations.map(c =>
      c.participant_emails.find(e => e !== user.email)
    ).filter(Boolean);

    // Fetch profiles for all friends in one query
    const profiles = friendEmails.length
      ? await Profile.find({ created_by: { $in: friendEmails } },
          { created_by: 1, username: 1, profile_picture_url: 1 }
        ).lean()
      : [];

    const profileMap = {};
    profiles.forEach(p => { profileMap[p.created_by] = p; });

    // Fetch unread counts per conversation
    const unreadCounts = await Promise.all(
      conversations.map(c =>
        Message.countDocuments({
          conversation_id: c._id,
          sender_email: { $ne: user.email },
          status: 'sent',
        })
      )
    );

    const enriched = conversations.map((c, i) => {
      const friendEmail = c.participant_emails.find(e => e !== user.email);
      const profile = profileMap[friendEmail] || {};
      return {
        _id: c._id,
        friend_email: friendEmail,
        friend_username: profile.username || friendEmail?.split('@')[0] || 'Unknown',
        friend_avatar: profile.profile_picture_url || null,
        last_message_preview: c.last_message_preview || '',
        last_message_at: c.last_message_at,
        unread_count: unreadCounts[i],
      };
    });

    return res.json({ success: true, conversations: enriched });
  }

  // ── action: 'init' ───────────────────────────────────────────────────────
  // Get or create a 1:1 conversation between current user and a friend
  if (action === 'init') {
    if (!recipient_email) return res.status(400).json({ error: 'recipient_email required' });

    // Must be accepted friends
    const friendship = await Friendship.findOne({
      $or: [
        { requester_email: user.email, receiver_email: recipient_email, status: 'accepted' },
        { requester_email: recipient_email, receiver_email: user.email, status: 'accepted' },
      ],
    });
    if (!friendship) return res.status(403).json({ error: 'You must be friends to message' });

    let conversation = await Conversation.findOne({
      participant_emails: { $all: [user.email, recipient_email] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participant_emails: [user.email, recipient_email],
      });
    }
    return res.json({ success: true, conversation });
  }

  // ── action: 'list' ───────────────────────────────────────────────────────
  // Fetch messages for a conversation, oldest-first, with optional cursor pagination
  if (action === 'list') {
    if (!conversation_id) return res.status(400).json({ error: 'conversation_id required' });

    const conversation = await Conversation.findById(conversation_id);
    if (!conversation || !conversation.participant_emails.includes(user.email)) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    const filter = { conversation_id };
    if (before) filter.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(filter)
      .sort({ createdAt: 1 })
      .limit(Number(limit))
      .lean();

    return res.json({ success: true, messages });
  }

  // ── action: 'mark_read' ──────────────────────────────────────────────────
  // Mark all messages in a conversation sent by the other person as read
  if (action === 'mark_read') {
    if (!conversation_id) return res.status(400).json({ error: 'conversation_id required' });

    const conversation = await Conversation.findById(conversation_id);
    if (!conversation || !conversation.participant_emails.includes(user.email)) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    await Message.updateMany(
      { conversation_id, sender_email: { $ne: user.email }, status: 'sent' },
      { $set: { status: 'read' } }
    );
    return res.json({ success: true });
  }

  // ── action: 'report' ─────────────────────────────────────────────────────
  // body = messageId to report
  if (action === 'report') {
    if (!body) return res.status(400).json({ error: 'message id (body) required' });
    const message = await Message.findById(body);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    // Flag the message for review (simple flag field)
    await Message.updateOne({ _id: body }, { $set: { reported: true, reported_by: user.email } });
    return res.json({ success: true });
  }

  // ── action: 'send' (default) ─────────────────────────────────────────────
  if (action === 'send' || !action) {
    if (!conversation_id || !body) {
      return res.status(400).json({ error: 'conversation_id and body required' });
    }

    const conversation = await Conversation.findById(conversation_id);
    if (!conversation || !conversation.participant_emails.includes(user.email)) {
      return res.status(403).json({ error: 'Not a participant in this conversation' });
    }

    const cleanBody = sanitize(body);
    const message = await Message.create({
      conversation_id,
      sender_email: user.email,
      body: cleanBody,
    });
    await conversation.updateOne({
      last_message_at: new Date(),
      last_message_preview: cleanBody.substring(0, 60),
    });

    return res.status(201).json({ success: true, message });
  }

  res.status(400).json({ error: 'Unknown action' });
};
