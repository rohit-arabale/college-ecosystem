/**
 * User Model
 * Represents a student in the college ecosystem
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password in queries by default
    },
    avatar: {
      type: String,
      default: "", // Will hold URL or base64
    },
    college: {
      type: String,
      default: "State University",
      trim: true,
    },
    department: {
      type: String,
      default: "Computer Science",
      trim: true,
    },
    year: {
      type: Number,
      default: 1,
      min: 1,
      max: 6,
    },
    bio: {
      type: String,
      default: "",
      maxlength: [300, "Bio cannot exceed 300 characters"],
    },
    skills: [{ type: String }],         // e.g. ["React", "Python"]
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
    },
    // Items this user has listed in marketplace
    marketplaceListings: [
      { type: mongoose.Schema.Types.ObjectId, ref: "MarketplaceItem" },
    ],
    // Events the user has joined
    joinedEvents: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    ],
    // Notes the user has uploaded
    uploadedNotes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
    ],
    // Notifications for this user
    notifications: [
      {
        message: String,
        type: {
          type: String,
          enum: ["info", "success", "warning", "error"],
          default: "info",
        },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        link: String,
      },
    ],
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── Hash password before saving ─────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  // Only hash if password was modified
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance method: compare passwords ──────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Instance method: get public profile (no password) ───────────────────────
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
