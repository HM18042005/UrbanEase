import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
const Header = ({ isLoggedIn = false, userType = 'user' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    // Logout logic would go here
    localStorage.removeItem('token');
    navigate('/');
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
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              )}
              {userType === 'admin' && (
                <Link to="/admin" className="nav-link">Admin</Link>
              )}
            </>
          ) : (
            <>
              <Link to="/become-pro" className="nav-link">Become a Pro</Link>
              <Link to="/" className="nav-link">Log in</Link>
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
                  src="/api/placeholder/32/32" 
                  alt="Profile" 
                  className="profile-avatar"
                />
              </button>
              
              {showProfile && (
                <div className="profile-dropdown">
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <Link to="/settings" className="dropdown-item">Settings</Link>
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
