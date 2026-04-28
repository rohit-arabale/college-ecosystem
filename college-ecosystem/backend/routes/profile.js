const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/upload");
const { getProfile, updateProfile, searchUsers } = require("../controllers/profileController");

router.get("/search", protect, searchUsers);
router.get("/:userId", protect, getProfile);
router.put("/update", protect, uploadAvatar.single("avatar"), updateProfile);

module.exports = router;
