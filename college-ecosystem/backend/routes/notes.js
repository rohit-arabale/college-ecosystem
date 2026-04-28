const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { uploadNote: uploadNoteMW } = require("../middleware/upload");
const {
  getNotes, getNoteById, uploadNote, downloadNote, toggleLike, addComment, deleteNote,
} = require("../controllers/notesController");

router.get("/", getNotes);
router.get("/:id", getNoteById);
router.post("/", protect, uploadNoteMW.single("file"), uploadNote);
router.get("/:id/download", protect, downloadNote);
router.put("/:id/like", protect, toggleLike);
router.post("/:id/comment", protect, addComment);
router.delete("/:id", protect, deleteNote);

module.exports = router;
