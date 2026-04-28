/**
 * Events Controller
 * Handles college events and club management
 */

const Event = require("../models/Event");
const User = require("../models/User");

// ─── @route   GET /api/events ─────────────────────────────────────────────────
const getEvents = async (req, res) => {
  try {
    const {
      search,
      category,
      status = "upcoming",
      sort = "date_asc",
      page = 1,
      limit = 12,
    } = req.query;

    let query = {};

    if (search) query.$text = { $search: search };
    if (category && category !== "All") query.category = category;
    if (status !== "all") query.status = status;

    // Default: only show future/ongoing events
    if (status === "upcoming") {
      query.date = { $gte: new Date() };
    }

    let sortObj = sort === "date_asc"
      ? { date: 1 }
      : sort === "date_desc"
      ? { date: -1 }
      : sort === "popular"
      ? { "attendees": -1 }
      : { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate("organizer", "name avatar college department")
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Event.countDocuments(query),
    ]);

    res.json({
      success: true,
      events,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error("Get Events Error:", error);
    res.status(500).json({ success: false, message: "Error fetching events." });
  }
};

// ─── @route   GET /api/events/:id ─────────────────────────────────────────────
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name avatar college department email")
      .populate("attendees.user", "name avatar department");

    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching event." });
  }
};

// ─── @route   POST /api/events ────────────────────────────────────────────────
const createEvent = async (req, res) => {
  try {
    const {
      title, description, category, date, endDate, time,
      venue, club, maxAttendees, tags, isOnline, meetLink,
      registrationDeadline, contactEmail,
    } = req.body;

    const event = await Event.create({
      title,
      description,
      category: category || "Other",
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : undefined,
      time: time || "",
      venue: venue || "Campus",
      club: club || "",
      maxAttendees: Number(maxAttendees) || 0,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim())) : [],
      isOnline: isOnline === true || isOnline === "true",
      meetLink: meetLink || "",
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
      contactEmail: contactEmail || req.user.email,
      organizer: req.user._id,
    });

    const populated = await event.populate("organizer", "name avatar college");

    res.status(201).json({
      success: true,
      message: "Event created successfully! 🎉",
      event: populated,
    });
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ success: false, message: "Error creating event." });
  }
};

// ─── @route   PUT /api/events/:id ─────────────────────────────────────────────
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate("organizer", "name avatar college");

    res.json({ success: true, message: "Event updated!", event: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating event." });
  }
};

// ─── @route   DELETE /api/events/:id ──────────────────────────────────────────
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    await event.deleteOne();
    res.json({ success: true, message: "Event deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting event." });
  }
};

// ─── @route   POST /api/events/:id/rsvp ──────────────────────────────────────
const rsvpEvent = async (req, res) => {
  try {
    const { status = "going" } = req.body; // going | maybe | not_going
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    // Check if max attendees reached
    const goingCount = event.attendees.filter((a) => a.rsvpStatus === "going").length;
    if (
      status === "going" &&
      event.maxAttendees > 0 &&
      goingCount >= event.maxAttendees
    ) {
      return res.status(400).json({ success: false, message: "Event is full!" });
    }

    // Check if user already RSVPed
    const existingIdx = event.attendees.findIndex(
      (a) => a.user.toString() === req.user._id.toString()
    );

    if (existingIdx !== -1) {
      // Update existing RSVP
      if (status === "cancel") {
        event.attendees.splice(existingIdx, 1);
        await User.findByIdAndUpdate(req.user._id, {
          $pull: { joinedEvents: event._id },
        });
      } else {
        event.attendees[existingIdx].rsvpStatus = status;
      }
    } else {
      if (status !== "cancel") {
        event.attendees.push({ user: req.user._id, rsvpStatus: status });
        // Add to user's joined events
        await User.findByIdAndUpdate(req.user._id, {
          $addToSet: { joinedEvents: event._id },
        });
      }
    }

    await event.save();

    res.json({
      success: true,
      message: status === "cancel" ? "RSVP cancelled." : `You're ${status} for this event!`,
      attendees: event.attendees.length,
    });
  } catch (error) {
    console.error("RSVP Error:", error);
    res.status(500).json({ success: false, message: "Error processing RSVP." });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent, rsvpEvent };
