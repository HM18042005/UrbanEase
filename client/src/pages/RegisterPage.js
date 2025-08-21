import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/home');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join UrbanEase in a minute</p>
          </div>

          <div className="auth-social">
            <button type="button" className="social-btn">
              <span className="social-icon">🟦</span>
              Sign up with Google
            </button>
            <button type="button" className="social-btn">
              <span className="social-icon"></span>
              Sign up with Apple
            </button>
          </div>

          <div className="auth-divider"><span>or</span></div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={onSubmit}>
            <label className="auth-label">Full Name</label>
            <input
              className="auth-input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="auth-link">Sign in</Link>
          </div>
        </div>

        <div className="auth-aside" aria-hidden>
          <div className="halftone" />
        </div>
      </div>
    </div>
  );
}
