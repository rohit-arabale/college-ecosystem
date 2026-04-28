/**
 * Chat Controller
 * Handles conversations and messages between students
 */

const { Message, Conversation } = require("../models/Message");
const User = require("../models/User");

const isConversationParticipant = (conversation, userId) =>
  conversation.participants.some(
    (participantId) => participantId.toString() === userId.toString()
  );

// ─── @route   GET /api/chat/conversations ────────────────────────────────────
// Get all conversations for the logged-in user
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name avatar isOnline lastSeen department")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    // Format each conversation with the "other" user's info
    const formatted = conversations.map((conv) => {
      const other = conv.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      );
      const unread = conv.unreadCounts?.get(req.user._id.toString()) || 0;
      return {
        _id: conv._id,
        otherUser: other,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: unread,
      };
    });

    res.json({ success: true, conversations: formatted });
  } catch (error) {
    console.error("Get Conversations Error:", error);
    res.status(500).json({ success: false, message: "Error fetching conversations." });
  }
};

// ─── @route   GET /api/chat/conversations/:userId ────────────────────────────
// Get or create a conversation with a specific user
const getOrCreateConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const myId = req.user._id;

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [myId, otherUserId] },
    }).populate("participants", "name avatar isOnline lastSeen department college");

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [myId, otherUserId],
      });
      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "name avatar isOnline lastSeen department college"
      );
    }

    const otherUser = conversation.participants.find(
      (p) => p._id.toString() !== myId.toString()
    );

    res.json({ success: true, conversationId: conversation._id, otherUser });
  } catch (error) {
    console.error("Get Conversation Error:", error);
    res.status(500).json({ success: false, message: "Error getting conversation." });
  }
};

// ─── @route   GET /api/chat/messages/:conversationId ─────────────────────────
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is in the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !isConversationParticipant(conversation, req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const messages = await Message.find({ conversationId })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Mark messages as read
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCounts.${req.user._id}`]: 0 },
    });

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching messages." });
  }
};

// ─── @route   POST /api/chat/messages ────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    if (!text || !conversationId) {
      return res.status(400).json({ success: false, message: "Message and conversation required." });
    }

    // Verify user is in the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !isConversationParticipant(conversation, req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // Save message to database
    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      text,
      readBy: [req.user._id],
    });

    const populatedMsg = await message.populate("sender", "name avatar");

    // Update conversation's last message
    const otherParticipants = conversation.participants.filter(
      (p) => p.toString() !== req.user._id.toString()
    );

    // Increment unread count for other participants
    const updateObj = {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    };
    otherParticipants.forEach((participantId) => {
      const key = `unreadCounts.${participantId}`;
      updateObj[key] = (conversation.unreadCounts?.get(participantId.toString()) || 0) + 1;
    });

    await Conversation.findByIdAndUpdate(conversationId, { $set: updateObj });

    res.status(201).json({ success: true, message: populatedMsg });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ success: false, message: "Error sending message." });
  }
};

// ─── @route   GET /api/chat/users ────────────────────────────────────────────
// Get all users to start a new chat
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("name avatar department college isOnline lastSeen")
      .sort({ name: 1 });

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users." });
  }
};

module.exports = { getConversations, getOrCreateConversation, getMessages, sendMessage, getAllUsers };
