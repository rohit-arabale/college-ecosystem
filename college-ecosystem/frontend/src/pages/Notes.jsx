/**
 * Notes Page
 * Upload, browse, and download study notes
 */

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { notesAPI } from "../utils/api";
import toast from "react-hot-toast";

const SUBJECTS = ["All", "Data Structures", "Algorithms", "Operating Systems", "DBMS",
  "Computer Networks", "Machine Learning", "Digital Electronics", "Thermodynamics",
  "Engineering Mathematics", "Physics", "Chemistry", "Other"];

const SEMESTERS = ["All", "1", "2", "3", "4", "5", "6", "7", "8"];

// ─── Note Card ────────────────────────────────────────────────────────────────
const NoteCard = ({ note, onLike, onDownload, currentUserId }) => {
  const isLiked = note.likes?.includes(currentUserId);
  const fileSizeMB = note.fileSize ? (note.fileSize / (1024 * 1024)).toFixed(1) : "?";

  return (
    <div className="card group hover:scale-[1.01] transition-all duration-200 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-xl flex-shrink-0">📄</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-2 leading-snug">{note.title}</h3>
          <p className="text-white/40 text-xs mt-0.5">{note.subject}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="badge text-xs bg-brand-600/15 text-brand-400">Sem {note.semester}</span>
        <span className="badge text-xs bg-white/5 text-white/50">Year {note.year}</span>
        {note.department && <span className="badge text-xs bg-white/5 text-white/40">{note.department}</span>}
      </div>

      {/* Description */}
      {note.description && (
        <p className="text-white/40 text-xs line-clamp-2 mb-3">{note.description}</p>
      )}

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
      )}

      {/* Uploader */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded-full bg-brand-600/30 flex items-center justify-center text-xs">
          {note.uploader?.name?.[0] || "?"}
        </div>
        <span className="text-xs text-white/40">{note.uploader?.name} · {fileSizeMB} MB</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onLike(note._id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isLiked ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          {isLiked ? "❤️" : "🤍"} {note.likes?.length || 0}
        </button>
        <span className="text-white/20 text-xs">⬇️ {note.downloads}</span>
        <button
          onClick={() => onDownload(note)}
          className="btn-primary flex-1 text-xs py-1.5 text-center"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

// ─── Upload Note Modal ────────────────────────────────────────────────────────
const UploadNoteModal = ({ onClose, onUploaded }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "", description: "", subject: "", semester: "1",
    year: String(user?.year || 1), department: user?.department || "", tags: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
    else toast.error("Only PDF files are accepted");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject) return toast.error("Title and subject are required");
    if (!file) return toast.error("Please select a PDF file");
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append("file", file);
      const res = await notesAPI.uploadNote(formData);
      toast.success("Note uploaded! 📝");
      onUploaded(res.data.note);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display font-bold text-lg">Upload Study Note</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* PDF Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              dragOver ? "border-brand-500 bg-brand-600/10" : "border-white/10 hover:border-white/20"
            }`}
            onClick={() => document.getElementById("noteFile").click()}
          >
            <input id="noteFile" type="file" accept="application/pdf" className="hidden"
              onChange={(e) => setFile(e.target.files[0])} />
            <div className="text-3xl mb-2">{file ? "✅" : "📤"}</div>
            {file ? (
              <>
                <p className="text-white/80 text-sm font-medium">{file.name}</p>
                <p className="text-white/30 text-xs mt-1">{(file.size / (1024*1024)).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <p className="text-white/50 text-sm">Drop PDF here or click to browse</p>
                <p className="text-white/20 text-xs mt-1">Max 10MB · PDF only</p>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Note Title *</label>
            <input name="title" placeholder="e.g. Complete DSA Notes Sem 3" value={form.title} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Description</label>
            <textarea name="description" rows={2} placeholder="What topics does this cover?" value={form.description} onChange={handleChange} className="input-field resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-1">Subject *</label>
              <input name="subject" placeholder="Data Structures" value={form.subject} onChange={handleChange} className="input-field" list="subjectList" />
              <datalist id="subjectList">
                {SUBJECTS.filter(s => s !== "All").map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Department</label>
              <input name="department" placeholder="Computer Science" value={form.department} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-1">Semester</label>
              <select name="semester" value={form.semester} onChange={handleChange} className="input-field">
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Year</label>
              <select name="year" value={form.year} onChange={handleChange} className="input-field">
                {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Tags (comma-separated)</label>
            <input name="tags" placeholder="DSA, trees, algorithms" value={form.tags} onChange={handleChange} className="input-field" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "📤"}
              {loading ? "Uploading..." : "Upload Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Notes Page ──────────────────────────────────────────────────────────
export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "", subject: "", semester: "", sort: "newest", page: 1,
  });

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (!params.subject || params.subject === "All") delete params.subject;
      if (!params.semester || params.semester === "All") delete params.semester;
      const res = await notesAPI.getNotes(params);
      setNotes(res.data.notes);
      setPagination(res.data.pagination);
    } catch (_) {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchNotes, 300);
    return () => clearTimeout(timer);
  }, [fetchNotes]);

  const handleLike = async (id) => {
    try {
      const res = await notesAPI.toggleLike(id);
      setNotes((prev) => prev.map((n) =>
        n._id === id
          ? {
              ...n,
              likes: res.data.liked
                ? [...(n.likes || []), user._id]
                : (n.likes || []).filter((uid) => uid !== user._id),
            }
          : n
      ));
    } catch (_) { toast.error("Failed to update like"); }
  };

  const handleDownload = async (note) => {
    try {
      // For seeded placeholder notes, just show a toast
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("ce_token");
      const response = await fetch(`${API_URL}/api/notes/${note._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        toast.error("File not available (demo data has no real PDF)");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = note.fileName || "note.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
      // Update local download count
      setNotes((prev) => prev.map((n) => n._id === note._id ? { ...n, downloads: n.downloads + 1 } : n));
      toast.success("Download started! ⬇️");
    } catch (_) {
      toast.error("Download failed. The demo seed data doesn't include real PDF files.");
    }
  };

  return (
    <div className="min-h-screen page-enter mesh-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text">Study Notes</h1>
            <p className="text-white/40 text-sm mt-1">Share knowledge, ace exams together 📚</p>
          </div>
          <button onClick={() => setShowUploadModal(true)} className="btn-primary flex items-center gap-2">
            <span>📤</span> Upload Notes
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
              <input
                placeholder="Search notes by title, subject, tags..."
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
              <option value="newest">Newest First</option>
              <option value="popular">Most Downloaded</option>
              <option value="liked">Most Liked</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Subject filter chips */}
          <div className="flex flex-wrap gap-2 mb-2">
            {SUBJECTS.slice(0, 8).map((sub) => (
              <button
                key={sub}
                onClick={() => setFilters((f) => ({ ...f, subject: sub === "All" ? "" : sub, page: 1 }))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  (sub === "All" && !filters.subject) || filters.subject === sub
                    ? "bg-brand-600 text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Semester filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-white/30 text-xs">Semester:</span>
            {SEMESTERS.map((sem) => (
              <button
                key={sem}
                onClick={() => setFilters((f) => ({ ...f, semester: sem === "All" ? "" : sem, page: 1 }))}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  (sem === "All" && !filters.semester) || filters.semester === sem
                    ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
                    : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}
              >
                {sem}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-white/30 text-sm mb-4">
            {pagination.total || 0} note{pagination.total !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Notes grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton rounded-2xl h-64" />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20">📖</div>
            <p className="text-white/30 text-lg">No notes found</p>
            <p className="text-white/20 text-sm mt-1">Be the first to share study material!</p>
            <button onClick={() => setShowUploadModal(true)} className="btn-primary mt-4">
              📤 Upload First Note
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {notes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onLike={handleLike}
                  onDownload={handleDownload}
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

      {showUploadModal && (
        <UploadNoteModal
          onClose={() => setShowUploadModal(false)}
          onUploaded={(note) => setNotes((prev) => [note, ...prev])}
        />
      )}
    </div>
  );
}
