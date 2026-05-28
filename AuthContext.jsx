import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Check if token is valid on initial load
  useEffect(() => {
    const verifyUserSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/api/auth/profile');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('Session validation failed. Cleared token.', err.customMessage);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyUserSession();
  }, [token]);

  // Signup Handler
  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/signup', { name, email, password });
      if (res.data.success) {
        const { token: jwtToken, user: userData } = res.data;
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(jwtToken);
        setUser(userData);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.customMessage || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  // Login Handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data.success) {
        const { token: jwtToken, user: userData } = res.data;
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(jwtToken);
        setUser(userData);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.customMessage || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout Handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
