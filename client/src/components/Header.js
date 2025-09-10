import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = ({ isLoggedIn: isLoggedInProp, userType: userTypeProp = 'user' }) => {
  const { user, logout } = useAuth() || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle desktop-hidden"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${showMobileMenu ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <nav className={`nav-menu ${showMobileMenu ? 'mobile-open' : ''}`}>
          {userType === 'provider' ? (
            // Provider-specific navigation
            <>
              <Link to="/provider/services" className="nav-link">
                <span className="nav-icon">🔧</span>
                Manage Services
              </Link>
              <Link to="/provider/messages" className="nav-link">
                <span className="nav-icon">💬</span>
                Message Customers
              </Link>
              <Link to="/provider/schedule" className="nav-link">
                <span className="nav-icon">📅</span>
                Schedule
              </Link>
              <Link to="/provider/reports" className="nav-link">
                <span className="nav-icon">📊</span>
                Reports
              </Link>
              
            </>
          ) : userType === 'admin' ? (
            // Admin-specific navigation
            <>
              <Link to="/admin" className="nav-link">
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
              <Link to="/admin/users" className="nav-link">
                <span className="nav-icon">👥</span>
                Users
              </Link>
              <Link to="/admin/services" className="nav-link">
                <span className="nav-icon">⚙️</span>
                Services
              </Link>
              <Link to="/admin/bookings" className="nav-link">
                <span className="nav-icon">📅</span>
                Bookings
              </Link>
              <Link to="/admin/reviews" className="nav-link">
                <span className="nav-icon">⭐</span>
                Reviews
              </Link>
              <Link to="/admin/reports" className="nav-link">
                <span className="nav-icon">📈</span>
                Reports
              </Link>
            </>
          ) : (
            // Regular user/client navigation
            <>
              <Link to="/home" className="nav-link">Home</Link>
              <Link to="/services" className="nav-link">Services</Link>
              {isLoggedIn && (
                <>
                  <Link to="/bookings" className="nav-link">Bookings</Link>
                  <Link to="/profile" className="nav-link">Profile</Link>
                </>
              )}
              {!isLoggedIn && (
                <Link to="/login" className="nav-link">Log in</Link>
              )}
            </>
          )}
          
          {isLoggedIn && (
            <button 
              onClick={handleLogout} 
              className="nav-link logout-btn" 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span className="nav-icon">🚪</span>
              Logout
            </button>
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
                <div className="profile-icon">
                  {userType === 'provider' ? '�' : userType === 'admin' ? '⚙️' : '👤'}
                </div>
                <span className="profile-role">
                  {userType === 'provider' ? 'Provider' : userType === 'admin' ? 'Admin' : 'User'}
                </span>
              </button>
              
              {showProfile && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <strong>{user?.name || 'User'}</strong>
                    <small>{userType === 'provider' ? 'Service Provider' : userType === 'admin' ? 'Administrator' : 'Customer'}</small>
                  </div>
                  <div className="dropdown-divider"></div>
                  
                  <Link to="/profile" className="dropdown-item">
                    <span className="dropdown-icon">👤</span>
                    Profile Settings
                  </Link>
                  
                  {userType === 'provider' ? (
                    <>
                      <Link to="/provider" className="dropdown-item">
                        <span className="dropdown-icon">📊</span>
                        Provider Dashboard
                      </Link>
                      <Link to="/provider/services" className="dropdown-item">
                        <span className="dropdown-icon">🔧</span>
                        My Services
                      </Link>
                      <Link to="/provider/messages" className="dropdown-item">
                        <span className="dropdown-icon">💬</span>
                        Messages
                      </Link>
                    </>
                  ) : userType === 'admin' ? (
                    <>
                      <Link to="/admin" className="dropdown-item">
                        <span className="dropdown-icon">�</span>
                        Admin Dashboard
                      </Link>
                      <Link to="/admin/users" className="dropdown-item">
                        <span className="dropdown-icon">👥</span>
                        Manage Users
                      </Link>
                      <Link to="/admin/services" className="dropdown-item">
                        <span className="dropdown-icon">🛠️</span>
                        Manage Services
                      </Link>
                      <Link to="/admin/bookings" className="dropdown-item">
                        <span className="dropdown-icon">📋</span>
                        Manage Bookings
                      </Link>
                      <Link to="/admin/reviews" className="dropdown-item">
                        <span className="dropdown-icon">⭐</span>
                        Manage Reviews
                      </Link>
                      <Link to="/admin/reports" className="dropdown-item">
                        <span className="dropdown-icon">📈</span>
                        Reports & Analytics
                      </Link>
                      <Link to="/admin/settings" className="dropdown-item">
                        <span className="dropdown-icon">⚙️</span>
                        System Settings
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/bookings" className="dropdown-item">
                        <span className="dropdown-icon">📅</span>
                        My Bookings
                      </Link>
                      {(user?.role === 'provider' || user?.role === 'admin') && (
                        <Link 
                          to={user.role === 'provider' ? '/provider' : '/admin'} 
                          className="dropdown-item"
                        >
                          <span className="dropdown-icon">
                            {user.role === 'provider' ? '💼' : '�'}
                          </span>
                          {user.role === 'provider' ? 'Provider Mode' : 'Admin Mode'}
                        </Link>
                      )}
                    </>
                  )}
                  
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <span className="dropdown-icon">🚪</span>
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
