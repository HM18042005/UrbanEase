import { useEffect, useMemo, useState } from 'react';

import { adminAPI } from '../../api/services';
import Header from '../../components/Header';
import './AdminDashboard.css';

/**
 * AdminBookingsPage Component
 *
 * What: Booking management interface for administrators
 * When: Admin needs to view, manage, and monitor all platform bookings
 * Why: Provides centralized booking administration with status management
 *
 * Features:
 * - Booking list with search and filtering
 * - Booking status management
 * - Revenue tracking and statistics
 * - Date range filtering
 * - Booking detail modal for full information
 */
const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Booking statistics
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const inProgress = bookings.filter((b) => b.status === 'in_progress').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
    const totalRevenue = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return { total, pending, confirmed, inProgress, completed, cancelled, totalRevenue };
  }, [bookings]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getAllBookings();
      const bookingsData = response.data?.bookings || response.bookings || [];
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await adminAPI.updateBookingStatus(bookingId, newStatus);
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking._id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      let matchesDate = true;
      if (dateFilter !== 'all') {
        const bookingDate = new Date(booking.scheduledDate || booking.createdAt);
        const now = new Date();

        switch (dateFilter) {
          case 'today':
            matchesDate = bookingDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = bookingDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = bookingDate >= monthAgo;
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#3b82f6';
      case 'in_progress':
        return '#8b5cf6';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getServiceName = (booking) => {
    return booking.serviceName || booking.service?.title || booking.service?.name || 'N/A';
  };

  const getServiceCategory = (booking) => {
    return booking.serviceCategory || booking.service?.category || 'N/A';
  };

  const getCustomerName = (booking) => {
    return booking.customerName || booking.customer?.name || 'N/A';
  };

  const getCustomerEmail = (booking) => {
    return booking.customerEmail || booking.customer?.email || 'N/A';
  };

  const getProviderName = (booking) => {
    return booking.providerName || booking.provider?.name || 'N/A';
  };

  const getProviderEmail = (booking) => {
    return booking.providerEmail || booking.provider?.email || 'N/A';
  };

  const getAvatarInitial = (name, fallback) => {
    return name?.trim()?.[0]?.toUpperCase() || fallback;
  };

  const getScheduledDate = (booking) => {
    return booking.scheduledDate || booking.date || booking.serviceDate || booking.createdAt;
  };

  const getBookingAmount = (booking) => {
    return booking.totalAmount ?? booking.amount ?? booking.service?.price ?? 0;
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
                <p>Loading bookings...</p>
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
                  <span className="breadcrumb-item current">Booking Management</span>
                </div>
                <h1>Booking Management</h1>
                <p>Monitor and manage all platform bookings</p>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
                <button className="alert-close" onClick={() => setError('')}>
                  ×
                </button>
              </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total Bookings</div>
                </div>
                <div className="stat-icon">📋</div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{stats.pending}</div>
                  <div className="stat-label">Pending</div>
                </div>
                <div className="stat-icon">⏳</div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{stats.confirmed}</div>
                  <div className="stat-label">Confirmed</div>
                </div>
                <div className="stat-icon">✅</div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{stats.completed}</div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat-icon">✨</div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-icon">💰</div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="admin-card">
              <div className="filters-section">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search by booking ID, service, customer, or provider..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>

                <div className="filter-controls">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                  </select>

                  <button onClick={fetchBookings} className="refresh-btn" title="Refresh bookings">
                    🔄
                  </button>
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="admin-card">
              <div className="card-header">
                <h3>Bookings ({filteredBookings.length})</h3>
              </div>

              <div className="table-container">
                {filteredBookings.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No bookings found</h3>
                    <p>No bookings match your current filters</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Service</th>
                        <th>Customer</th>
                        <th>Provider</th>
                        <th>Scheduled Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => {
                        const serviceName = getServiceName(booking);
                        const serviceCategory = getServiceCategory(booking);
                        const customerName = getCustomerName(booking);
                        const customerEmail = getCustomerEmail(booking);
                        const providerName = getProviderName(booking);
                        const providerEmail = getProviderEmail(booking);
                        const scheduledDate = getScheduledDate(booking);
                        const bookingAmount = getBookingAmount(booking);

                        return (
                          <tr key={booking._id}>
                            <td>
                              <div className="booking-id">
                                <span className="id-text">#{booking._id?.slice(-8)}</span>
                              </div>
                            </td>

                            <td>
                              <div className="service-info">
                                <div className="service-name">{serviceName}</div>
                                <div className="service-category">{serviceCategory}</div>
                              </div>
                            </td>

                            <td>
                              <div className="user-info">
                                <div className="user-avatar">
                                  {getAvatarInitial(customerName, 'C')}
                                </div>
                                <div className="user-details">
                                  <div className="user-name">{customerName}</div>
                                  <div className="user-email">{customerEmail}</div>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="user-info">
                                <div className="user-avatar">
                                  {getAvatarInitial(providerName, 'P')}
                                </div>
                                <div className="user-details">
                                  <div className="user-name">{providerName}</div>
                                  <div className="user-email">{providerEmail}</div>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="date-text">{formatDate(scheduledDate)}</span>
                            </td>

                            <td>
                              <span className="amount-text">{formatCurrency(bookingAmount)}</span>
                            </td>

                            <td>
                              <span
                                className="status-badge"
                                style={{
                                  backgroundColor: getStatusColor(booking.status),
                                  color: 'white',
                                }}
                              >
                                {booking.status?.replace('_', ' ')}
                              </span>
                            </td>

                            <td>
                              <div className="action-buttons">
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowModal(true);
                                  }}
                                  className="action-btn view"
                                  title="View details"
                                >
                                  👁️
                                </button>

                                {booking.status === 'pending' && (
                                  <button
                                    onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                    className="action-btn activate"
                                    title="Confirm booking"
                                  >
                                    ✅
                                  </button>
                                )}

                                {booking.status === 'confirmed' && (
                                  <button
                                    onClick={() => handleStatusUpdate(booking._id, 'in_progress')}
                                    className="action-btn activate"
                                    title="Start service"
                                  >
                                    🚀
                                  </button>
                                )}

                                {booking.status === 'in_progress' && (
                                  <button
                                    onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                    className="action-btn activate"
                                    title="Complete service"
                                  >
                                    ✨
                                  </button>
                                )}

                                {['pending', 'confirmed'].includes(booking.status) && (
                                  <button
                                    onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                    className="action-btn delete"
                                    title="Cancel booking"
                                  >
                                    ❌
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Booking Detail Modal */}
            {showModal && selectedBooking && (
              <div
                className="modal-overlay"
                role="button"
                tabIndex={0}
                aria-label="Close modal"
                onClick={(e) => {
                  if (e.currentTarget === e.target) setShowModal(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowModal(false);
                  }
                }}
              >
                <div
                  className="modal-content user-modal"
                  role="dialog"
                  aria-modal="true"
                  tabIndex={-1}
                >
                  <div className="modal-header">
                    <h3>Booking Details</h3>
                    <button className="modal-close" onClick={() => setShowModal(false)}>
                      ×
                    </button>
                  </div>

                  <div className="modal-body">
                    <div className="booking-profile">
                      <div className="profile-info">
                        <h4>Booking #{selectedBooking._id?.slice(-8)}</h4>
                        <p className="profile-email">{getServiceName(selectedBooking)}</p>
                        <span
                          className="profile-role"
                          style={{ backgroundColor: getStatusColor(selectedBooking.status) }}
                        >
                          {selectedBooking.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="profile-details">
                      <dl className="detail-list">
                        <div className="detail-group">
                          <dt>Service:</dt>
                          <dd>{getServiceName(selectedBooking)}</dd>
                        </div>

                        <div className="detail-group">
                          <dt>Customer:</dt>
                          <dd>
                            {getCustomerName(selectedBooking)} ({getCustomerEmail(selectedBooking)})
                          </dd>
                        </div>

                        <div className="detail-group">
                          <dt>Provider:</dt>
                          <dd>
                            {getProviderName(selectedBooking)} ({getProviderEmail(selectedBooking)})
                          </dd>
                        </div>

                        <div className="detail-group">
                          <dt>Scheduled Date:</dt>
                          <dd>{formatDate(getScheduledDate(selectedBooking))}</dd>
                        </div>

                        <div className="detail-group">
                          <dt>Amount:</dt>
                          <dd>{formatCurrency(getBookingAmount(selectedBooking))}</dd>
                        </div>

                        <div className="detail-group">
                          <dt>Created:</dt>
                          <dd>{formatDate(selectedBooking.createdAt)}</dd>
                        </div>

                        {selectedBooking.notes && (
                          <div className="detail-group">
                            <dt>Notes:</dt>
                            <dd>{selectedBooking.notes}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Close
                    </button>

                    {selectedBooking.status === 'pending' && (
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedBooking._id, 'confirmed');
                          setShowModal(false);
                        }}
                        className="btn btn-success"
                      >
                        Confirm Booking
                      </button>
                    )}

                    {['pending', 'confirmed'].includes(selectedBooking.status) && (
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedBooking._id, 'cancelled');
                          setShowModal(false);
                        }}
                        className="btn btn-danger"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminBookingsPage;
