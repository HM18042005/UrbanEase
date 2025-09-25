import { useCallback, useEffect, useState } from 'react';

import { api } from '../../api/provider';
import Header from '../../components/Header';
import './Dashboard.css';

const ProviderReportsPage = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [reportData, setReportData] = useState({});
  const [earnings, setEarnings] = useState([]);
  const [serviceStats, setServiceStats] = useState([]);
  const [customerStats, setCustomerStats] = useState({});

  const fetchReports = useCallback(async () => {
    try {
      const [reportsResponse, earningsResponse, performanceResponse, customerResponse] =
        await Promise.all([
          api.getReports(timeRange),
          api.getEarningsReport(timeRange),
          api.getPerformanceReport(),
          api.getCustomerReport(),
        ]);

      setReportData(reportsResponse.data);
      setEarnings(earningsResponse.data.earnings || []);
      setServiceStats(performanceResponse.data.performance || []);
      setCustomerStats({
        customers: customerResponse.data.customers || [],
        totalCustomers: customerResponse.data.customers?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Set empty data instead of mock data
      setReportData({
        earnings: { totalEarnings: 0, completedBookings: 0, avgBookingValue: 0 },
        bookingStatus: [],
        ratings: { avgRating: 0, totalReviews: 0 },
      });
      setEarnings([]);
      setServiceStats([]);
      setCustomerStats({ customers: [], totalCustomers: 0 });
    }
  }, [timeRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getChangePercentage = (current, previous) => {
    if (!previous) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const maxEarnings = Math.max(...earnings.map((e) => e.amount));

  return (
    <div className="dashboard-page">
      <Header isLoggedIn={true} userType="provider" />
      <main className="dashboard-main">
        <div className="container-fluid px-3">
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <h1 className="h3 mb-0">Reports & Analytics</h1>
                <div className="time-range-selector">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="form-select"
                    style={{ width: 'auto', minWidth: '200px' }}
                  >
                    <option value="thisWeek">This Week</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="last3Months">Last 3 Months</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title text-muted mb-0">Total Earnings</h5>
                    <span className="fs-4">💰</span>
                  </div>
                  <div className="fs-2 fw-bold text-primary">${reportData.totalEarnings}</div>
                  <div className="text-success small">
                    <i className="bi bi-arrow-up"></i>+
                    {getChangePercentage(reportData.totalEarnings, 1650)}% from last period
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title text-muted mb-0">Total Bookings</h5>
                    <span className="fs-4">📅</span>
                  </div>
                  <div className="fs-2 fw-bold text-primary">{reportData.totalBookings}</div>
                  <div className="text-success small">
                    <i className="bi bi-arrow-up"></i>+
                    {getChangePercentage(reportData.totalBookings, 33)}% from last period
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title text-muted mb-0">Average Rating</h5>
                    <span className="fs-4">⭐</span>
                  </div>
                  <div className="fs-2 fw-bold text-primary">{reportData.avgRating}</div>
                  <div className="text-success small">
                    <i className="bi bi-arrow-up"></i>+
                    {getChangePercentage(reportData.avgRating, 4.6)}% from last period
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title text-muted mb-0">Completion Rate</h5>
                    <span className="fs-4">✅</span>
                  </div>
                  <div className="fs-2 fw-bold text-primary">{reportData.completionRate}%</div>
                  <div className="text-success small">
                    <i className="bi bi-arrow-up"></i>+
                    {getChangePercentage(reportData.completionRate, 89)}% from last period
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="row g-4">
            <div className="col-12 col-lg-8">
              {/* Earnings Chart */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">Earnings Overview</h5>
                </div>
                <div className="card-body">
                  <div
                    className="d-flex justify-content-between align-items-end gap-2 overflow-auto"
                    style={{ minHeight: '200px' }}
                  >
                    {earnings.map((item, index) => (
                      <div
                        key={index}
                        className="d-flex flex-column align-items-center"
                        style={{ minWidth: '60px' }}
                      >
                        <div
                          className="bg-primary rounded-top position-relative d-flex align-items-end justify-content-center text-white small fw-bold"
                          style={{
                            height: `${Math.max((item.amount / maxEarnings) * 150, 20)}px`,
                            width: '40px',
                            minHeight: '20px',
                          }}
                        >
                          <span
                            className="position-absolute"
                            style={{ top: '-20px', fontSize: '10px', color: '#000' }}
                          >
                            ${item.amount}
                          </span>
                        </div>
                        <small className="text-muted text-center mt-1" style={{ fontSize: '10px' }}>
                          {item.day || item.period}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Service Performance */}
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Service Performance</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Service</th>
                          <th>Bookings</th>
                          <th>Earnings</th>
                          <th>Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceStats.map((service, index) => (
                          <tr key={index}>
                            <td className="fw-semibold">{service.service}</td>
                            <td>
                              <span className="badge bg-light text-dark">{service.bookings}</span>
                            </td>
                            <td className="text-success fw-bold">${service.earnings}</td>
                            <td>
                              <span className="text-warning">⭐</span> {service.avgRating}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              {/* Customer Insights */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">Customer Insights</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                      <span className="text-muted">Total Customers</span>
                      <span className="fw-bold text-primary fs-5">
                        {customerStats.totalCustomers}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                      <span className="text-muted">New Customers</span>
                      <span className="fw-bold text-success fs-5">
                        {customerStats.newCustomers}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                      <span className="text-muted">Repeat Customers</span>
                      <span className="fw-bold text-info fs-5">
                        {customerStats.repeatCustomers}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                      <span className="text-muted">Avg. Customer Value</span>
                      <span className="fw-bold text-warning fs-5">
                        ${customerStats.avgCustomerValue}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Customers */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">Top Customers</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-column gap-2">
                    {customerStats.topCustomers?.map((customer, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center gap-3 p-2 border rounded"
                      >
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '30px', height: '30px', fontSize: '12px' }}
                        >
                          #{index + 1}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{customer.name}</div>
                          <small className="text-muted">
                            {customer.bookings} bookings • ${customer.totalSpent} total
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Report Actions</h5>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <button className="btn btn-primary">📊 Download Report</button>
                    <button className="btn btn-outline-primary">📧 Email Report</button>
                    <button className="btn btn-outline-secondary">📋 Custom Report</button>
                    <button className="btn btn-outline-info">🔄 Schedule Reports</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Goals */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Performance Goals</h5>
                </div>
                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <div className="p-3 border rounded">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0">Monthly Earnings Goal</h6>
                          <span className="badge bg-primary">$2,000</span>
                        </div>
                        <div className="progress mb-2" style={{ height: '8px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${Math.min((reportData.totalEarnings / 2000) * 100, 100)}%`,
                            }}
                            aria-valuenow={reportData.totalEarnings}
                            aria-valuemin="0"
                            aria-valuemax="2000"
                          ></div>
                        </div>
                        <small className="text-muted">
                          ${reportData.totalEarnings} / $2,000 (
                          {((reportData.totalEarnings / 2000) * 100).toFixed(1)}%)
                        </small>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="p-3 border rounded">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0">Customer Satisfaction</h6>
                          <span className="badge bg-warning">4.8+</span>
                        </div>
                        <div className="progress mb-2" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{ width: `${(reportData.avgRating / 5) * 100}%` }}
                            aria-valuenow={reportData.avgRating}
                            aria-valuemin="0"
                            aria-valuemax="5"
                          ></div>
                        </div>
                        <small className="text-muted">
                          {reportData.avgRating} / 5.0 (
                          {((reportData.avgRating / 5) * 100).toFixed(1)}%)
                        </small>
                      </div>
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

export default ProviderReportsPage;
