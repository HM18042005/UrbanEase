import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import PropTypes from 'prop-types';

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

  const login = useCallback(async (email, password) => {
    const res = await Auth.login({ email, password });
    if (res.token) {
      localStorage.setItem('token', res.token);
    }
    setUser(res.user);
    return res;
  }, []);

  const register = useCallback(async (name, email, password, role = 'customer') => {
    const res = await Auth.register({ name, email, password, role });
    if (res.token) {
      localStorage.setItem('token', res.token);
    }
    setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await Auth.logout();
    } catch (error) {
      // Continue with logout even if server call fails
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: !!user, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
