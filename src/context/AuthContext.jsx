import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkIsAdmin = (userData) => {
    return userData && (userData.role === 'vendor' || userData.role === 'admin');
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const data = await authAPI.me();
          console.log('User data from /api/auth/me:', data); // Debug log
          console.log('User name:', data?.name); // Debug name specifically
          console.log('User email:', data?.email); // Debug email
          setUser(data);
          setIsAuthenticated(true);
          setIsAdmin(checkIsAdmin(data));
        } catch (err) {
          console.error('Failed to fetch current user:', err);
          localStorage.removeItem('access_token');
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const signup = async (name, email, password, role) => {
    const data = await authAPI.register(name, email, password, role);
    // after successful register, auto-login to receive JWT
    try {
      const loginResp = await authAPI.login(email, password);
      if (loginResp && loginResp.access_token) {
        localStorage.setItem('access_token', loginResp.access_token);
        const me = await authAPI.me();
        setUser(me);
        setIsAuthenticated(true);
        setIsAdmin(checkIsAdmin(me));
      }
    } catch (err) {
      console.warn('Auto-login after signup failed:', err);
    }
    return data;
  };

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    
    // Check if response has success status and proper structure
    if (response && response.status === "success" && response.data && response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      
      // Use the user data from the login response instead of making extra API call
      const userData = {
        ...response.data, // Includes email, name, role, etc.
        id: response.data.sub || response.data.user_id // Handle different ID fields
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(checkIsAdmin(userData));
      return userData;
    }
    
    // Handle different error response formats
    if (response && response.message) {
      throw new Error(response.message);
    }
    
    if (response && response.detail) {
      throw new Error(response.detail);
    }
    
    throw new Error('Login failed');
  };

  const logout = async () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
