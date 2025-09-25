import { useCallback, useEffect, useState } from 'react';

import { adminAPI } from '../api/services';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30');
  const [activeView, setActiveView] = useState('overview');

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setDashboardData(response);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await adminAPI.getAdvancedAnalytics(timeRange);
      setAnalytics(response.analytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    }
  }, [timeRange]);

  const fetchRealTimeMetrics = useCallback(async () => {
    try {
      const response = await adminAPI.getRealTimeMetrics();
      setRealTimeMetrics(response.metrics);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching real-time metrics:', err);
      setError('Failed to load real-time metrics');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchAnalytics();
    fetchRealTimeMetrics();

    const interval = setInterval(fetchRealTimeMetrics, 60000);
    return () => clearInterval(interval);
  }, [fetchAnalytics, fetchDashboardData, fetchRealTimeMetrics]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatPercentage = (value) => {
    const num = parseFloat(value);
    return `${num >= 0 ? '+' : ''}${num}%`;
  };

  const getGrowthColor = (growth) => {
    const num = parseFloat(growth);
    return num >= 0 ? '#10b981' : '#ef4444';
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      <div className="dashboard-nav">
        <button
          className={activeView === 'overview' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveView('overview')}
        >
          Overview
        </button>
        <button
          className={activeView === 'analytics' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveView('analytics')}
        >
          Analytics
        </button>
        <button
          className={activeView === 'activity' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveView('activity')}
        >
          Recent Activity
        </button>
      </div>

      {/* Real-time Metrics */}
      {realTimeMetrics && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <h3>Users Today</h3>
              <span className="metric-period">vs yesterday</span>
            </div>
            <div className="metric-value">{realTimeMetrics.users.today}</div>
            <div
              className="metric-growth"
              style={{ color: getGrowthColor(realTimeMetrics.users.growth) }}
            >
              {formatPercentage(realTimeMetrics.users.growth)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <h3>Bookings Today</h3>
              <span className="metric-period">vs yesterday</span>
            </div>
            <div className="metric-value">{realTimeMetrics.bookings.today}</div>
            <div
              className="metric-growth"
              style={{ color: getGrowthColor(realTimeMetrics.bookings.growth) }}
            >
              {formatPercentage(realTimeMetrics.bookings.growth)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <h3>Revenue Today</h3>
              <span className="metric-period">vs yesterday</span>
            </div>
            <div className="metric-value">{formatCurrency(realTimeMetrics.revenue.today)}</div>
            <div
              className="metric-growth"
              style={{ color: getGrowthColor(realTimeMetrics.revenue.growth) }}
            >
              {formatPercentage(realTimeMetrics.revenue.growth)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <h3>Reviews Today</h3>
              <span className="metric-period">vs yesterday</span>
            </div>
            <div className="metric-value">{realTimeMetrics.reviews.today}</div>
            <div
              className="metric-growth"
              style={{ color: getGrowthColor(realTimeMetrics.reviews.growth) }}
            >
              {formatPercentage(realTimeMetrics.reviews.growth)}
            </div>
          </div>
        </div>
      )}

      {/* Content based on active view */}
      {activeView === 'overview' && dashboardData && (
        <div className="overview-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <div className="stat-value">{dashboardData.stats.users}</div>
              <div className="stat-breakdown">
                {dashboardData.usersByRole.map((role) => (
                  <div key={role._id} className="breakdown-item">
                    <span className="role-name">{role._id}s:</span>
                    <span className="role-count">{role.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <h3>Total Services</h3>
              <div className="stat-value">{dashboardData.stats.services}</div>
            </div>

            <div className="stat-card">
              <h3>Total Bookings</h3>
              <div className="stat-value">{dashboardData.stats.bookings}</div>
              <div className="stat-breakdown">
                {dashboardData.bookingsByStatus.map((status) => (
                  <div key={status._id} className="breakdown-item">
                    <span className="status-name">{status._id}:</span>
                    <span className="status-count">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <h3>Total Revenue</h3>
              <div className="stat-value">{formatCurrency(dashboardData.stats.revenue)}</div>
              <div className="stat-sub">
                {dashboardData.stats.completedBookings} completed bookings
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'analytics' && analytics && (
        <div className="analytics-content">
          <div className="analytics-grid">
            {/* Popular Services */}
            <div className="analytics-card">
              <h3>Popular Services ({timeRange} days)</h3>
              <div className="service-list">
                {analytics.popularServices.map((service, index) => (
                  <div key={service._id} className="service-item">
                    <div className="service-rank">#{index + 1}</div>
                    <div className="service-details">
                      <div className="service-name">{service.title}</div>
                      <div className="service-category">{service.category}</div>
                    </div>
                    <div className="service-stats">
                      <div className="stat-item">
                        <span className="stat-label">Bookings:</span>
                        <span className="stat-value">{service.bookings}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Revenue:</span>
                        <span className="stat-value">{formatCurrency(service.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Providers */}
            <div className="analytics-card">
              <h3>Top Providers ({timeRange} days)</h3>
              <div className="provider-list">
                {analytics.providerPerformance.map((provider, index) => (
                  <div key={provider._id} className="provider-item">
                    <div className="provider-rank">#{index + 1}</div>
                    <div className="provider-details">
                      <div className="provider-name">{provider.name}</div>
                      <div className="provider-rating">
                        ⭐ {provider.averageRating ? provider.averageRating.toFixed(1) : 'N/A'}(
                        {provider.reviewCount} reviews)
                      </div>
                    </div>
                    <div className="provider-stats">
                      <div className="stat-item">
                        <span className="stat-label">Services:</span>
                        <span className="stat-value">{provider.serviceCount}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Bookings:</span>
                        <span className="stat-value">{provider.bookingCount}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Revenue:</span>
                        <span className="stat-value">{formatCurrency(provider.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Performance */}
            <div className="analytics-card">
              <h3>Category Performance ({timeRange} days)</h3>
              <div className="category-list">
                {analytics.categoryPerformance.map((category, index) => (
                  <div key={category._id} className="category-item">
                    <div className="category-name">{category._id}</div>
                    <div className="category-stats">
                      <div className="stat-item">
                        <span className="stat-label">Services:</span>
                        <span className="stat-value">{category.serviceCount}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Bookings:</span>
                        <span className="stat-value">{category.bookingCount}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Revenue:</span>
                        <span className="stat-value">{formatCurrency(category.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="analytics-card">
              <h3>Revenue Breakdown ({timeRange} days)</h3>
              <div className="revenue-breakdown">
                {analytics.revenueBreakdown.map((item) => (
                  <div key={item._id} className="revenue-item">
                    <div className="revenue-status">{item._id || 'Unknown'}</div>
                    <div className="revenue-stats">
                      <div className="stat-item">
                        <span className="stat-label">Orders:</span>
                        <span className="stat-value">{item.count}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Amount:</span>
                        <span className="stat-value">{formatCurrency(item.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'activity' && analytics && (
        <div className="activity-content">
          <div className="activity-grid">
            {/* Recent Users */}
            <div className="activity-card">
              <h3>Recent Users</h3>
              <div className="activity-list">
                {analytics.recentActivity.users.map((user) => (
                  <div key={user._id} className="activity-item">
                    <div className="activity-icon">👤</div>
                    <div className="activity-details">
                      <div className="activity-title">{user.name}</div>
                      <div className="activity-meta">
                        {user.role} • {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="activity-card">
              <h3>Recent Bookings</h3>
              <div className="activity-list">
                {analytics.recentActivity.bookings.map((booking) => (
                  <div key={booking._id} className="activity-item">
                    <div className="activity-icon">📅</div>
                    <div className="activity-details">
                      <div className="activity-title">
                        {booking.user?.name} booked {booking.service?.title}
                      </div>
                      <div className="activity-meta">
                        {booking.status} • {formatCurrency(booking.amount)} •{' '}
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="activity-card">
              <h3>Recent Reviews</h3>
              <div className="activity-list">
                {analytics.recentActivity.reviews.map((review) => (
                  <div key={review._id} className="activity-item">
                    <div className="activity-icon">⭐</div>
                    <div className="activity-details">
                      <div className="activity-title">
                        {review.user?.name} reviewed {review.service?.title}
                      </div>
                      <div className="activity-meta">
                        {review.rating}/5 stars • {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                      {review.comment && <div className="activity-comment">{review.comment}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
