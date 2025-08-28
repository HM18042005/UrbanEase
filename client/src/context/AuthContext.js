import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Auth from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Auth.me()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await Auth.login({ email, password });
    setUser(res.user);
    return res;
  };

  const register = async (name, email, password, role = 'customer') => {
    const res = await Auth.register({ name, email, password, role });
    setUser(res.user);
    return res;
  };

  const logout = async () => {
    await Auth.logout();
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
