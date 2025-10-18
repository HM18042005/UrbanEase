import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import { Link } from 'react-router-dom';

import './Dashboard.css';
import { bookingAPI, serviceAPI, clientAPI } from '../../api/services';
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
    pendingBookings: 0,
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
        upcomingBookings: bookings.filter((b) =>
          ['pending', 'confirmed'].includes(b.status?.toLowerCase())
        ).length,
        completedBookings: bookings.filter((b) => b.status?.toLowerCase() === 'completed').length,
        pendingBookings: bookings.filter((b) => b.status?.toLowerCase() === 'pending').length,
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
      case 'confirmed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'completed':
        return '#007bff';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="dashboard-page">
      <Header />

      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="page-title">Dashboard</h1>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-content">
                <div className="stat-value">${dashboardData.totalEarnings.toLocaleString()}</div>
                <div className="stat-label">Total Earnings</div>
              </div>
              <div className="stat-icon">💰</div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{dashboardData.newRequests}</div>
                <div className="stat-label">New Requests</div>
              </div>
              <div className="stat-icon">📋</div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{dashboardData.upcomingAppointments}</div>
                <div className="stat-label">Upcoming Appointments</div>
              </div>
              <div className="stat-icon">📅</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="dashboard-content">
            {/* Left Column */}
            <div className="dashboard-left">
              {/* Earnings Chart */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Earnings Over Time</h3>
                  <div className="earnings-growth">
                    <span className="growth-label">Last {dashboardData.lastPeriod} Days</span>
                    <span className="growth-value positive">+{dashboardData.earningsGrowth}%</span>
                  </div>
                </div>
                <div className="earnings-amount">
                  <span className="amount-value">
                    ${dashboardData.totalEarnings.toLocaleString()}
                  </span>
                </div>
                <div className="chart-container">
                  <div className="simple-chart">
                    {earningsData.map((data, index) => (
                      <div key={index} className="chart-bar">
                        <div
                          className="bar"
                          style={{ height: `${(data.earnings / 1400) * 100}%` }}
                        ></div>
                        <span className="bar-label">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Availability</h3>
                </div>
                <div className="availability-content">
                  <div className="availability-status">
                    <span
                      className={`status-indicator ${dashboardData.isAvailable ? 'available' : 'unavailable'}`}
                    >
                      {dashboardData.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <span className="status-description">
                      Currently {dashboardData.isAvailable ? 'accepting' : 'not accepting'} new
                      bookings
                    </span>
                  </div>
                  <button
                    className={`availability-toggle ${dashboardData.isAvailable ? 'available' : 'unavailable'}`}
                    onClick={toggleAvailability}
                  >
                    {dashboardData.isAvailable ? 'Set as Unavailable' : 'Set as Available'}
                  </button>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Recent Reviews</h3>
                </div>
                <div className="reviews-list">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <span className="reviewer-name">{review.customerName}</span>
                          <span className="review-date">{review.date}</span>
                        </div>
                        <div className="review-rating">{'⭐'.repeat(review.rating)}</div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="dashboard-right">
              {/* New Requests */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">New Requests</h3>
                </div>
                <div className="requests-content">
                  {newRequests.length === 0 ? (
                    <div className="no-requests">
                      <div className="no-requests-icon">📭</div>
                      <h4>No new requests</h4>
                      <p>
                        You have no new service requests at the moment. Check back later or adjust
                        your availability to attract more clients.
                      </p>
                    </div>
                  ) : (
                    <div className="requests-list">
                      {newRequests.map((request) => (
                        <div key={request.id} className="request-item">
                          {/* Request content would go here */}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Quick Actions</h3>
                </div>
                <div className="quick-actions">
                  <Link to="/provider/services" className="action-btn primary">
                    <span className="btn-icon">⚙️</span>
                    Manage Services
                  </Link>
                  <Link to="/provider/messages" className="action-btn">
                    <span className="btn-icon">💬</span>
                    Message Customers
                  </Link>
                  <Link to="/provider/schedule" className="action-btn">
                    <span className="btn-icon">�</span>
                    Update Schedule
                  </Link>
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
