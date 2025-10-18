import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { getDefaultRedirectPath } from '../../utils/roleUtils';
import './Auth.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loginResult = await login(email, password);
      // Get the user role from login result or context
      const userRole = loginResult?.user?.role || 'customer';
      const redirectPath = getDefaultRedirectPath(userRole);
      navigate(redirectPath);
    } catch (err) {
      setError(err?.response?.data?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-main">
          <div className="auth-header">
            <div className="auth-logo">⚡</div>
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-subtitle">Continue to access your dashboard</p>
          </div>
          <div className="auth-divider">
            <span>or</span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={onSubmit}>
            <label className="auth-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              value={email}
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="auth-row">
              <label className="auth-label" htmlFor="password">
                Password
              </label>
              <Link to="/forgot" className="auth-link">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              className="auth-input"
              placeholder="Enter your password"
              value={password}
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <span>New here?</span>
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </div>
        </div>

        <div className="auth-aside" aria-hidden>
          <div className="halftone" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
