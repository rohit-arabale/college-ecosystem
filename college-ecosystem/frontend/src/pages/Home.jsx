/**
 * Home Dashboard Page
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { marketplaceAPI, notesAPI, eventsAPI } from "../utils/api";
import { format } from "date-fns";

const StatCard = ({ icon, label, value, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-display font-bold">{value}</p>
      <p className="text-white/40 text-xs mt-0.5">{label}</p>
    </div>
  </div>
);

const QuickLink = ({ to, icon, label, desc, accent }) => (
  <Link to={to} className="card p-5 group hover:scale-[1.02] transition-all duration-200 block">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${accent}`}>{icon}</div>
    <p className="font-semibold font-display text-sm">{label}</p>
    <p className="text-white/40 text-xs mt-0.5">{desc}</p>
  </Link>
);

export default function Home() {
  const { user } = useAuth();
  const [recentItems, setRecentItems] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, eventsRes, notesRes] = await Promise.all([
          marketplaceAPI.getItems({ limit: 4, sort: "newest" }),
          eventsAPI.getEvents({ limit: 3, status: "upcoming" }),
          notesAPI.getNotes({ limit: 4, sort: "newest" }),
        ]);
        setRecentItems(itemsRes.data.items || []);
        setUpcomingEvents(eventsRes.data.events || []);
        setRecentNotes(notesRes.data.notes || []);
      } catch (_) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen page-enter mesh-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Hero greeting */}
        <div className="mb-8 relative">
          <div className="absolute -top-4 -left-4 w-48 h-48 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
          <p className="text-white/40 text-sm mb-1">{greeting} 👋</p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold">
            Welcome back,{" "}
            <span className="gradient-text">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-white/40 mt-1.5 text-sm">
            {user?.department} · {user?.college} · Year {user?.year}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🛒" label="Active Listings" value={recentItems.length} color="bg-accent-yellow/10" />
          <StatCard icon="📖" label="Notes Shared" value={recentNotes.length} color="bg-accent-cyan/10" />
          <StatCard icon="🎉" label="Upcoming Events" value={upcomingEvents.length} color="bg-brand-600/20" />
          <StatCard icon="🎓" label="Your Year" value={`Year ${user?.year}`} color="bg-accent-green/10" />
        </div>

        {/* Quick links */}
        <div className="mb-10">
          <h2 className="text-lg font-display font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickLink to="/marketplace" icon="🛒" label="Marketplace" desc="Buy & sell items" accent="bg-accent-yellow/10" />
            <QuickLink to="/notes" icon="📖" label="Study Notes" desc="Share & download" accent="bg-accent-cyan/10" />
            <QuickLink to="/events" icon="🎉" label="Events" desc="Join activities" accent="bg-brand-600/20" />
            <QuickLink to="/chat" icon="💬" label="Chat" desc="Message students" accent="bg-accent-green/10" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent marketplace items */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold">Recent Listings</h2>
              <Link to="/marketplace" className="text-brand-400 hover:text-brand-300 text-sm transition-colors">View all →</Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {recentItems.map((item) => (
                  <Link key={item._id} to="/marketplace" className="card p-4 group hover:scale-[1.01] transition-all duration-200 block">
                    <div className="flex justify-between items-start mb-2">
                      <span className="badge text-xs" style={{ background: "var(--brand-dim)", color: "var(--brand)" }}>
                        {item.category}
                      </span>
                      <span className={`text-xs font-medium ${item.condition === "New" ? "text-accent-green" : "text-white/40"}`}>
                        {item.condition}
                      </span>
                    </div>
                    <p className="font-semibold text-sm line-clamp-2 mb-2">{item.title}</p>
                    <p className="text-accent-yellow font-bold text-base">₹{item.price.toLocaleString()}</p>
                    <p className="text-white/30 text-xs mt-1">{item.seller?.name}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold">Upcoming Events</h2>
              <Link to="/events" className="text-brand-400 hover:text-brand-300 text-sm transition-colors">View all →</Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)
              ) : upcomingEvents.length === 0 ? (
                <div className="card p-6 text-center text-white/30 text-sm">No upcoming events</div>
              ) : (
                upcomingEvents.map((event) => (
                  <Link key={event._id} to="/events" className="card p-4 block hover:scale-[1.01] transition-all">
                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex-shrink-0 flex items-center justify-center text-lg">
                        {event.category === "Technical" ? "💻" : event.category === "Cultural" ? "🎭" : event.category === "Sports" ? "⚽" : "🎉"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm line-clamp-1">{event.title}</p>
                        <p className="text-white/40 text-xs mt-0.5">{format(new Date(event.date), "MMM d, yyyy")} · {event.venue}</p>
                        <p className="text-white/30 text-xs mt-0.5">{event.attendees?.length || 0} attending</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Notes */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold">Recently Shared Notes</h2>
            <Link to="/notes" className="text-brand-400 hover:text-brand-300 text-sm transition-colors">View all →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recentNotes.map((note) => (
                <Link key={note._id} to="/notes" className="card p-4 block hover:scale-[1.01] transition-all">
                  <div className="text-2xl mb-2">📄</div>
                  <p className="font-semibold text-sm line-clamp-2">{note.title}</p>
                  <p className="text-white/40 text-xs mt-1">{note.subject} · Sem {note.semester}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                    <span>⬇️ {note.downloads}</span>
                    <span>❤️ {note.likes?.length || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
