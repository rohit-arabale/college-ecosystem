const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { uploadMarketplaceImage } = require("../middleware/upload");
const {
  getItems, getItemById, createItem, updateItem, deleteItem, toggleSave,
} = require("../controllers/marketplaceController");

router.get("/", getItems);
router.get("/:id", getItemById);
router.post("/", protect, uploadMarketplaceImage.array("images", 5), createItem);
router.put("/:id", protect, updateItem);
router.delete("/:id", protect, deleteItem);
router.put("/:id/toggle-save", protect, toggleSave);

module.exports = router;
