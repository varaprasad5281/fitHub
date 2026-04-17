/**
 * Replaces: chatMessage
 */
const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const Friendship = require('../../models/Friendship');

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
  const { action, conversation_id, recipient_email, body } = req.body;

  // Send message
  if (action === 'send' || !action) {
    if (!conversation_id || !body) return res.status(400).json({ error: 'conversation_id and body required' });

    const conversation = await Conversation.findById(conversation_id);
    if (!conversation || !conversation.participant_emails.includes(user.email)) {
      return res.status(403).json({ error: 'Not a participant in this conversation' });
    }

    const cleanBody = sanitize(body);
    const message = await Message.create({ conversation_id, sender_email: user.email, body: cleanBody });
    await conversation.updateOne({ last_message_at: new Date(), last_message_preview: cleanBody.substring(0, 60) });

    return res.status(201).json({ success: true, message });
  }

  // Get messages for a conversation
  if (action === 'list') {
    if (!conversation_id) return res.status(400).json({ error: 'conversation_id required' });
    const conversation = await Conversation.findById(conversation_id);
    if (!conversation || !conversation.participant_emails.includes(user.email)) {
      return res.status(403).json({ error: 'Not a participant' });
    }
    const messages = await Message.find({ conversation_id }).sort({ createdAt: 1 }).lean();
    return res.json({ success: true, messages });
  }

  // Initialize conversation
  if (action === 'init') {
    if (!recipient_email) return res.status(400).json({ error: 'recipient_email required' });

    // Must be friends
    const friendship = await Friendship.findOne({
      $or: [
        { requester_email: user.email, receiver_email: recipient_email, status: 'accepted' },
        { requester_email: recipient_email, receiver_email: user.email, status: 'accepted' },
      ],
    });
    if (!friendship) return res.status(403).json({ error: 'You must be friends to message' });

    let conversation = await Conversation.findOne({ participant_emails: { $all: [user.email, recipient_email] } });
    if (!conversation) {
      conversation = await Conversation.create({ participant_emails: [user.email, recipient_email] });
    }
    return res.json({ success: true, conversation });
  }

  res.status(400).json({ error: 'Unknown action' });
};
