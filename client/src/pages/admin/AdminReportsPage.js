import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import { adminAPI } from '../../api/services';
import './AdminDashboard.css';

/**
 * AdminReportsPage Component
 * 
 * What: Analytics and reporting interface for administrators
 * When: Admin needs to view platform performance metrics and analytics
 * Why: Provides comprehensive insights into user engagement, revenue, and growth
 * 
 * Features:
 * - Platform overview statistics
 * - User engagement metrics
 * - Service performance analytics
 * - Revenue and growth tracking
 * - Data export functionality
 */
const AdminReportsPage = () => {
  const [reportData, setReportData] = useState({
    overview: {},
    userMetrics: {},
    serviceMetrics: {},
    bookingMetrics: {},
    revenueMetrics: {},
    growthMetrics: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30days');
  const [selectedReportType, setSelectedReportType] = useState('overview');
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [overviewRes, userRes, serviceRes, bookingRes, revenueRes] = await Promise.all([
        adminAPI.getReports('overview', { dateRange }),
        adminAPI.getReports('users', { dateRange }),
        adminAPI.getReports('services', { dateRange }),
        adminAPI.getReports('bookings', { dateRange }),
        adminAPI.getReports('revenue', { dateRange })
      ]);

      setReportData({
        overview: overviewRes.report || {},
        userMetrics: userRes.report || {},
        serviceMetrics: serviceRes.report || {},
        bookingMetrics: bookingRes.report || {},
        revenueMetrics: revenueRes.report || {},
        growthMetrics: overviewRes.report?.userGrowth || {}
      });
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const handleExport = async (format) => {
    try {
      setExportLoading(true);
      
      // Get report data from API for export
      const exportData = await adminAPI.exportReport({
        reportType: selectedReportType,
        dateRange: dateRange,
        format: format
      });
      
      const dataToExport = {
        reportType: selectedReportType,
        dateRange: dateRange,
        generatedAt: new Date().toISOString(),
        data: exportData
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `urban-ease-report-${selectedReportType}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export report');
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    // Handle different data types that might be passed
    if (value === null || value === undefined) {
      return '0.0%';
    }
    
    // If it's an array (like growth data), return a placeholder
    if (Array.isArray(value)) {
      return 'N/A';
    }
    
    // If it's a string, try to parse it as a number
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) {
        return '0.0%';
      }
      return `${parsed.toFixed(1)}%`;
    }
    
    // If it's a number, format it normally
    if (typeof value === 'number') {
      return `${value.toFixed(1)}%`;
    }
    
    // Fallback for any other type
    return '0.0%';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return '📈';
    if (growth < 0) return '📉';
    return '➖';
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return '#22c55e';
    if (growth < 0) return '#ef4444';
    return '#6b7280';
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="admin-dashboard-page">
          <div className="admin-main">
            <div className="admin-content">
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading analytics...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="admin-dashboard-page">
        <div className="admin-main">
          <div className="admin-content">
            <div className="admin-header">
              <div className="header-content">
                <div className="breadcrumb">
                  <span className="breadcrumb-item">Admin</span>
                  <span className="breadcrumb-separator">›</span>
                  <span className="breadcrumb-item current">Analytics & Reports</span>
                </div>
                <h1>Analytics & Reports</h1>
                <p>Comprehensive insights into platform performance</p>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
                <button className="alert-close" onClick={() => setError('')}>×</button>
              </div>
            )}

            {/* Controls */}
            <div className="admin-card">
              <div className="filters-section">
                <div className="filter-controls">
                  <select
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="overview">Platform Overview</option>
                    <option value="userMetrics">User Analytics</option>
                    <option value="serviceMetrics">Service Analytics</option>
                    <option value="bookingMetrics">Booking Analytics</option>
                    <option value="revenueMetrics">Revenue Analytics</option>
                  </select>
                  
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="3months">Last 3 Months</option>
                    <option value="6months">Last 6 Months</option>
                    <option value="1year">Last Year</option>
                    <option value="all">All Time</option>
                  </select>
                  
                  <button 
                    onClick={fetchReportData}
                    disabled={loading}
                    className="refresh-btn"
                    title="Refresh data"
                  >
                    🔄
                  </button>
                  
                  <button 
                    onClick={() => handleExport('json')}
                    disabled={exportLoading}
                    className="btn btn-secondary"
                  >
                    {exportLoading ? '⏳' : '📊'} Export
                  </button>
                </div>
              </div>
            </div>

            {/* Overview Stats */}
            {selectedReportType === 'overview' && (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-content">
                      <div className="stat-value">{reportData.overview.totalUsers}</div>
                      <div className="stat-label">Total Users</div>
                      <div className="stat-growth" style={{ color: getGrowthColor(reportData.overview.userGrowth) }}>
                        {getGrowthIcon(reportData.overview.userGrowth)} {formatPercentage(reportData.overview.userGrowth)}
                      </div>
                    </div>
                    <div className="stat-icon">👥</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-content">
                      <div className="stat-value">{reportData.overview.totalServices}</div>
                      <div className="stat-label">Total Services</div>
                      <div className="stat-growth" style={{ color: getGrowthColor(reportData.overview.serviceGrowth) }}>
                        {getGrowthIcon(reportData.overview.serviceGrowth)} {formatPercentage(reportData.overview.serviceGrowth)}
                      </div>
                    </div>
                    <div className="stat-icon">🔧</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-content">
                      <div className="stat-value">{reportData.overview.totalBookings}</div>
                      <div className="stat-label">Total Bookings</div>
                      <div className="stat-growth" style={{ color: getGrowthColor(reportData.overview.bookingGrowth) }}>
                        {getGrowthIcon(reportData.overview.bookingGrowth)} {formatPercentage(reportData.overview.bookingGrowth)}
                      </div>
                    </div>
                    <div className="stat-icon">📋</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-content">
                      <div className="stat-value">{formatCurrency(reportData.overview.totalRevenue)}</div>
                      <div className="stat-label">Total Revenue</div>
                      <div className="stat-growth" style={{ color: getGrowthColor(reportData.overview.revenueGrowth) }}>
                        {getGrowthIcon(reportData.overview.revenueGrowth)} {formatPercentage(reportData.overview.revenueGrowth)}
                      </div>
                    </div>
                    <div className="stat-icon">💰</div>
                  </div>
                </div>
              </>
            )}

            {/* User Metrics */}
            {selectedReportType === 'userMetrics' && (
              <div className="admin-card">
                <div className="card-header">
                  <h3>User Analytics</h3>
                </div>
                <div className="report-grid">
                  <div className="report-metric">
                    <div className="metric-label">Active Users</div>
                    <div className="metric-value">{reportData.userMetrics.activeUsers}</div>
                  </div>
                  <div className="report-metric">
                    <div className="metric-label">New Users</div>
                    <div className="metric-value">{reportData.userMetrics.newUsers}</div>
                  </div>
                  <div className="report-metric">
                    <div className="metric-label">Returning Users</div>
                    <div className="metric-value">{reportData.userMetrics.returningUsers}</div>
                  </div>
                  <div className="report-metric">
                    <div className="metric-label">User Retention</div>
                    <div className="metric-value">{formatPercentage(reportData.userMetrics.userRetention)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Service Metrics */}
            {selectedReportType === 'serviceMetrics' && (
              <div className="admin-card">
                <div className="card-header">
                  <h3>Service Analytics</h3>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Bookings</th>
                        <th>Revenue</th>
                        <th>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.serviceMetrics.topCategories?.map((category, index) => (
                        <tr key={index}>
                          <td>{category.name}</td>
                          <td>{category.count}</td>
                          <td>{formatCurrency(category.revenue)}</td>
                          <td>
                            <div className="performance-bar">
                              <div 
                                className="performance-fill"
                                style={{ 
                                  width: `${(category.count / 234) * 100}%`,
                                  backgroundColor: '#3b82f6'
                                }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Booking Metrics */}
            {selectedReportType === 'bookingMetrics' && (
              <div className="admin-card">
                <div className="card-header">
                  <h3>Booking Analytics</h3>
                </div>
                <div className="report-grid">
                  <div className="report-metric">
                    <div className="metric-label">Total Bookings</div>
                    <div className="metric-value">{reportData.bookingMetrics.totalBookings}</div>
                  </div>
                  <div className="report-metric">
                    <div className="metric-label">Pending</div>
                    <div className="metric-value">{reportData.bookingMetrics.pendingBookings}</div>
                  </div>
                  <div className="report-metric">
                    <div className="metric-label">Completed</div>
                    <div className="metric-value">{reportData.bookingMetrics.completedBookings}</div>
                  </div>
                  <div className="report-metric">
                    <div className="metric-label">Avg. Booking Value</div>
                    <div className="metric-value">{formatCurrency(reportData.bookingMetrics.avgBookingValue)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Metrics */}
            {selectedReportType === 'revenueMetrics' && (
              <div className="admin-card">
                <div className="card-header">
                  <h3>Revenue Analytics</h3>
                </div>
                <div className="revenue-section">
                  <div className="revenue-stats">
                    <div className="revenue-stat">
                      <div className="stat-label">Total Revenue</div>
                      <div className="stat-value">{formatCurrency(reportData.revenueMetrics.totalRevenue)}</div>
                    </div>
                    <div className="revenue-stat">
                      <div className="stat-label">Monthly Growth</div>
                      <div className="stat-value" style={{ color: getGrowthColor(reportData.revenueMetrics.monthlyGrowth) }}>
                        {formatPercentage(reportData.revenueMetrics.monthlyGrowth)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="top-earners">
                    <h4>Top Earning Providers</h4>
                    <div className="earners-list">
                      {reportData.revenueMetrics.topEarners?.map((earner, index) => (
                        <div key={index} className="earner-item">
                          <div className="earner-rank">#{index + 1}</div>
                          <div className="earner-name">{earner.name}</div>
                          <div className="earner-revenue">{formatCurrency(earner.revenue)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Export Status */}
            {exportLoading && (
              <div className="admin-card">
                <div className="export-status">
                  <div className="loading-spinner"></div>
                  <p>Generating report export...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminReportsPage;
