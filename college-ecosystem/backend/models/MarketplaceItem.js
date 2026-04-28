/**
 * MarketplaceItem Model
 * Represents an item listed in the student marketplace
 */

const mongoose = require("mongoose");

const marketplaceItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Item title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: true,
      enum: ["Books", "Notes", "Electronics", "Clothing", "Furniture", "Sports", "Other"],
      default: "Other",
    },
    condition: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair", "Poor"],
      default: "Good",
    },
    images: [{ type: String }], // Array of image URLs/paths
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "sold", "reserved"],
      default: "available",
    },
    tags: [{ type: String }],
    // Who has saved/favorited this item
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    location: {
      type: String,
      default: "Campus",
    },
    contactPreference: {
      type: String,
      enum: ["chat", "email", "both"],
      default: "chat",
    },
  },
  { timestamps: true }
);

// Text index for search functionality
marketplaceItemSchema.index({
  title: "text",
  description: "text",
  tags: "text",
  category: "text",
});

module.exports = mongoose.model("MarketplaceItem", marketplaceItemSchema);
