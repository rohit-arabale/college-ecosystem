/**
 * Profile Page
 * View and edit student profiles
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { profileAPI } from "../utils/api";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
const EditProfileModal = ({ user: currentUser, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: currentUser.name || "",
    bio: currentUser.bio || "",
    college: currentUser.college || "",
    department: currentUser.department || "",
    year: String(currentUser.year || 1),
    skills: (currentUser.skills || []).join(", "),
    linkedin: currentUser.socialLinks?.linkedin || "",
    github: currentUser.socialLinks?.github || "",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("bio", form.bio);
      formData.append("college", form.college);
      formData.append("department", form.department);
      formData.append("year", form.year);
      formData.append("skills", form.skills);
      formData.append("socialLinks[linkedin]", form.linkedin);
      formData.append("socialLinks[github]", form.github);
      if (avatar) formData.append("avatar", avatar);

      const res = await profileAPI.updateProfile(formData);
      toast.success("Profile updated! ✨");
      onSaved(res.data.user);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display font-bold text-lg">Edit Profile</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-600/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {avatarPreview || currentUser.avatar ? (
                <img src={avatarPreview || `${API_URL}${currentUser.avatar}`} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser.name?.[0]}</span>
              )}
            </div>
            <div>
              <label className="btn-secondary cursor-pointer text-sm py-2 px-3 inline-block">
                📷 Change Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
              <p className="text-white/30 text-xs mt-1">JPG, PNG, WebP · Max 2MB</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Bio</label>
            <textarea name="bio" rows={3} placeholder="Tell others about yourself..." value={form.bio} onChange={handleChange} className="input-field resize-none" maxLength={300} />
            <p className="text-white/20 text-xs text-right mt-1">{form.bio.length}/300</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-1">College</label>
              <input name="college" value={form.college} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Department</label>
              <input name="department" value={form.department} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Year of Study</label>
            <select name="year" value={form.year} onChange={handleChange} className="input-field">
              {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Skills (comma-separated)</label>
            <input name="skills" placeholder="React, Python, Machine Learning" value={form.skills} onChange={handleChange} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-1">🔗 LinkedIn</label>
              <input name="linkedin" placeholder="linkedin.com/in/..." value={form.linkedin} onChange={handleChange} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">🐙 GitHub</label>
              <input name="github" placeholder="github.com/..." value={form.github} onChange={handleChange} className="input-field text-sm" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : null}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState("listings");

  const targetId = userId || currentUser._id;
  const isOwnProfile = targetId === currentUser._id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await profileAPI.getProfile(targetId);
        setProfile(res.data.user);
      } catch (_) {
        toast.error("Failed to load profile");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [targetId, navigate]);

  const handleSaved = (updatedUser) => {
    setProfile(updatedUser);
    if (isOwnProfile) updateUser(updatedUser);
  };

  const getAvatarUrl = (user) => {
    if (user?.avatar) return `${API_URL}${user.avatar}`;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const tabs = [
    { id: "listings", label: "Listings", count: profile.marketplaceListings?.length || 0 },
    { id: "notes", label: "Notes", count: profile.uploadedNotes?.length || 0 },
    { id: "events", label: "Events", count: profile.joinedEvents?.length || 0 },
  ];

  return (
    <div className="min-h-screen page-enter mesh-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Profile header card */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-500 to-purple-800 flex items-center justify-center text-3xl font-bold">
              {getAvatarUrl(profile) ? (
                <img src={getAvatarUrl(profile)} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span>{profile.name?.[0]}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-2xl font-display font-bold">{profile.name}</h1>
                  <p className="text-white/40 text-sm mt-0.5">
                    {profile.department} · {profile.college} · Year {profile.year}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {isOwnProfile ? (
                    <button onClick={() => setShowEditModal(true)} className="btn-secondary text-sm py-2 px-4">
                      ✏️ Edit Profile
                    </button>
                  ) : (
                    <Link to={`/chat/${profile._id}`} className="btn-primary text-sm py-2 px-4">
                      💬 Message
                    </Link>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-white/60 text-sm mt-3 leading-relaxed">{profile.bio}</p>
              )}

              {/* Skills */}
              {profile.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="badge text-xs bg-brand-600/15 text-brand-400">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Social links */}
              <div className="flex gap-3 mt-3">
                {profile.socialLinks?.linkedin && (
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                    className="text-accent-cyan text-xs hover:underline">
                    🔗 LinkedIn
                  </a>
                )}
                {profile.socialLinks?.github && (
                  <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer"
                    className="text-white/50 text-xs hover:text-white hover:underline">
                    🐙 GitHub
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="text-center">
              <p className="text-xl font-display font-bold">{profile.marketplaceListings?.length || 0}</p>
              <p className="text-white/40 text-xs">Listings</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-display font-bold">{profile.uploadedNotes?.length || 0}</p>
              <p className="text-white/40 text-xs">Notes Shared</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-display font-bold">{profile.joinedEvents?.length || 0}</p>
              <p className="text-white/40 text-xs">Events Joined</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "var(--bg-card)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id ? "bg-brand-600 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-white/20" : "bg-white/10"
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "listings" && (
          <div>
            {profile.marketplaceListings?.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <div className="text-4xl mb-3 opacity-20">🛒</div>
                <p>No marketplace listings</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {profile.marketplaceListings?.map((item) => (
                  <Link key={item._id} to="/marketplace" className="card p-4 block hover:scale-[1.01] transition-all">
                    <div className="text-2xl mb-2">
                      {item.category === "Books" ? "📚" : item.category === "Electronics" ? "💻" : "📦"}
                    </div>
                    <p className="font-semibold text-sm line-clamp-2">{item.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-accent-yellow font-bold text-sm">₹{item.price?.toLocaleString()}</span>
                      <span className={`text-xs ${item.status === "available" ? "text-accent-green" : "text-white/30"}`}>
                        {item.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div>
            {profile.uploadedNotes?.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <div className="text-4xl mb-3 opacity-20">📖</div>
                <p>No notes shared yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.uploadedNotes?.map((note) => (
                  <Link key={note._id} to="/notes" className="card p-4 block hover:scale-[1.01] transition-all">
                    <div className="flex gap-3">
                      <div className="text-2xl">📄</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm line-clamp-1">{note.title}</p>
                        <p className="text-white/40 text-xs mt-0.5">{note.subject} · Sem {note.semester}</p>
                        <div className="flex gap-3 mt-1.5 text-xs text-white/30">
                          <span>⬇️ {note.downloads}</span>
                          <span>❤️ {note.likes?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div>
            {profile.joinedEvents?.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <div className="text-4xl mb-3 opacity-20">🎉</div>
                <p>No events joined</p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.joinedEvents?.map((event) => (
                  <Link key={event._id} to="/events" className="card p-4 flex items-center gap-3 block hover:scale-[1.005] transition-all">
                    <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center text-lg flex-shrink-0">
                      🎉
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{event.title}</p>
                      <div className="flex gap-2 mt-0.5 text-xs text-white/40">
                        <span>{event.category}</span>
                        <span>·</span>
                        <span>{event.venue}</span>
                        <span className={`ml-1 ${event.status === "upcoming" ? "text-accent-green" : "text-white/30"}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showEditModal && (
        <EditProfileModal
          user={profile}
          onClose={() => setShowEditModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
