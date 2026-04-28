/**
 * Message & Conversation Models
 * Handles the chat system between students
 */

const mongoose = require("mongoose");

// ─── Single Message ───────────────────────────────────────────────────────────
const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Message cannot be empty"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Future: support file attachments
    attachment: {
      url: { type: String },
      type: { type: String }, // "image", "pdf", etc.
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Conversation (between 2 users) ──────────────────────────────────────────
const conversationSchema = new mongoose.Schema(
  {
    // Exactly two participants for a DM conversation
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: { type: Date, default: Date.now },
    // Track unread counts per user
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// Helper: generate a unique room ID from two user IDs (sorted for consistency)
conversationSchema.statics.getRoomId = function (userId1, userId2) {
  return [userId1.toString(), userId2.toString()].sort().join("_");
};

module.exports = {
  Message: mongoose.model("Message", messageSchema),
  Conversation: mongoose.model("Conversation", conversationSchema),
};
