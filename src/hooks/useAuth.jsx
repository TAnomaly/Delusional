/**
 * Auth hook - manages login state.
 */
import { useState, createContext, useContext } from "react";
import { isAuthenticated, setToken, clearToken } from "../utils/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());

  const login = (token) => {
    setToken(token);
    setLoggedIn(true);
  };

  const logout = () => {
    clearToken();
    setLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
}
