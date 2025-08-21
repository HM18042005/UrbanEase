import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

/**
 * Header Component
 * 
 * What: Navigation header with logo, menu items, and user actions
 * When: Used on all pages except landing page
 * Why: Provides consistent navigation and branding across the application
 * 
 * Features:
 * - Responsive navigation menu
 * - User authentication state management
 * - Search functionality
 * - Profile dropdown menu
 */
const Header = ({ isLoggedIn: isLoggedInProp, userType: userTypeProp = 'user' }) => {
  const { user, logout } = useAuth() || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = typeof isLoggedInProp === 'boolean' ? isLoggedInProp : !!user;
  const userType = user?.role || userTypeProp;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${searchQuery}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout?.();
    } finally {
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/home" className="logo">
          <span className="logo-icon">🏢</span>
          UrbanEase
        </Link>

        <nav className="nav-menu">
          <Link to="/home" className="nav-link">Home</Link>
          <Link to="/services" className="nav-link">Services</Link>
      {isLoggedIn ? (
            <>
              <Link to="/bookings" className="nav-link">Bookings</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              {userType === 'provider' && (
                <Link to="/provider" className="nav-link">Dashboard</Link>
              )}
              {userType === 'admin' && (
                <Link to="/admin" className="nav-link">Admin</Link>
              )}
        <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <>
        <Link to="/login" className="nav-link">Log in</Link>
            </>
          )}
        </nav>

        <div className="header-actions">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>

          {isLoggedIn && (
            <div className="profile-menu">
              <button 
                className="profile-btn"
                onClick={() => setShowProfile(!showProfile)}
              >
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" 
                  alt="Profile" 
                  className="profile-avatar"
                />
              </button>
              
              {showProfile && (
                <div className="profile-dropdown">
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <Link to="/bookings" className="dropdown-item">Bookings</Link>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
