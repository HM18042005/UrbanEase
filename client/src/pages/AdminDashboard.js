import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import './AdminDashboard.css';
import { Link } from 'react-router-dom';

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
    liveBookings: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [userFeedback, setUserFeedback] = useState([]);
  const [platformMetrics, setPlatformMetrics] = useState({
    bookingsGrowth: 0,
    servicePopularity: 0
  });

  useEffect(() => {
    // Mock API call to fetch admin dashboard data
    setTimeout(() => {
      setAdminData({
        totalUsers: 1234,
        activeServices: 567,
        liveBookings: 23
      });

      setRecentActivity([
        {
          id: 1,
          user: 'Liam Harper',
          service: 'Plumbing Repair',
          status: 'Completed',
          time: '2 hours ago'
        },
        {
          id: 2,
          user: 'Olivia Bennett',
          service: 'House Cleaning',
          status: 'In Progress',
          time: '1 hour ago'
        },
        {
          id: 3,
          user: 'Noah Carter',
          service: 'Electrical Work',
          status: 'Scheduled',
          time: '3 hours ago'
        },
        {
          id: 4,
          user: 'Ava Thompson',
          service: 'Furniture Assembly',
          status: 'Completed',
          time: '4 hours ago'
        },
        {
          id: 5,
          user: 'Ethan Foster',
          service: 'Appliance Repair',
          status: 'Cancelled',
          time: '5 hours ago'
        }
      ]);

      setUserFeedback([
        {
          id: 1,
          user: 'Sophia Clark',
          rating: 5,
          date: '2 days ago',
          comment: 'Excellent service! The plumber arrived on time and fixed the issue quickly. Highly recommend.',
          likes: 3,
          dislikes: 0
        },
        {
          id: 2,
          user: 'Daniel Evans',
          rating: 4,
          date: '3 days ago',
          comment: 'Good experience overall. The cleaner was thorough, but there was a slight delay in arrival.',
          likes: 2,
          dislikes: 1
        }
      ]);

      setPlatformMetrics({
        bookingsGrowth: 15,
        servicePopularity: 10,
        lastPeriod: 7
      });
    }, 500);
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'green';
      case 'in progress': return 'blue';
      case 'scheduled': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const servicePopularityData = [
    { service: 'Plumbing', popularity: 90 },
    { service: 'Cleaning', popularity: 85 },
    { service: 'Electrical', popularity: 70 },
    { service: 'Assembly', popularity: 65 },
    { service: 'Repair', popularity: 60 }
  ];

  const weeklyBookings = [
    { day: 'Mon', bookings: 45 },
    { day: 'Tue', bookings: 52 },
    { day: 'Wed', bookings: 48 },
    { day: 'Thu', bookings: 61 },
    { day: 'Fri', bookings: 55 },
    { day: 'Sat', bookings: 70 },
    { day: 'Sun', bookings: 42 }
  ];

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
        <Header isLoggedIn={true} userType="admin" />
        
        <div className="admin-content">
          <div className="admin-header">
            <h1 className="admin-title">Admin Dashboard</h1>
          </div>

          {/* Top Stats */}
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-value">{adminData.totalUsers.toLocaleString()}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{adminData.activeServices}</div>
              <div className="stat-label">Active Services</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{adminData.liveBookings}</div>
              <div className="stat-label">Live Bookings</div>
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
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="table-row">
                      <span className="user-name">{activity.user}</span>
                      <span className="service-name">{activity.service}</span>
                      <span className={`status ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Feedback */}
              <div className="admin-card">
                <h3 className="card-title">User Feedback</h3>
                <div className="feedback-list">
                  {userFeedback.map(feedback => (
                    <div key={feedback.id} className="feedback-item">
                      <div className="feedback-header">
                        <div className="feedback-user">
                          <span className="user-name">{feedback.user}</span>
                          <span className="feedback-date">{feedback.date}</span>
                        </div>
                        <div className="feedback-rating">
                          {'⭐'.repeat(feedback.rating)}
                        </div>
                      </div>
                      <p className="feedback-comment">{feedback.comment}</p>
                      <div className="feedback-actions">
                        <button className="feedback-btn">
                          👍 {feedback.likes}
                        </button>
                        <button className="feedback-btn">
                          👎 {feedback.dislikes}
                        </button>
                      </div>
                    </div>
                  ))}
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
                    <span className="metric-label">Bookings Over Time</span>
                    <span className="metric-change positive">+{platformMetrics.bookingsGrowth}%</span>
                  </div>
                  <div className="metric-subtitle">Last {platformMetrics.lastPeriod} Days +{platformMetrics.bookingsGrowth}%</div>
                  
                  <div className="mini-chart">
                    {weeklyBookings.map((data, index) => (
                      <div key={index} className="chart-day">
                        <div 
                          className="day-bar" 
                          style={{ height: `${(data.bookings / 70) * 50}px` }}
                        ></div>
                        <span className="day-label">{data.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-header">
                    <span className="metric-label">Service Popularity</span>
                    <span className="metric-change positive">+{platformMetrics.servicePopularity}%</span>
                  </div>
                  <div className="metric-subtitle">Last 30 Days +{platformMetrics.servicePopularity}%</div>
                  
                  <div className="popularity-chart">
                    {servicePopularityData.map((service, index) => (
                      <div key={index} className="popularity-item">
                        <span className="service-label">{service.service}</span>
                        <div className="popularity-bar">
                          <div 
                            className="popularity-fill" 
                            style={{ width: `${service.popularity}%` }}
                          ></div>
                        </div>
                        <span className="popularity-value">{service.popularity}%</span>
                      </div>
                    ))}
                  </div>
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
                    <span className="btn-icon">�</span>
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
