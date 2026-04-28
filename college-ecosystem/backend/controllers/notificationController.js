/**
 * Notifications Controller
 * Manages in-app notifications for users
 */

const User = require("../models/User");

// ─── @route   GET /api/notifications ─────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notifications");
    const sorted = (user.notifications || [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50); // Last 50 notifications

    res.json({ success: true, notifications: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching notifications." });
  }
};

// ─── @route   PUT /api/notifications/read-all ────────────────────────────────
const markAllRead = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { "notifications.$[].read": true },
    });
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating notifications." });
  }
};

// ─── @route   PUT /api/notifications/:notifId/read ───────────────────────────
const markOneRead = async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.user._id, "notifications._id": req.params.notifId },
      { $set: { "notifications.$.read": true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error marking notification as read." });
  }
};

// ─── @route   DELETE /api/notifications ──────────────────────────────────────
const clearNotifications = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { notifications: [] },
    });
    res.json({ success: true, message: "Notifications cleared." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error clearing notifications." });
  }
};

// ─── Helper: Push notification to a user ─────────────────────────────────────
const pushNotification = async (userId, { message, type = "info", link = "" }) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $push: {
        notifications: { message, type, link, read: false, createdAt: new Date() },
      },
    });
  } catch (err) {
    console.error("Push notification error:", err);
  }
};

module.exports = { getNotifications, markAllRead, markOneRead, clearNotifications, pushNotification };
