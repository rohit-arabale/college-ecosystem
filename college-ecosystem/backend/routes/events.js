const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getEvents, getEventById, createEvent, updateEvent, deleteEvent, rsvpEvent,
} = require("../controllers/eventController");

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);
router.post("/:id/rsvp", protect, rsvpEvent);

module.exports = router;
