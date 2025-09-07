import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import './AdminDashboard.css';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/services';

/**
 * AdminDashboard Component
 * 
 * What: Administrative dashboard for platform management and oversight
 * When: Accessed by admin users to monitor platform activity
 * Why: Provides comprehensive overview of platform metrics, user management, and system health
 * 
 * Features:
 * - Platform statistics overview
 * - Recent activity monitoring
 * - User feedback management
 * - Performance metrics and charts
 * - Quick admin actions
 */
const AdminDashboard = () => {
  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    activeServices: 0,
    liveBookings: 0,
    totalProviders: 0,
    totalClients: 0,
    totalRevenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [userFeedback, setUserFeedback] = useState([]);
  const [platformMetrics, setPlatformMetrics] = useState({
    bookingsGrowth: 0,
    servicePopularity: 0,
    userGrowth: 0,
    revenueGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminDashboardData();
  }, []);

  const fetchAdminDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch admin dashboard statistics
      const dashboardResponse = await adminAPI.getDashboardStats();
      const dashboardData = dashboardResponse.data;
      
      setAdminData({
        totalUsers: dashboardData.totalUsers || 0,
        activeServices: dashboardData.activeServices || 0,
        liveBookings: dashboardData.liveBookings || 0,
        totalProviders: dashboardData.totalProviders || 0,
        totalClients: dashboardData.totalClients || 0,
        totalRevenue: dashboardData.totalRevenue || 0
      });

      // Fetch recent activity
      try {
        const activityResponse = await adminAPI.getRecentActivity();
        setRecentActivity(activityResponse.data || []);
      } catch (activityError) {
        console.error('Error fetching recent activity:', activityError);
        setRecentActivity([]);
      }

      // Fetch user feedback/reviews
      try {
        const feedbackResponse = await adminAPI.getRecentFeedback();
        setUserFeedback(feedbackResponse.data || []);
      } catch (feedbackError) {
        console.error('Error fetching user feedback:', feedbackError);
        setUserFeedback([]);
      }

      // Fetch platform metrics
      try {
        const metricsResponse = await adminAPI.getPlatformMetrics();
        const metrics = metricsResponse.data;
        setPlatformMetrics({
          bookingsGrowth: metrics.bookingsGrowth || 0,
          servicePopularity: metrics.servicePopularity || 0,
          userGrowth: metrics.userGrowth || 0,
          revenueGrowth: metrics.revenueGrowth || 0
        });
      } catch (metricsError) {
        console.error('Error fetching platform metrics:', metricsError);
        setPlatformMetrics({
          bookingsGrowth: 0,
          servicePopularity: 0,
          userGrowth: 0,
          revenueGrowth: 0
        });
      }

    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'green';
      case 'in progress': return 'blue';
      case 'scheduled': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-sidebar">
          <div className="sidebar-header">
            <h2>UrbanEase Admin</h2>
          </div>
          <nav className="sidebar-nav">
            <Link to="/admin" className="nav-item active">
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
            <Link to="/admin/bookings" className="nav-item">
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
            <div className="loading-container">
              <div className="loading-spinner">Loading admin dashboard...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>UrbanEase Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="nav-item active">
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
          <Link to="/admin/bookings" className="nav-item">
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
            <h1 className="admin-title">Admin Dashboard</h1>
          </div>

          {error && (
            <div className="error-container">
              <div className="error-message">
                <h3>Failed to Load Dashboard Data</h3>
                <p>{error}</p>
                <button 
                  className="retry-button"
                  onClick={fetchAdminDashboardData}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Top Stats */}
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-value">{adminData.totalUsers.toLocaleString()}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{adminData.totalProviders.toLocaleString()}</div>
              <div className="stat-label">Providers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{adminData.totalClients.toLocaleString()}</div>
              <div className="stat-label">Clients</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{adminData.activeServices}</div>
              <div className="stat-label">Active Services</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{adminData.liveBookings}</div>
              <div className="stat-label">Live Bookings</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">${adminData.totalRevenue.toLocaleString()}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="admin-grid">
            {/* Left Column */}
            <div className="admin-left">
              {/* Recent Activity */}
              <div className="admin-card">
                <h3 className="card-title">Recent Activity</h3>
                <div className="activity-table">
                  <div className="table-header">
                    <span>User</span>
                    <span>Service</span>
                    <span>Status</span>
                    <span>Time</span>
                  </div>
                  {recentActivity.length === 0 ? (
                    <div className="no-activity">
                      <p>No recent activity found.</p>
                    </div>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <div key={activity._id || activity.id || index} className="table-row">
                        <span className="user-name">{activity.userName || activity.user || 'Unknown User'}</span>
                        <span className="service-name">{activity.serviceName || activity.service || 'Unknown Service'}</span>
                        <span 
                          className="activity-status" 
                          style={{ color: getStatusColor(activity.status || 'pending') }}
                        >
                          {activity.status || 'Pending'}
                        </span>
                        <span className="activity-time">{formatDate(activity.createdAt || activity.time)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* User Feedback */}
              <div className="admin-card">
                <h3 className="card-title">User Feedback</h3>
                <div className="feedback-list">
                  {userFeedback.length === 0 ? (
                    <div className="no-feedback">
                      <p>No recent feedback found.</p>
                    </div>
                  ) : (
                    userFeedback.map((feedback, index) => (
                      <div key={feedback._id || feedback.id || index} className="feedback-item">
                        <div className="feedback-header">
                          <div className="feedback-user">
                            <span className="user-name">{feedback.userName || feedback.user || 'Anonymous'}</span>
                            <span className="feedback-date">{formatDate(feedback.createdAt || feedback.date)}</span>
                          </div>
                          <div className="feedback-rating">
                            {'⭐'.repeat(feedback.rating || 0)}
                          </div>
                        </div>
                        <p className="feedback-comment">{feedback.comment || feedback.review || 'No comment'}</p>
                        <div className="feedback-actions">
                          <button className="feedback-btn">
                            👍 {feedback.likes || 0}
                          </button>
                          <button className="feedback-btn">
                            👎 {feedback.dislikes || 0}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="admin-right">
              {/* Platform Performance */}
              <div className="admin-card">
                <h3 className="card-title">Platform Performance</h3>
                
                <div className="metric-item">
                  <div className="metric-header">
                    <span className="metric-label">Bookings Growth</span>
                    <span className={`metric-change ${platformMetrics.bookingsGrowth >= 0 ? 'positive' : 'negative'}`}>
                      {platformMetrics.bookingsGrowth >= 0 ? '+' : ''}{platformMetrics.bookingsGrowth}%
                    </span>
                  </div>
                  <div className="metric-subtitle">Last 30 Days</div>
                </div>

                <div className="metric-item">
                  <div className="metric-header">
                    <span className="metric-label">User Growth</span>
                    <span className={`metric-change ${platformMetrics.userGrowth >= 0 ? 'positive' : 'negative'}`}>
                      {platformMetrics.userGrowth >= 0 ? '+' : ''}{platformMetrics.userGrowth}%
                    </span>
                  </div>
                  <div className="metric-subtitle">New registrations</div>
                </div>

                <div className="metric-item">
                  <div className="metric-header">
                    <span className="metric-label">Revenue Growth</span>
                    <span className={`metric-change ${platformMetrics.revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
                      {platformMetrics.revenueGrowth >= 0 ? '+' : ''}{platformMetrics.revenueGrowth}%
                    </span>
                  </div>
                  <div className="metric-subtitle">Platform earnings</div>
                </div>

                <div className="metric-item">
                  <div className="metric-header">
                    <span className="metric-label">Service Popularity</span>
                    <span className="metric-change neutral">
                      {platformMetrics.servicePopularity || 0}% avg
                    </span>
                  </div>
                  <div className="metric-subtitle">Booking completion rate</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="admin-card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions">
                  <Link to="/admin/users" className="action-btn primary">
                    <span className="btn-icon">👥</span>
                    Manage Users
                  </Link>
                  <Link to="/admin/services" className="action-btn">
                    <span className="btn-icon">🔧</span>
                    Add New Service
                  </Link>
                  <Link to="/admin/bookings" className="action-btn">
                    <span className="btn-icon">📅</span>
                    Manage Bookings
                  </Link>
                  <Link to="/admin/reviews" className="action-btn">
                    <span className="btn-icon">⭐</span>
                    Moderate Reviews
                  </Link>
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

export default AdminDashboard;
