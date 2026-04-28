/**
 * Notes Controller
 * Handles study notes upload, download, and sharing
 */

const Note = require("../models/Note");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");

// ─── @route   GET /api/notes ──────────────────────────────────────────────────
const getNotes = async (req, res) => {
  try {
    const {
      search,
      subject,
      semester,
      year,
      department,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (subject) query.subject = { $regex: subject, $options: "i" };
    if (semester) query.semester = Number(semester);
    if (year) query.year = Number(year);
    if (department) query.department = { $regex: department, $options: "i" };

    let sortObj = sort === "popular"
      ? { downloads: -1 }
      : sort === "liked"
      ? { "likes": -1 }
      : sort === "oldest"
      ? { createdAt: 1 }
      : { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate("uploader", "name avatar department college")
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Note.countDocuments(query),
    ]);

    res.json({
      success: true,
      notes,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error("Get Notes Error:", error);
    res.status(500).json({ success: false, message: "Error fetching notes." });
  }
};

// ─── @route   GET /api/notes/:id ─────────────────────────────────────────────
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate("uploader", "name avatar department college")
      .populate("comments.user", "name avatar");

    if (!note) return res.status(404).json({ success: false, message: "Note not found." });

    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching note." });
  }
};

// ─── @route   POST /api/notes ─────────────────────────────────────────────────
const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a PDF file." });
    }

    const { title, description, subject, semester, year, department, tags } = req.body;

    const note = await Note.create({
      title,
      description: description || "",
      subject,
      semester: Number(semester) || 1,
      year: Number(year) || 1,
      department: department || req.user.department,
      college: req.user.college,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim())) : [],
      fileUrl: `/uploads/notes/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploader: req.user._id,
    });

    // Add to user's uploaded notes
    await User.findByIdAndUpdate(req.user._id, {
      $push: { uploadedNotes: note._id },
    });

    const populated = await note.populate("uploader", "name avatar department");

    res.status(201).json({
      success: true,
      message: "Note uploaded successfully! 📝",
      note: populated,
    });
  } catch (error) {
    console.error("Upload Note Error:", error);
    res.status(500).json({ success: false, message: "Error uploading note." });
  }
};

// ─── @route   GET /api/notes/:id/download ────────────────────────────────────
const downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: "Note not found." });

    // Increment download count
    note.downloads += 1;
    await note.save({ validateBeforeSave: false });

    // Resolve file path
    const filePath = path.join(__dirname, "..", note.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found on server." });
    }

    res.download(filePath, note.fileName);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error downloading note." });
  }
};

// ─── @route   PUT /api/notes/:id/like ────────────────────────────────────────
const toggleLike = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: "Note not found." });

    const userId = req.user._id;
    const isLiked = note.likes.some((likedUserId) => likedUserId.toString() === userId.toString());

    if (isLiked) {
      note.likes.pull(userId);
    } else {
      note.likes.push(userId);
    }
    await note.save();

    res.json({ success: true, liked: !isLiked, likes: note.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error toggling like." });
  }
};

// ─── @route   POST /api/notes/:id/comment ────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Comment cannot be empty." });

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { user: req.user._id, text } } },
      { new: true }
    ).populate("comments.user", "name avatar");

    res.json({ success: true, comments: note.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding comment." });
  }
};

// ─── @route   DELETE /api/notes/:id ──────────────────────────────────────────
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: "Note not found." });

    if (note.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, "..", note.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await note.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $pull: { uploadedNotes: req.params.id } });

    res.json({ success: true, message: "Note deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting note." });
  }
};

module.exports = { getNotes, getNoteById, uploadNote, downloadNote, toggleLike, addComment, deleteNote };
