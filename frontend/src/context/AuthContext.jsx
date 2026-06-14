import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user from profile endpoint
  const loadUser = async () => {
    const token = localStorage.getItem('trimr_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/api/auth/me');
      setUser(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load user session:', err.response?.data?.message || err.message);
      // If token expired/invalid, clear it
      localStorage.removeItem('trimr_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('trimr_token', res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
      });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Signup handler
  const signup = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/api/auth/signup', { name, email, password });
      localStorage.setItem('trimr_token', res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
      });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Try again.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('trimr_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        loadUser,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
