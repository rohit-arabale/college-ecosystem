/**
 * Note Model
 * Represents a study note/document shared by a student
 */

const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
    },
    year: {
      type: Number,
      min: 1,
      max: 6,
      default: 1,
    },
    fileUrl: {
      type: String,
      required: [true, "File is required"],
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
      default: 0,
    },
    fileType: {
      type: String,
      default: "application/pdf",
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    college: { type: String, default: "" },
    department: { type: String, default: "" },
    tags: [{ type: String }],
    downloads: { type: Number, default: 0 },
    // Who liked this note
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Comments on the note
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isVerified: { type: Boolean, default: false }, // could be peer-verified
    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text search index
noteSchema.index({ title: "text", subject: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Note", noteSchema);
