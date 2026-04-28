/**
 * Marketplace Controller
 * Handles buy/sell listings for books, gadgets, notes, etc.
 */

const MarketplaceItem = require("../models/MarketplaceItem");
const User = require("../models/User");
const path = require("path");

// ─── @route   GET /api/marketplace ───────────────────────────────────────────
// Get all listings with search, filter, and pagination
const getItems = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      condition,
      status = "available",
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    let query = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== "All") {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Condition filter
    if (condition && condition !== "All") {
      query.condition = condition;
    }

    // Status filter
    if (status !== "all") {
      query.status = status;
    }

    // Sort options
    let sortObj = {};
    switch (sort) {
      case "newest":    sortObj = { createdAt: -1 }; break;
      case "oldest":    sortObj = { createdAt: 1 };  break;
      case "price_asc": sortObj = { price: 1 };      break;
      case "price_desc":sortObj = { price: -1 };     break;
      default:          sortObj = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      MarketplaceItem.find(query)
        .populate("seller", "name avatar college department")
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      MarketplaceItem.countDocuments(query),
    ]);

    res.json({
      success: true,
      items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get Items Error:", error);
    res.status(500).json({ success: false, message: "Error fetching marketplace items." });
  }
};

// ─── @route   GET /api/marketplace/:id ───────────────────────────────────────
const getItemById = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id)
      .populate("seller", "name avatar college department email");

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    // Increment view count
    item.views += 1;
    await item.save({ validateBeforeSave: false });

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching item." });
  }
};

// ─── @route   POST /api/marketplace ──────────────────────────────────────────
const createItem = async (req, res) => {
  try {
    const { title, description, price, category, condition, tags, location, contactPreference } =
      req.body;

    // Handle uploaded images
    const images = req.files
      ? req.files.map((f) => `/uploads/marketplace/${f.filename}`)
      : [];

    const item = await MarketplaceItem.create({
      title,
      description,
      price: Number(price),
      category,
      condition,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim())) : [],
      location: location || "Campus",
      contactPreference: contactPreference || "chat",
      images,
      seller: req.user._id,
    });

    // Add to user's listings
    await User.findByIdAndUpdate(req.user._id, {
      $push: { marketplaceListings: item._id },
    });

    const populatedItem = await item.populate("seller", "name avatar college");

    res.status(201).json({
      success: true,
      message: "Item listed successfully!",
      item: populatedItem,
    });
  } catch (error) {
    console.error("Create Item Error:", error);
    res.status(500).json({ success: false, message: "Error creating listing." });
  }
};

// ─── @route   PUT /api/marketplace/:id ───────────────────────────────────────
const updateItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);

    if (!item) return res.status(404).json({ success: false, message: "Item not found." });

    // Only the seller can update
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    const updatedItem = await MarketplaceItem.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate("seller", "name avatar college");

    res.json({ success: true, message: "Item updated!", item: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating item." });
  }
};

// ─── @route   DELETE /api/marketplace/:id ────────────────────────────────────
const deleteItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found." });

    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    await item.deleteOne();

    // Remove from user's listings
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { marketplaceListings: req.params.id },
    });

    res.json({ success: true, message: "Item deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting item." });
  }
};

// ─── @route   PUT /api/marketplace/:id/toggle-save ───────────────────────────
const toggleSave = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found." });

    const userId = req.user._id;
    const isSaved = item.savedBy.some((savedUserId) => savedUserId.toString() === userId.toString());

    if (isSaved) {
      item.savedBy.pull(userId);
    } else {
      item.savedBy.push(userId);
    }
    await item.save();

    res.json({ success: true, saved: !isSaved, saves: item.savedBy.length });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error toggling save." });
  }
};

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem, toggleSave };
