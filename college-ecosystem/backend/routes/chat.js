const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getConversations, getOrCreateConversation, getMessages, sendMessage, getAllUsers,
} = require("../controllers/chatController");

router.get("/conversations", protect, getConversations);
router.get("/conversations/:userId", protect, getOrCreateConversation);
router.get("/messages/:conversationId", protect, getMessages);
router.post("/messages", protect, sendMessage);
router.get("/users", protect, getAllUsers);

module.exports = router;
