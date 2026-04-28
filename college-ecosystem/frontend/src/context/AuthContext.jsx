/**
 * Auth Context
 * Global authentication state management
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // True until initial auth check

  // ─── Initialize from localStorage ──────────────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem("ce_token");
    const storedUser = localStorage.getItem("ce_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("ce_user");
      }
    }
    setLoading(false);
  }, []);

  // ─── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("ce_token", newToken);
    localStorage.setItem("ce_user", JSON.stringify(newUser));
    return res.data;
  }, []);

  // ─── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("ce_token", newToken);
    localStorage.setItem("ce_user", JSON.stringify(newUser));
    return res.data;
  }, []);

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("ce_token");
    localStorage.removeItem("ce_user");
  }, []);

  // ─── Update local user data ─────────────────────────────────────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("ce_user", JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
