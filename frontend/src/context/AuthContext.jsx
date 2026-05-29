import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const saveSession = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      saveSession(data.token, data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }, [saveSession]);

  const register = useCallback(async (formData) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(formData);
      saveSession(data.token, data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }, [saveSession]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    const { data } = await authAPI.updatePassword({ currentPassword, newPassword });
    return data;
  }, []);

  // Refresh user from server on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      authAPI.me()
        .then(({ data }) => setUser(data.user))
        .catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); });
    }
  }, []); // eslint-disable-line

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
