const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getNotifications, markAllRead, markOneRead, clearNotifications,
} = require("../controllers/notificationController");

router.get("/", protect, getNotifications);
router.put("/read-all", protect, markAllRead);
router.put("/:notifId/read", protect, markOneRead);
router.delete("/", protect, clearNotifications);

module.exports = router;
