/**
 * File Upload Middleware
 * Handles PDF and image uploads using multer (local storage)
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// ─── Storage for Notes (PDFs) ─────────────────────────────────────────────────
const notesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/notes");
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp + user id + original name
    const uniqueSuffix = `${Date.now()}-${req.user._id}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 30);
    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  },
});

// ─── Storage for Marketplace Images ──────────────────────────────────────────
const marketplaceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/marketplace");
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${req.user._id}`;
    const ext = path.extname(file.originalname);
    cb(null, `marketplace-${uniqueSuffix}${ext}`);
  },
});

// ─── Storage for Avatars ──────────────────────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/avatars");
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user._id}${ext}`);
  },
});

// ─── File Filters ─────────────────────────────────────────────────────────────
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed for notes!"), false);
  }
};

const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, or WebP images are allowed!"), false);
  }
};

// ─── Multer instances ─────────────────────────────────────────────────────────
const uploadNote = multer({
  storage: notesStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 }, // 10MB
});

const uploadMarketplaceImage = multer({
  storage: marketplaceStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = { uploadNote, uploadMarketplaceImage, uploadAvatar };
