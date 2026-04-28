/**
 * Event Model
 * Represents a college event or club activity
 */

const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      enum: [
        "Academic",
        "Cultural",
        "Sports",
        "Technical",
        "Social",
        "Workshop",
        "Seminar",
        "Club",
        "Other",
      ],
      default: "Other",
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    endDate: {
      type: Date, // For multi-day events
    },
    time: { type: String, default: "" },    // e.g. "10:00 AM"
    venue: {
      type: String,
      required: [true, "Venue is required"],
      default: "College Auditorium",
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    club: { type: String, default: "" },     // Club name if organized by a club
    image: { type: String, default: "" },     // Event banner image
    maxAttendees: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    // Students who RSVPed
    attendees: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rsvpStatus: {
          type: String,
          enum: ["going", "maybe", "not_going"],
          default: "going",
        },
        rsvpDate: { type: Date, default: Date.now },
      },
    ],
    tags: [{ type: String }],
    isOnline: { type: Boolean, default: false },
    meetLink: { type: String, default: "" },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    isFeatured: { type: Boolean, default: false },
    registrationDeadline: { type: Date },
    contactEmail: { type: String, default: "" },
  },
  { timestamps: true }
);

// Text search index
eventSchema.index({ title: "text", description: "text", club: "text", tags: "text" });

module.exports = mongoose.model("Event", eventSchema);
