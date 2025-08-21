import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import './Dashboard.css';

/**
 * Dashboard Component (Provider Dashboard)
 * 
 * What: Service provider's main dashboard showing earnings, bookings, and business metrics
 * When: Accessed by service providers to manage their business
 * Why: Provides overview of business performance and allows providers to manage services
 * 
 * Features:
 * - Earnings overview with charts
 * - Recent bookings and requests
 * - Availability toggle
 * - Customer reviews display
 * - Performance metrics
 */
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalEarnings: 0,
    newRequests: 0,
    upcomingAppointments: 0,
    isAvailable: true
  });
  const [recentReviews, setRecentReviews] = useState([]);
  const [newRequests, setNewRequests] = useState([]);

  useEffect(() => {
    // Mock API call to fetch dashboard data
    setTimeout(() => {
      setDashboardData({
        totalEarnings: 1250,
        newRequests: 5,
        upcomingAppointments: 3,
        isAvailable: true,
        earningsGrowth: 15,
        lastPeriod: 30
      });

      setRecentReviews([
        {
          id: 1,
          customerName: 'Sophia Carter',
          rating: 5,
          date: '2 weeks ago',
          comment: 'Excellent service! Sophia was punctual, professional, and did a fantastic job. Highly recommend!'
        },
        {
          id: 2,
          customerName: 'Liam Bennett',
          rating: 4,
          date: '1 month ago',
          comment: 'Liam was great, but there was a slight delay in arrival. Overall, a good experience.'
        }
      ]);

      setNewRequests([]);
    }, 500);
  }, []);

  const toggleAvailability = () => {
    setDashboardData(prev => ({
      ...prev,
      isAvailable: !prev.isAvailable
    }));
  };

  const earningsData = [
    { month: 'Jan', earnings: 800 },
    { month: 'Feb', earnings: 950 },
    { month: 'Mar', earnings: 1100 },
    { month: 'Apr', earnings: 1050 },
    { month: 'May', earnings: 1200 },
    { month: 'Jun', earnings: 1250 },
    { month: 'Jul', earnings: 1400 }
  ];

  return (
    <div className="dashboard-page">
      <Header isLoggedIn={true} userType="provider" />
      
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
                  <span className="amount-value">${dashboardData.totalEarnings.toLocaleString()}</span>
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
                    <span className={`status-indicator ${dashboardData.isAvailable ? 'available' : 'unavailable'}`}>
                      {dashboardData.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <span className="status-description">
                      Currently {dashboardData.isAvailable ? 'accepting' : 'not accepting'} new bookings
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
                  {recentReviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <span className="reviewer-name">{review.customerName}</span>
                          <span className="review-date">{review.date}</span>
                        </div>
                        <div className="review-rating">
                          {'⭐'.repeat(review.rating)}
                        </div>
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
                      <p>You have no new service requests at the moment. Check back later or adjust your availability to attract more clients.</p>
                    </div>
                  ) : (
                    <div className="requests-list">
                      {newRequests.map(request => (
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
                  <Link to="/provider/reports" className="action-btn">
                    <span className="btn-icon">�</span>
                    View Reports
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
