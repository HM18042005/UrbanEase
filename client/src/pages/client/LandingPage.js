import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../LandingPage.css';

/**
 * LandingPage Component
 * 
 * What: Login and signup page with tabs for switching between modes
 * When: First page users see when visiting the application
 * Why: Handles user authentication and registration
 * 
 * Features:
 * - Tab-based interface for login/signup
 * - Form validation
 * - Responsive design
 * - Integration with authentication API
 */
const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    userType: 'user' // user, provider, admin
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (activeTab === 'signup') {
      if (!formData.fullName) {
        setError('Full name is required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store token and redirect
      localStorage.setItem('token', 'dummy-token');
      localStorage.setItem('userType', formData.userType);
      
      navigate('/home');
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="header-container">
          <div className="logo">
            <span className="logo-icon">🏢</span>
            UrbanEase
          </div>
          <nav className="nav-links">
            <a href="#services">Services</a>
            <a href="#login">Log in</a>
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <div className="auth-container">
          <h1 className="welcome-title">Welcome to UrbanEase</h1>
          
          <div className="auth-tabs">
            <button 
              className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Log in
            </button>
            <button 
              className={`tab-button ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {activeTab === 'signup' && (
              <div className="form-group">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Phone number or email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            {activeTab === 'signup' && (
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            {activeTab === 'signup' && (
              <>
                <div className="form-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="user">Customer</option>
                    <option value="provider">Service Provider</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === 'login' && (
              <div className="forgot-password">
                <a href="#forgot">Forgot Password?</a>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Loading...' : (activeTab === 'login' ? 'Log in' : 'Sign up')}
            </button>

            <div className="terms-text">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
