/**
 * Events Page
 * Browse, create, and RSVP to college events & club activities
 */

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { eventsAPI } from "../utils/api";
import { format, isPast } from "date-fns";
import toast from "react-hot-toast";

const CATEGORIES = ["All", "Academic", "Cultural", "Sports", "Technical", "Social", "Workshop", "Seminar", "Club", "Other"];

const CATEGORY_ICONS = {
  Academic: "📚", Cultural: "🎭", Sports: "⚽", Technical: "💻",
  Social: "🎉", Workshop: "🔧", Seminar: "🎤", Club: "🏛️", Other: "📌",
};

// ─── Event Card ───────────────────────────────────────────────────────────────
const EventCard = ({ event, onRsvp, currentUserId }) => {
  const myRsvp = event.attendees?.find((a) => a.user?._id === currentUserId || a.user === currentUserId);
  const goingCount = event.attendees?.filter((a) => a.rsvpStatus === "going").length || 0;
  const isFull = event.maxAttendees > 0 && goingCount >= event.maxAttendees;
  const isOrganizer = event.organizer?._id === currentUserId || event.organizer === currentUserId;
  const eventDate = new Date(event.date);
  const isPastEvent = isPast(eventDate);

  return (
    <div className={`card group transition-all duration-200 overflow-hidden ${!isPastEvent ? "hover:scale-[1.01]" : "opacity-60"}`}>
      {/* Category banner */}
      <div className="h-2" style={{
        background: event.category === "Technical" ? "linear-gradient(90deg,#00D2FF,#7B2FBE)" :
          event.category === "Cultural" ? "linear-gradient(90deg,#FF6B35,#FFD60A)" :
          event.category === "Sports" ? "linear-gradient(90deg,#00C896,#00D2FF)" :
          "linear-gradient(90deg,#c53ef7,#7B2FBE)"
      }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: "var(--bg-card-hover)" }}>
            {CATEGORY_ICONS[event.category] || "📌"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge text-xs bg-brand-600/15 text-brand-400">{event.category}</span>
              {event.isFeatured && <span className="badge text-xs bg-accent-yellow/20 text-accent-yellow">⭐ Featured</span>}
              {event.isOnline && <span className="badge text-xs bg-accent-cyan/20 text-accent-cyan">🌐 Online</span>}
              {isPastEvent && <span className="badge text-xs bg-white/10 text-white/40">Completed</span>}
            </div>
            <h3 className="font-semibold text-sm mt-1 line-clamp-2">{event.title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/40 text-xs line-clamp-3 mb-4">{event.description}</p>

        {/* Event details */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>📅</span>
            <span>{format(eventDate, "EEEE, MMMM d, yyyy")}{event.time ? ` · ${event.time}` : ""}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>📍</span>
            <span className="line-clamp-1">{event.venue}</span>
          </div>
          {event.club && (
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span>🏛️</span>
              <span>{event.club}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>👥</span>
            <span>
              {goingCount} attending
              {event.maxAttendees > 0 ? ` / ${event.maxAttendees} max` : ""}
            </span>
            {isFull && <span className="text-red-400 font-semibold">· Full</span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>👤</span>
            <span>Organized by {event.organizer?.name}</span>
          </div>
        </div>

        {/* RSVP buttons */}
        {!isPastEvent && !isOrganizer && (
          <div className="flex gap-2">
            {!myRsvp ? (
              <>
                <button
                  onClick={() => onRsvp(event._id, "going")}
                  disabled={isFull}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isFull ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-accent-green/20 text-accent-green hover:bg-accent-green/30"
                  }`}
                >
                  ✅ Going
                </button>
                <button
                  onClick={() => onRsvp(event._id, "maybe")}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-accent-yellow/20 text-accent-yellow hover:bg-accent-yellow/30 transition-all"
                >
                  🤔 Maybe
                </button>
              </>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <div className={`flex-1 py-2 rounded-xl text-xs font-semibold text-center ${
                  myRsvp.rsvpStatus === "going" ? "bg-accent-green/20 text-accent-green" : "bg-accent-yellow/20 text-accent-yellow"
                }`}>
                  {myRsvp.rsvpStatus === "going" ? "✅ You're going!" : "🤔 Maybe"}
                </div>
                <button
                  onClick={() => onRsvp(event._id, "cancel")}
                  className="px-3 py-2 rounded-xl text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {isOrganizer && (
          <div className="py-2 rounded-xl text-xs font-semibold text-center bg-brand-600/20 text-brand-400">
            🎯 You're organizing this
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Create Event Modal ───────────────────────────────────────────────────────
const CreateEventModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: "", description: "", category: "Technical", date: "",
    time: "", venue: "", club: "", maxAttendees: "", tags: "",
    isOnline: false, meetLink: "", contactEmail: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [e.target.name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) return toast.error("Title, date, and venue are required");
    setLoading(true);
    try {
      const res = await eventsAPI.createEvent(form);
      toast.success("Event created! 🎉");
      onCreated(res.data.event);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display font-bold text-lg">Create Event</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Event Title *</label>
            <input name="title" placeholder="e.g. Annual Hackathon 2025" value={form.title} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Description *</label>
            <textarea name="description" rows={3} placeholder="Tell students what this event is about..." value={form.description} onChange={handleChange} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Club / Organizer</label>
              <input name="club" placeholder="Coding Club" value={form.club} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-1">Date *</label>
              <input type="date" name="date" min={today} value={form.date} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Time</label>
              <input name="time" placeholder="10:00 AM" value={form.time} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Venue *</label>
            <input name="venue" placeholder="CS Auditorium / Online" value={form.venue} onChange={handleChange} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-1">Max Attendees</label>
              <input type="number" name="maxAttendees" placeholder="0 = unlimited" min="0" value={form.maxAttendees} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Contact Email</label>
              <input type="email" name="contactEmail" placeholder="events@college.edu" value={form.contactEmail} onChange={handleChange} className="input-field" />
            </div>
          </div>

          {/* Online toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <input type="checkbox" id="isOnline" name="isOnline" checked={form.isOnline} onChange={handleChange} className="w-4 h-4 accent-brand-500" />
            <label htmlFor="isOnline" className="text-sm text-white/70 cursor-pointer">This is an online event</label>
          </div>
          {form.isOnline && (
            <div>
              <label className="block text-sm text-white/60 mb-1">Meet/Zoom Link</label>
              <input name="meetLink" placeholder="https://meet.google.com/..." value={form.meetLink} onChange={handleChange} className="input-field" />
            </div>
          )}

          <div>
            <label className="block text-sm text-white/60 mb-1">Tags</label>
            <input name="tags" placeholder="hackathon, coding, prizes" value={form.tags} onChange={handleChange} className="input-field" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "🎉"}
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Events Page ─────────────────────────────────────────────────────────
export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "", category: "All", status: "upcoming", sort: "date_asc", page: 1,
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (params.category === "All") delete params.category;
      const res = await eventsAPI.getEvents(params);
      setEvents(res.data.events);
      setPagination(res.data.pagination);
    } catch (_) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const handleRsvp = async (eventId, status) => {
    try {
      const res = await eventsAPI.rsvpEvent(eventId, status);
      toast.success(res.data.message);
      // Refresh to get updated attendees
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || "RSVP failed");
    }
  };

  return (
    <div className="min-h-screen page-enter mesh-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text">Events & Clubs</h1>
            <p className="text-white/40 text-sm mt-1">Discover, join, and organize campus activities 🎉</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <span>+</span> Create Event
          </button>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { value: "upcoming", label: "Upcoming" },
            { value: "all", label: "All Events" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilters((f) => ({ ...f, status: value, page: 1 }))}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filters.status === value ? "bg-brand-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
              <input
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
                className="input-field pl-10"
              />
            </div>
            <select
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
              className="input-field sm:w-44"
            >
              <option value="date_asc">Date: Soonest First</option>
              <option value="date_desc">Date: Latest First</option>
              <option value="newest">Recently Created</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters((f) => ({ ...f, category: cat, page: 1 }))}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filters.category === cat
                    ? "bg-brand-600 text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {CATEGORY_ICONS[cat] || ""} {cat}
              </button>
            ))}
          </div>
        </div>

        {!loading && (
          <p className="text-white/30 text-sm mb-4">
            {pagination.total || 0} event{pagination.total !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Events grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton rounded-2xl h-72" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20">🎉</div>
            <p className="text-white/30 text-lg">No events found</p>
            <p className="text-white/20 text-sm mt-1">Organize something exciting!</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary mt-4">
              + Create First Event
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onRsvp={handleRsvp}
                  currentUserId={user._id}
                />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilters((f) => ({ ...f, page: p }))}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      filters.page === p ? "bg-brand-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(ev) => setEvents((prev) => [ev, ...prev])}
        />
      )}
    </div>
  );
}
