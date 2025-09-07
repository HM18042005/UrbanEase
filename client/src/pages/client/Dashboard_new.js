import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { bookingAPI, serviceAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

/**
 * Dashboard Component (Client Dashboard)
 * 
 * What: Client's main dashboard showing bookings, favorite services, and account overview
 * When: Accessed by clients to manage their bookings and account
 * Why: Provides overview of client's services and allows management of bookings
 * 
 * Features:
 * - Recent bookings overview
 * - Upcoming appointments
 * - Favorite services
 * - Quick actions for booking
 */
const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    pendingBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [favoriteServices, setFavoriteServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch client's bookings
      const bookingsResponse = await bookingAPI.getMyBookings();
      const bookings = bookingsResponse.data || [];
      
      // Calculate statistics
      const stats = {
        totalBookings: bookings.length,
        upcomingBookings: bookings.filter(b => 
          ['pending', 'confirmed'].includes(b.status?.toLowerCase())
        ).length,
        completedBookings: bookings.filter(b => 
          b.status?.toLowerCase() === 'completed'
        ).length,
        pendingBookings: bookings.filter(b => 
          b.status?.toLowerCase() === 'pending'
        ).length
      };
      
      setDashboardData(stats);
      
      // Get recent bookings (last 5)
      const recent = bookings
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 5);
      setRecentBookings(recent);

      // Fetch favorite services (or popular services if no favorites API)
      try {
        const featuredResponse = await serviceAPI.getFeaturedServices();
        setFavoriteServices(featuredResponse.data?.slice(0, 6) || []);
      } catch (serviceError) {
        console.error('Error fetching favorite services:', serviceError);
        setFavoriteServices([]);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'completed': return '#007bff';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Header />
        <main className="dashboard-main">
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner">Loading your dashboard...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Header />
      
      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="page-title">Welcome back, {user?.name || 'User'}!</h1>
            <p className="dashboard-subtitle">Here's what's happening with your services</p>
          </div>

          {error && (
            <div className="error-container">
              <div className="error-message">
                <h3>Failed to Load Dashboard</h3>
                <p>{error}</p>
                <button 
                  className="retry-button"
                  onClick={fetchDashboardData}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-content">
                <div className="stat-value">{dashboardData.totalBookings}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-icon">📋</div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{dashboardData.upcomingBookings}</div>
                <div className="stat-label">Upcoming</div>
              </div>
              <div className="stat-icon">📅</div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{dashboardData.completedBookings}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-icon">✅</div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{dashboardData.pendingBookings}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-icon">⏳</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="dashboard-content">
            {/* Left Column */}
            <div className="dashboard-left">
              {/* Recent Bookings */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Recent Bookings</h3>
                  <Link to="/bookings" className="view-all-link">View All</Link>
                </div>
                <div className="bookings-list">
                  {recentBookings.length === 0 ? (
                    <div className="no-bookings">
                      <div className="no-bookings-icon">📅</div>
                      <h4>No bookings yet</h4>
                      <p>You haven't made any bookings yet. Start by browsing our services!</p>
                      <Link to="/services" className="action-btn primary">
                        Browse Services
                      </Link>
                    </div>
                  ) : (
                    recentBookings.map(booking => (
                      <div key={booking._id || booking.id} className="booking-item">
                        <div className="booking-info">
                          <h4 className="booking-service">
                            {booking.serviceName || booking.service || 'Service'}
                          </h4>
                          <p className="booking-provider">
                            Provider: {booking.providerName || booking.provider || 'Not specified'}
                          </p>
                          <p className="booking-date">
                            {formatDate(booking.date)} at {booking.time || 'TBD'}
                          </p>
                        </div>
                        <div className="booking-status">
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(booking.status) }}
                          >
                            {booking.status || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Quick Actions</h3>
                </div>
                <div className="quick-actions">
                  <Link to="/services" className="action-btn primary">
                    <span className="btn-icon">🔍</span>
                    Browse Services
                  </Link>
                  <Link to="/bookings" className="action-btn">
                    <span className="btn-icon">📅</span>
                    My Bookings
                  </Link>
                  <Link to="/profile" className="action-btn">
                    <span className="btn-icon">👤</span>
                    Update Profile
                  </Link>
                  <Link to="/messages" className="action-btn">
                    <span className="btn-icon">💬</span>
                    Messages
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="dashboard-right">
              {/* Popular Services */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Popular Services</h3>
                  <Link to="/services" className="view-all-link">View All</Link>
                </div>
                <div className="services-grid">
                  {favoriteServices.length === 0 ? (
                    <div className="no-services">
                      <p>No services available at the moment.</p>
                    </div>
                  ) : (
                    favoriteServices.map(service => (
                      <div key={service._id || service.id} className="service-item">
                        <div className="service-image">
                          <img 
                            src={service.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'} 
                            alt={service.name || service.title || 'Service'}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
                            }}
                          />
                        </div>
                        <div className="service-info">
                          <h4 className="service-name">
                            {service.name || service.title || 'Service'}
                          </h4>
                          <p className="service-price">
                            ${service.price || 0}
                          </p>
                          <Link 
                            to={`/service/${service._id || service.id}`}
                            className="service-link"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tips Section */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Tips for You</h3>
                </div>
                <div className="tips-content">
                  <div className="tip-item">
                    <div className="tip-icon">💡</div>
                    <div className="tip-text">
                      <h4>Book in advance</h4>
                      <p>Schedule your services ahead of time to ensure availability with your preferred providers.</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <div className="tip-icon">⭐</div>
                    <div className="tip-text">
                      <h4>Leave reviews</h4>
                      <p>Help other customers by leaving honest reviews after your service is completed.</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <div className="tip-icon">🔔</div>
                    <div className="tip-text">
                      <h4>Stay connected</h4>
                      <p>Keep your profile updated and check messages regularly for service updates.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
