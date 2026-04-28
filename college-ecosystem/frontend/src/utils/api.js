/**
 * API Utility
 * Axios instance with auth interceptors and base URL configuration
 */

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create axios instance with base config
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30 seconds
});

// ─── Request Interceptor: attach JWT token ────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ce_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: handle auth errors ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem("ce_token");
      localStorage.removeItem("ce_user");
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  changePassword: (data) => api.put("/auth/change-password", data),
};

// ─── Profile API ───────────────────────────────────────────────────────────────
export const profileAPI = {
  getProfile: (userId) => api.get(`/profile/${userId}`),
  updateProfile: (formData) =>
    api.put("/profile/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  searchUsers: (params) => api.get("/profile/search", { params }),
};

// ─── Marketplace API ───────────────────────────────────────────────────────────
export const marketplaceAPI = {
  getItems: (params) => api.get("/marketplace", { params }),
  getItem: (id) => api.get(`/marketplace/${id}`),
  createItem: (formData) =>
    api.post("/marketplace", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateItem: (id, data) => api.put(`/marketplace/${id}`, data),
  deleteItem: (id) => api.delete(`/marketplace/${id}`),
  toggleSave: (id) => api.put(`/marketplace/${id}/toggle-save`),
};

// ─── Notes API ─────────────────────────────────────────────────────────────────
export const notesAPI = {
  getNotes: (params) => api.get("/notes", { params }),
  getNote: (id) => api.get(`/notes/${id}`),
  uploadNote: (formData) =>
    api.post("/notes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  downloadNote: (id) =>
    api.get(`/notes/${id}/download`, { responseType: "blob" }),
  toggleLike: (id) => api.put(`/notes/${id}/like`),
  addComment: (id, text) => api.post(`/notes/${id}/comment`, { text }),
  deleteNote: (id) => api.delete(`/notes/${id}`),
};

// ─── Events API ────────────────────────────────────────────────────────────────
export const eventsAPI = {
  getEvents: (params) => api.get("/events", { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post("/events", data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  rsvpEvent: (id, status) => api.post(`/events/${id}/rsvp`, { status }),
};

// ─── Chat API ──────────────────────────────────────────────────────────────────
export const chatAPI = {
  getConversations: () => api.get("/chat/conversations"),
  getOrCreateConversation: (userId) => api.get(`/chat/conversations/${userId}`),
  getMessages: (conversationId, params) =>
    api.get(`/chat/messages/${conversationId}`, { params }),
  sendMessage: (data) => api.post("/chat/messages", data),
  getAllUsers: () => api.get("/chat/users"),
};

// ─── Notifications API ─────────────────────────────────────────────────────────
export const notificationsAPI = {
  getNotifications: () => api.get("/notifications"),
  markAllRead: () => api.put("/notifications/read-all"),
  markOneRead: (id) => api.put(`/notifications/${id}/read`),
  clearAll: () => api.delete("/notifications"),
};
