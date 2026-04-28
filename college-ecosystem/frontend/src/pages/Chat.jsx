/**
 * Chat Page
 * Real-time messaging between students using Socket.io
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { chatAPI } from "../utils/api";
import { format, isToday, isYesterday } from "date-fns";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Message bubble ────────────────────────────────────────────────────────────
const MessageBubble = ({ msg, isMe }) => {
  const time = format(new Date(msg.createdAt), "h:mm a");
  return (
    <div className={`flex gap-2 mb-3 ${isMe ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-auto ${
        isMe ? "bg-brand-600/40 text-brand-300" : "bg-white/10 text-white/60"
      }`}>
        {msg.sender?.name?.[0] || "?"}
      </div>
      {/* Bubble */}
      <div className={`max-w-[72%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
        {!isMe && <span className="text-xs text-white/30 mb-1 ml-1">{msg.sender?.name}</span>}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMe
            ? "bg-brand-600 text-white rounded-br-sm"
            : "text-white/85 rounded-bl-sm"
        }`} style={!isMe ? { background: "var(--bg-card-hover)", border: "1px solid var(--border)" } : {}}>
          {msg.text}
        </div>
        <span className="text-xs text-white/20 mt-1 mx-1">{time}</span>
      </div>
    </div>
  );
};

// ─── Conversation list item ────────────────────────────────────────────────────
const ConvItem = ({ conv, active, onClick, onlineUsers }) => {
  const isOnline = onlineUsers.includes(conv.otherUser?._id);
  return (
    <div
      onClick={() => onClick(conv.otherUser?._id)}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        active ? "bg-brand-600/20 border border-brand-500/30" : "hover:bg-white/5"
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-800 flex items-center justify-center text-sm font-bold">
          {conv.otherUser?.name?.[0] || "?"}
        </div>
        {isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-green rounded-full border-2" style={{ borderColor: "var(--bg-secondary)" }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm truncate">{conv.otherUser?.name}</span>
          {conv.lastMessage && (
            <span className="text-xs text-white/25 flex-shrink-0 ml-2">
              {format(new Date(conv.lastMessageAt), "h:mm a")}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-white/40 truncate">
            {conv.lastMessage?.text || "Start a conversation..."}
          </p>
          {conv.unreadCount > 0 && (
            <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              {conv.unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── New Chat Modal ────────────────────────────────────────────────────────────
const NewChatModal = ({ onClose, onSelect, currentUserId }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatAPI.getAllUsers().then((res) => {
      setUsers(res.data.users);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="card w-full max-w-sm animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display font-bold">New Message</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
        </div>
        <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
          <input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field text-sm"
            autoFocus
          />
        </div>
        <div className="max-h-72 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-white/30 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-white/30 text-sm">No students found</div>
          ) : (
            filtered.map((u) => (
              <div
                key={u._id}
                onClick={() => { onSelect(u._id); onClose(); }}
                className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-brand-600/30 flex items-center justify-center text-sm font-bold">
                  {u.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{u.name}</p>
                  <p className="text-white/40 text-xs">{u.department} · Year {u.year || "?"}</p>
                </div>
                {u.isOnline && <div className="ml-auto w-2 h-2 bg-accent-green rounded-full" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Chat Page ────────────────────────────────────────────────────────────
export default function Chat() {
  const { userId: paramUserId } = useParams();
  const { user } = useAuth();
  const { getSocket, onlineUsers } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null); // { conversationId, otherUser }
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [convsLoading, setConvsLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [mobileShowConvs, setMobileShowConvs] = useState(true);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Load all conversations
  const loadConversations = useCallback(async () => {
    try {
      const res = await chatAPI.getConversations();
      setConversations(res.data.conversations);
    } catch (_) {}
    setConvsLoading(false);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Open conversation with a specific user (from URL param)
  useEffect(() => {
    if (paramUserId) {
      openConversation(paramUserId);
    }
  }, [paramUserId]);

  // Open or create conversation
  const openConversation = async (targetUserId) => {
    setLoading(true);
    try {
      const res = await chatAPI.getOrCreateConversation(targetUserId);
      const { conversationId, otherUser } = res.data;
      setActiveConv({ conversationId, otherUser });

      // Join socket room
      const socket = getSocket();
      if (socket) socket.emit("join_room", conversationId);

      // Load messages
      const msgRes = await chatAPI.getMessages(conversationId);
      setMessages(msgRes.data.messages);
      setMobileShowConvs(false);

      // Refresh conversations to update unread counts
      await loadConversations();
    } catch (_) {
      toast.error("Failed to open conversation");
    } finally {
      setLoading(false);
    }
  };

  // Socket: receive messages & typing events
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeConv) return;

    const handleReceive = (msg) => {
      // Only add if from the current conversation
      if (msg.conversationId === activeConv.conversationId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
      loadConversations(); // refresh sidebar
    };

    const handleTyping = (data) => {
      if (data.userId !== user._id) setOtherTyping(true);
    };
    const handleStopTyping = () => setOtherTyping(false);

    socket.on("receive_message", handleReceive);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
    };
  }, [activeConv, getSocket, user._id, loadConversations]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    const text = newMessage.trim();
    setNewMessage("");

    try {
      const res = await chatAPI.sendMessage({
        conversationId: activeConv.conversationId,
        text,
      });
      const msg = res.data.message;
      // Add to local messages immediately
      setMessages((prev) => [...prev, msg]);
      // Emit via socket for real-time delivery
      const socket = getSocket();
      if (socket) {
        socket.emit("send_message", {
          roomId: activeConv.conversationId,
          message: msg,
        });
        socket.emit("stop_typing", { roomId: activeConv.conversationId, userId: user._id });
      }
      loadConversations();
    } catch (_) {
      toast.error("Failed to send message");
      setNewMessage(text); // restore
    }
  };

  // Typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    const socket = getSocket();
    if (!socket || !activeConv) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", {
        roomId: activeConv.conversationId,
        userId: user._id,
        username: user.name,
      });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit("stop_typing", { roomId: activeConv.conversationId, userId: user._id });
    }, 1500);
  };

  const formatDateSeparator = (date) => {
    if (isToday(new Date(date))) return "Today";
    if (isYesterday(new Date(date))) return "Yesterday";
    return format(new Date(date), "MMMM d, yyyy");
  };

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = format(new Date(msg.createdAt), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

  return (
    <div className="h-[calc(100vh-64px)] flex page-enter" style={{ background: "var(--bg-primary)" }}>

      {/* ─── Sidebar ────────────────────────────────────────────────────────── */}
      <div className={`${mobileShowConvs ? "flex" : "hidden"} md:flex flex-col w-full md:w-80 border-r flex-shrink-0`}
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>

        {/* Sidebar header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display font-bold text-lg">Messages</h2>
          <button
            onClick={() => setShowNewChat(true)}
            className="w-8 h-8 rounded-lg bg-brand-600/20 text-brand-400 hover:bg-brand-600/30 flex items-center justify-center text-lg transition-all"
            title="New conversation"
          >+</button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto p-2">
          {convsLoading ? (
            <div className="space-y-2 p-2">
              {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3 opacity-20">💬</div>
              <p className="text-white/30 text-sm">No conversations yet</p>
              <button onClick={() => setShowNewChat(true)} className="btn-primary mt-3 text-xs py-2 px-4">
                Start Chatting
              </button>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConvItem
                key={conv._id}
                conv={conv}
                active={activeConv?.conversationId === conv._id}
                onClick={openConversation}
                onlineUsers={onlineUsers}
              />
            ))
          )}
        </div>
      </div>

      {/* ─── Chat Area ──────────────────────────────────────────────────────── */}
      <div className={`${!mobileShowConvs ? "flex" : "hidden"} md:flex flex-col flex-1 min-w-0`}>
        {!activeConv ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="text-7xl mb-4 opacity-10">💬</div>
            <p className="text-white/30 text-xl font-display font-bold">Select a conversation</p>
            <p className="text-white/20 text-sm mt-2">Or start a new one to connect with classmates</p>
            <button onClick={() => setShowNewChat(true)} className="btn-primary mt-4">
              + New Message
            </button>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b flex items-center gap-3"
              style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
              {/* Mobile back button */}
              <button
                onClick={() => setMobileShowConvs(true)}
                className="md:hidden text-white/50 hover:text-white mr-1"
              >←</button>

              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-800 flex items-center justify-center font-bold">
                  {activeConv.otherUser?.name?.[0] || "?"}
                </div>
                {onlineUsers.includes(activeConv.otherUser?._id) && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-accent-green rounded-full border-2" style={{ borderColor: "var(--bg-secondary)" }} />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">{activeConv.otherUser?.name}</p>
                <p className="text-xs text-white/30">
                  {onlineUsers.includes(activeConv.otherUser?._id) ? (
                    <span className="text-accent-green">● Online</span>
                  ) : (
                    `${activeConv.otherUser?.department || "Student"}`
                  )}
                </p>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                </div>
              ) : Object.keys(groupedMessages).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-5xl mb-3 opacity-20">👋</div>
                  <p className="text-white/30 text-sm">Say hello to {activeConv.otherUser?.name?.split(" ")[0]}!</p>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date}>
                    {/* Date separator */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                      <span className="text-xs text-white/25 px-2">{formatDateSeparator(date)}</span>
                      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                    </div>
                    {msgs.map((msg) => (
                      <MessageBubble
                        key={msg._id}
                        msg={msg}
                        isMe={msg.sender?._id === user._id || msg.sender === user._id}
                      />
                    ))}
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {otherTyping && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">
                    {activeConv.otherUser?.name?.[0]}
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border)" }}>
                    <div className="flex gap-1 items-center h-3">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-3 border-t" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
              <form onSubmit={handleSend} className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder={`Message ${activeConv.otherUser?.name?.split(" ")[0]}...`}
                  rows={1}
                  className="flex-1 input-field resize-none text-sm py-2.5 max-h-32"
                  style={{ lineHeight: "1.5" }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 rounded-xl bg-brand-600 disabled:opacity-30 hover:bg-brand-500 transition-all active:scale-95 flex items-center justify-center flex-shrink-0"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                  </svg>
                </button>
              </form>
              <p className="text-white/15 text-xs mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onSelect={openConversation}
          currentUserId={user._id}
        />
      )}
    </div>
  );
}
