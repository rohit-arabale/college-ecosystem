/**
 * College Ecosystem - Main Server Entry Point
 * Sets up Express server, Socket.io, database connection, and all routes
 */

const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Configure Socket.io for real-time chat
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/marketplace", require("./routes/marketplace"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/events", require("./routes/events"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/notifications", require("./routes/notifications"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "College Ecosystem API is running 🎓" });
});

// ─── Socket.io Real-Time Chat ─────────────────────────────────────────────────
const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // User comes online
  socket.on("user_online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("online_users", Array.from(onlineUsers.keys()));
    console.log(`👤 User ${userId} is online`);
  });

  // Join a private chat room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`🚪 Socket ${socket.id} joined room ${roomId}`);
  });

  // Send message in a room
  socket.on("send_message", async (data) => {
    const { roomId, message } = data;
    // Broadcast message to everyone in the room
    io.to(roomId).emit("receive_message", message);
  });

  // Typing indicator
  socket.on("typing", (data) => {
    socket.to(data.roomId).emit("user_typing", {
      userId: data.userId,
      username: data.username,
    });
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.roomId).emit("user_stop_typing", { userId: data.userId });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    // Find and remove disconnected user
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("online_users", Array.from(onlineUsers.keys()));
        console.log(`❌ User ${userId} went offline`);
        break;
      }
    }
  });
});

// Make io accessible to controllers via app
app.set("io", io);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❗ Server Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV || "development"}\n`);
});
