/**
 * Socket Context
 * Manages Socket.io connection for real-time features
 */

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Connect/disconnect socket based on auth state
  useEffect(() => {
    if (user && token) {
      // Create socket connection
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      const socket = socketRef.current;

      socket.on("connect", () => {
        setIsConnected(true);
        // Tell server this user is online
        socket.emit("user_online", user._id);
        console.log("🔌 Socket connected");
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        console.log("❌ Socket disconnected");
      });

      socket.on("online_users", (users) => {
        setOnlineUsers(users);
      });

      return () => {
        socket.disconnect();
        setIsConnected(false);
      };
    }
  }, [user, token]);

  const getSocket = () => socketRef.current;

  return (
    <SocketContext.Provider value={{ getSocket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};

export default SocketContext;
