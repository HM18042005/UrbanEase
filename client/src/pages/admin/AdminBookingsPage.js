import React from 'react';
import Header from '../../components/Header';
import '../AdminDashboard.css';
import { Link } from 'react-router-dom';

const AdminBookingsPage = () => {
  return (
    <div className="admin-dashboard-page">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>UrbanEase Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="nav-item">
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
          <Link to="/admin/users" className="nav-item">
            <span className="nav-icon">👥</span>
            Users
          </Link>
          <Link to="/admin/services" className="nav-item">
            <span className="nav-icon">🔧</span>
            Services
          </Link>
          <Link to="/admin/bookings" className="nav-item active">
            <span className="nav-icon">📅</span>
            Bookings
          </Link>
          <Link to="/admin/reviews" className="nav-item">
            <span className="nav-icon">⭐</span>
            Reviews
          </Link>
          <Link to="/admin/reports" className="nav-item">
            <span className="nav-icon">📈</span>
            Reports
          </Link>
        </nav>
      </div>

      <div className="admin-main">
  <Header />
        <div className="admin-content">
          <div className="admin-header">
            <h1 className="admin-title">Manage Bookings</h1>
          </div>
          <div className="admin-grid">
            <div className="admin-left">
              <div className="admin-card">
                <h3 className="card-title">Bookings</h3>
                {/* Booking management table or UI goes here */}
                <p>View, update status, or cancel bookings here.</p>
              </div>
            </div>
            <div className="admin-right">
              <div className="admin-card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions">
                  <button className="action-btn primary">
                    <span className="btn-icon">🔍</span>
                    Find Booking
                  </button>
                  <button className="action-btn">
                    <span className="btn-icon">✅</span>
                    Mark Completed
                  </button>
                  <button className="action-btn">
                    <span className="btn-icon">❌</span>
                    Cancel Booking
                  </button>
                  <Link to="/admin/reports" className="action-btn">
                    <span className="btn-icon">📈</span>
                    Generate Report
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
