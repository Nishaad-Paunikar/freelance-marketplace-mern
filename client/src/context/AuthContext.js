import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Helper: parse stored user safely ────────────────────────────────────────
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('fm_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── Provider ────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('fm_token') || null);

  /**
   * Persist login to state + localStorage.
   * @param {object} userData  - { id, name, email, role }
   * @param {string} jwtToken  - raw JWT string
   */
  const login = useCallback((userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('fm_user',  JSON.stringify(userData));
    localStorage.setItem('fm_token', jwtToken);
  }, []);

  /**
   * Clear all auth state.
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fm_user');
    localStorage.removeItem('fm_token');
  }, []);

  // Derived helpers
  const isAuthenticated = Boolean(token && user);
  const isClient      = isAuthenticated && user?.role === 'client';
  const isFreelancer  = isAuthenticated && user?.role === 'freelancer';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isClient, isFreelancer }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Custom hook ─────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
