import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('cafe_token');
    const storedUser = localStorage.getItem('cafe_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: jwt, id, fullName, role, verified } = response.data;
      
      const userData = { id, fullName, email, role, verified };
      setUser(userData);
      setToken(jwt);
      
      localStorage.setItem('cafe_token', jwt);
      localStorage.setItem('cafe_user', JSON.stringify(userData));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (fullName, email, phoneNumber, address, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/register', {
        fullName,
        email,
        phoneNumber,
        address,
        password
      });
      setLoading(false);
      return response.data.message;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Registration failed.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const verify = async (email, code) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/verify', { email, code });
      setLoading(false);
      return response.data.message;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Verification failed.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      setLoading(false);
      return response.data.message;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Forgot password request failed.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/reset-password', { email, code, newPassword });
      setLoading(false);
      return response.data.message;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Password reset failed.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cafe_token');
    localStorage.removeItem('cafe_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = (updatedDetails) => {
    const updatedUser = { ...user, ...updatedDetails };
    setUser(updatedUser);
    localStorage.setItem('cafe_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, verify, forgotPassword, resetPassword, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
