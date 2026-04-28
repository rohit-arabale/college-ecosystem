/**
 * Marketplace Page
 * Buy/sell books, gadgets, notes, and more
 */

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { marketplaceAPI } from "../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = ["All", "Books", "Notes", "Electronics", "Clothing", "Furniture", "Sports", "Other"];
const CONDITIONS = ["All", "New", "Like New", "Good", "Fair", "Poor"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

// ─── Item Card ────────────────────────────────────────────────────────────────
const ItemCard = ({ item, onContact, onSave, currentUserId }) => {
  const isSaved = item.savedBy?.includes(currentUserId);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  return (
    <div className="card group hover:scale-[1.01] transition-all duration-200 overflow-hidden">
      {/* Image */}
      <div className="h-40 bg-dark-600 flex items-center justify-center relative overflow-hidden">
        {item.images?.[0] ? (
          <img src={`${API_URL}${item.images[0]}`} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-5xl opacity-30">
            {item.category === "Books" ? "📚" : item.category === "Electronics" ? "💻" : item.category === "Sports" ? "⚽" : "📦"}
          </div>
        )}
        {/* Condition badge */}
        <div className="absolute top-2 left-2">
          <span className={`badge text-xs ${
            item.condition === "New" ? "bg-accent-green/20 text-accent-green" :
            item.condition === "Like New" ? "bg-accent-cyan/20 text-accent-cyan" :
            "bg-white/10 text-white/60"
          }`}>{item.condition}</span>
        </div>
        {/* Status badge */}
        {item.status !== "available" && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="badge bg-red-500/30 text-red-300 text-sm uppercase">{item.status}</span>
          </div>
        )}
        {/* Save button */}
        <button
          onClick={(e) => { e.stopPropagation(); onSave(item._id); }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
            isSaved ? "bg-brand-500/30 text-brand-300" : "bg-black/40 text-white/50 hover:text-white"
          }`}
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge text-xs" style={{ background: "var(--brand-dim)", color: "var(--brand)" }}>
            {item.category}
          </span>
          <span className="text-white/30 text-xs">👁 {item.views}</span>
        </div>
        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{item.title}</h3>
        <p className="text-white/40 text-xs line-clamp-2 mb-3">{item.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-accent-yellow font-bold text-lg">₹{item.price.toLocaleString()}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-brand-600/30 flex items-center justify-center text-xs">
              {item.seller?.name?.[0] || "?"}
            </div>
            <span className="text-xs text-white/40">{item.seller?.name?.split(" ")[0]}</span>
          </div>
        </div>

        {item.status === "available" && item.seller?._id !== currentUserId && (
          <button
            onClick={() => onContact(item)}
            className="btn-primary w-full mt-3 text-sm py-2"
          >
            💬 Contact Seller
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Create Listing Modal ─────────────────────────────────────────────────────
const CreateListingModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: "", description: "", price: "", category: "Books",
    condition: "Good", tags: "", location: "Campus",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) return toast.error("Title and price are required");
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach((f) => formData.append("images", f));
      const res = await marketplaceAPI.createItem(formData);
      toast.success("Item listed successfully! 🎉");
      onCreated(res.data.item);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display font-bold text-lg">List an Item</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Title *</label>
            <input name="title" placeholder="e.g. CLRS Algorithms Book" value={form.title} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Description *</label>
            <textarea name="description" rows={3} placeholder="Describe condition, edition, etc." value={form.description} onChange={handleChange} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-1">Price (₹) *</label>
              <input type="number" name="price" placeholder="0" min="0" value={form.price} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-1">Condition</label>
              <select name="condition" value={form.condition} onChange={handleChange} className="input-field">
                {CONDITIONS.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Location</label>
              <input name="location" placeholder="Hostel Block A" value={form.location} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Tags (comma-separated)</label>
            <input name="tags" placeholder="textbook, cs, algorithms" value={form.tags} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Images (optional)</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files))}
              className="w-full text-sm text-white/50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-600/20 file:text-brand-300 file:text-xs hover:file:bg-brand-600/30" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : null}
              {loading ? "Listing..." : "List Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Marketplace Page ────────────────────────────────────────────────────
export default function Marketplace() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "", category: "All", condition: "All",
    sort: "newest", page: 1,
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (params.category === "All") delete params.category;
      if (params.condition === "All") delete params.condition;
      const res = await marketplaceAPI.getItems(params);
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (_) {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchItems, 300);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  const handleSave = async (id) => {
    try {
      const res = await marketplaceAPI.toggleSave(id);
      setItems((prev) => prev.map((item) =>
        item._id === id
          ? { ...item, savedBy: res.data.saved
              ? [...(item.savedBy || []), user._id]
              : (item.savedBy || []).filter((uid) => uid !== user._id) }
          : item
      ));
      toast.success(res.data.saved ? "Saved!" : "Removed from saved");
    } catch (_) { toast.error("Failed to save item"); }
  };

  const handleContact = (item) => {
    window.location.href = `/chat/${item.seller._id}`;
  };

  return (
    <div className="min-h-screen page-enter mesh-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text">Marketplace</h1>
            <p className="text-white/40 text-sm mt-1">Buy & sell books, electronics, and more</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <span>+</span> List an Item
          </button>
        </div>

        {/* Search + Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
              <input
                placeholder="Search listings..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
                className="input-field pl-10"
              />
            </div>
            <select
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
              className="input-field sm:w-48"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mt-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters((f) => ({ ...f, category: cat, page: 1 }))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filters.category === cat
                    ? "bg-brand-600 text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Condition filter */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-white/30 text-xs self-center">Condition:</span>
            {CONDITIONS.map((cond) => (
              <button
                key={cond}
                onClick={() => setFilters((f) => ({ ...f, condition: cond, page: 1 }))}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  filters.condition === cond
                    ? "bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30"
                    : "bg-white/5 text-white/40 hover:text-white"
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-white/30 text-sm mb-4">
            {pagination.total || 0} listing{pagination.total !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Items grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="skeleton rounded-2xl h-72" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20">🛒</div>
            <p className="text-white/30 text-lg">No listings found</p>
            <p className="text-white/20 text-sm mt-1">Try adjusting your filters or be the first to list!</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary mt-4">
              + List First Item
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  onContact={handleContact}
                  onSave={handleSave}
                  currentUserId={user._id}
                />
              ))}
            </div>

            {/* Pagination */}
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
        <CreateListingModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(item) => setItems((prev) => [item, ...prev])}
        />
      )}
    </div>
  );
}
