import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('samvadai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('samvadai_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('samvadai_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
        localStorage.removeItem('samvadai_token');
        localStorage.removeItem('samvadai_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success && data.token) {
      localStorage.setItem('samvadai_token', data.token);
      localStorage.setItem('samvadai_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    }
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.success && data.token) {
      localStorage.setItem('samvadai_token', data.token);
      localStorage.setItem('samvadai_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    }
  }, []);

  const guestLogin = useCallback(async (preferredLanguage = 'en') => {
    try {
      const { data } = await api.post('/auth/guest', { preferredLanguage });
      if (data.success && data.token) {
        localStorage.setItem('samvadai_token', data.token);
        localStorage.setItem('samvadai_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.warn('Backend /auth/guest unreachable, establishing resilient local guest session:', err);
    }

    // Always establish guest session even if backend is waking up from cold-start
    const localGuestUser = {
      isGuest: true,
      guestId: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: 'Guest User',
      role: 'guest',
      preferred_language: preferredLanguage
    };
    localStorage.setItem('samvadai_user', JSON.stringify(localGuestUser));
    setUser(localGuestUser);
    return localGuestUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('samvadai_token');
    localStorage.removeItem('samvadai_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isGuest: !!user?.isGuest,
        loading,
        login,
        register,
        guestLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
