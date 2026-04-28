/**
 * Navbar Component
 * Main navigation with notifications and user menu
 */

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationsAPI } from "../../utils/api";
import toast from "react-hot-toast";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: "⊞" },
  { to: "/marketplace", label: "Market", icon: "🛒" },
  { to: "/notes", label: "Notes", icon: "📖" },
  { to: "/events", label: "Events", icon: "🎉" },
  { to: "/chat", label: "Chat", icon: "💬" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await notificationsAPI.getNotifications();
        const notifs = res.data.notifications || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.read).length);
      } catch (_) {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getAvatar = () => {
    if (user?.avatar) return `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${user.avatar}`;
    return null;
  };

  const initials = user?.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-bold glow-brand-sm">
                CE
              </div>
              <span className="font-display font-bold text-lg hidden sm:block gradient-text">
                CollegeEco
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label, icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-brand-600/20 text-brand-400 border border-brand-500/30"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Right side: notifications + avatar */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 top-11 w-80 card shadow-2xl animate-fade-in overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                      <span className="font-semibold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-brand-400 hover:text-brand-300">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-white/40 text-sm">No notifications yet</div>
                      ) : (
                        notifications.slice(0, 10).map((n, i) => (
                          <div
                            key={i}
                            className={`px-4 py-3 border-b text-sm transition-colors hover:bg-white/5 ${
                              n.read ? "opacity-60" : ""
                            }`}
                            style={{ borderColor: "var(--border)" }}
                          >
                            <div className="flex gap-2 items-start">
                              <span>{n.type === "success" ? "✅" : n.type === "error" ? "❌" : "ℹ️"}</span>
                              <div>
                                <p className="text-white/80">{n.message}</p>
                                <p className="text-white/30 text-xs mt-0.5">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              {!n.read && <div className="w-2 h-2 bg-brand-500 rounded-full mt-1 ml-auto flex-shrink-0" />}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
                  className="flex items-center gap-2 hover:bg-white/5 rounded-xl px-2 py-1.5 transition-all"
                >
                  {getAvatar() ? (
                    <img src={getAvatar()} alt={user?.name} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-800 flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                  )}
                  <span className="text-sm text-white/80 hidden sm:block font-medium">{user?.name?.split(" ")[0]}</span>
                  <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-11 w-52 card shadow-2xl animate-fade-in overflow-hidden">
                    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                      <p className="font-semibold text-sm">{user?.name}</p>
                      <p className="text-white/40 text-xs mt-0.5">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      {[
                        { to: "/profile", label: "My Profile", icon: "👤" },
                        { to: "/marketplace", label: "My Listings", icon: "🛒" },
                        { to: "/notes", label: "My Notes", icon: "📖" },
                      ].map(({ to, label, icon }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <span>{icon}</span>{label}
                        </Link>
                      ))}
                      <div className="border-t my-1" style={{ borderColor: "var(--border)" }} />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <span>🚪</span>Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/5"
              >
                {mobileOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav menu */}
        {mobileOpen && (
          <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
            {NAV_LINKS.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === to
                    ? "bg-brand-600/20 text-brand-400"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{icon}</span>{label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
