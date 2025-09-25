import { useEffect, useState } from 'react';

import { api } from '../../api/provider';
import Header from '../../components/Header';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalServices: 0,
      activeBookings: 0,
      totalEarnings: 0,
      avgRating: 0,
    },
    recentBookings: [],
    recentReviews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        stats: {
          totalServices: 0,
          activeBookings: 0,
          totalEarnings: 0,
          avgRating: 0,
        },
        recentBookings: [],
        recentReviews: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Header />
        <main className="dashboard-main">
          <div className="container">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
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
            <h1 className="page-title">Provider Dashboard</h1>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-content">
                <div className="stat-value">
                  ${dashboardData.stats.totalEarnings.toLocaleString()}
                </div>
                <div className="stat-label">Total Earnings</div>
              </div>
              <div className="stat-icon">💰</div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{dashboardData.stats.totalServices}</div>
                <div className="stat-label">Total Services</div>
              </div>
              <div className="stat-icon">🛠️</div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{dashboardData.stats.activeBookings}</div>
                <div className="stat-label">Active Bookings</div>
              </div>
              <div className="stat-icon">📅</div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{dashboardData.stats.avgRating.toFixed(1)}</div>
                <div className="stat-label">Average Rating</div>
              </div>
              <div className="stat-icon">⭐</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="dashboard-content">
            {/* Left Column */}
            <div className="dashboard-left">
              {/* Recent Reviews */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Recent Reviews</h3>
                </div>
                <div className="reviews-list">
                  {dashboardData.recentReviews.length > 0 ? (
                    dashboardData.recentReviews.map((review) => (
                      <div key={review.id || review._id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <span className="reviewer-name">
                              {review.customer?.name || 'Anonymous'}
                            </span>
                            <span className="review-date">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="review-rating">{'⭐'.repeat(review.rating)}</div>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="no-reviews">
                      <p>No recent reviews</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="dashboard-right">
              {/* Recent Bookings */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Recent Bookings</h3>
                </div>
                <div className="bookings-content">
                  {dashboardData.recentBookings.length === 0 ? (
                    <div className="no-bookings">
                      <div className="no-bookings-icon">📭</div>
                      <h4>No recent bookings</h4>
                      <p>You have no recent bookings. Promote your services to get more clients.</p>
                    </div>
                  ) : (
                    <div className="bookings-list">
                      {dashboardData.recentBookings.slice(0, 5).map((booking) => (
                        <div key={booking._id} className="booking-item">
                          <div className="booking-header">
                            <span className="customer-name">{booking.customer?.name}</span>
                            <span className={`booking-status ${booking.status}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="booking-details">
                            <span className="service-name">{booking.service?.title}</span>
                            <span className="booking-date">
                              {new Date(booking.scheduledDate).toLocaleDateString()}
                            </span>
                          </div>
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
                  <a href="/provider/services" className="action-btn">
                    <i className="fas fa-plus"></i>
                    Add Service
                  </a>
                  <a href="/provider/bookings" className="action-btn">
                    <i className="fas fa-calendar-check"></i>
                    View Bookings
                  </a>
                  <a href="/provider/schedule" className="action-btn">
                    <i className="fas fa-calendar"></i>
                    View Schedule
                  </a>
                  <a href="/provider/messages" className="action-btn">
                    <i className="fas fa-envelope"></i>
                    Messages
                  </a>
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
