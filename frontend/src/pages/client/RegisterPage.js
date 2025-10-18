import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      // Redirect based on role
      const redirectPath = role === 'provider' ? '/provider' : '/home';
      navigate(redirectPath);
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

          <div className="auth-divider">
            <span>or</span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={onSubmit}>
            <label className="auth-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="auth-input"
              placeholder="Enter your full name"
              value={name}
              id="fullName"
              onChange={(e) => setName(e.target.value)}
              required
            />

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

            <label className="auth-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              className="auth-input"
              placeholder="Create a password"
              value={password}
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <fieldset className="role-selection" aria-labelledby="accountTypeLegend">
              <legend id="accountTypeLegend" className="auth-label">
                Account Type
              </legend>
              <div className="role-option">
                <input
                  type="radio"
                  id="customer"
                  name="role"
                  value="customer"
                  checked={role === 'customer'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <label htmlFor="customer" className="role-label">
                  <div className="role-icon">👤</div>
                  <div className="role-info">
                    <div className="role-title">Customer</div>
                    <div className="role-description">Book services and manage appointments</div>
                  </div>
                </label>
              </div>

              <div className="role-option">
                <input
                  type="radio"
                  id="provider"
                  name="role"
                  value="provider"
                  checked={role === 'provider'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <label htmlFor="provider" className="role-label">
                  <div className="role-icon">💼</div>
                  <div className="role-info">
                    <div className="role-title">Service Provider</div>
                    <div className="role-description">Offer services and manage business</div>
                  </div>
                </label>
              </div>
            </fieldset>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="auth-link">
              Sign in
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

export default RegisterPage;
