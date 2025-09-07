import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Auth from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a token in localStorage before making the request
    const token = localStorage.getItem('token');
    if (token) {
      Auth.me()
        .then((res) => setUser(res.user))
        .catch(() => {
          // If token is invalid, remove it
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await Auth.login({ email, password });
    if (res.token) {
      localStorage.setItem('token', res.token);
    }
    setUser(res.user);
    return res;
  };

  const register = async (name, email, password, role = 'customer') => {
    const res = await Auth.register({ name, email, password, role });
    if (res.token) {
      localStorage.setItem('token', res.token);
    }
    setUser(res.user);
    return res;
  };

  const logout = async () => {
    try {
      await Auth.logout();
    } catch (error) {
      // Continue with logout even if server call fails
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user,
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
