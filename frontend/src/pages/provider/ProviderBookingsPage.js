import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { providerAPI } from '../../api/services';
import Header from '../../components/Header';
import './Dashboard.css';
import './ProviderBookingsPage.css';

/**
 * ProviderBookingsPage Component
 *
 * What: Provider booking management interface with client contact functionality
 * When: Accessed by providers to view and manage their bookings
 * Why: Allows providers to track bookings and communicate with clients who booked services
 *
 * Features:
 * - View all bookings with filtering by status
 * - Contact clients who have booked services
 * - Update booking status
 * - Secure messaging based on booking relationships
 */
const ProviderBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch bookings based on status filter
  const fetchBookings = async (status = '') => {
    try {
      setLoading(true);
      const params = status && status !== 'all' ? { status } : {};
      const response = await providerAPI.getBookings(params);
      setBookings(response.bookings || []);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab]);

  // Handle contact client functionality
  const handleContactClient = (booking) => {
    if (!booking.customer || !booking.customer._id) {
      console.error('Customer information not available');
      return;
    }

    // Navigate to provider messages page with the client's ID
    navigate(
      `/provider/messages?clientId=${booking.customer._id}&clientName=${encodeURIComponent(booking.customer.name)}`
    );
  };

  // Handle booking status update
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await providerAPI.updateBookingStatus(bookingId, { status: newStatus });
      // Refresh bookings
      fetchBookings(activeTab);
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  // Normalize status helper (UI may get in_progress from API)
  const normalizeStatus = (s) => (s === 'in_progress' ? 'in-progress' : s);
  const formatStatusLabel = (s) => {
    const base = normalizeStatus(s) || '';
    const formatted = base.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return formatted || 'Unknown';
  };

  // Filter bookings based on search term
  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.customer?.name?.toLowerCase().includes(searchLower) ||
      booking.service?.title?.toLowerCase().includes(searchLower) ||
      normalizeStatus(booking.status)?.toLowerCase().includes(searchLower)
    );
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    return timeString;
  };

  // Get status color
  const getStatusColor = (status) => {
    const s = normalizeStatus(status);
    const colors = {
      pending: '#ffc107',
      confirmed: '#28a745',
      'in-progress': '#17a2b8',
      completed: '#6c757d',
      cancelled: '#dc3545',
    };
    return colors[s] || '#6c757d';
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="provider-bookings-page">
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading bookings...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header isLoggedIn={true} userType="provider" />
      <div className="provider-bookings-page">
        <div className="container-fluid px-3">
          <div className="content-container">
            <div className="bookings-header">
              <h1>My Bookings</h1>
              <p>Manage your client bookings and communicate with customers</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Search Bar */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by customer name, service, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Status Tabs */}
            <div className="bookings-tabs">
              {['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map(
                (status) => (
                  <button
                    key={status}
                    className={`tab ${activeTab === status ? 'active' : ''}`}
                    onClick={() => setActiveTab(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </button>
                )
              )}
            </div>

            {/* Bookings List */}
            <div className="bookings-content">
              {filteredBookings.length === 0 ? (
                <div className="no-bookings">
                  <div className="no-bookings-icon">📅</div>
                  <h3>No bookings found</h3>
                  <p>
                    {activeTab === 'all'
                      ? "You don't have any bookings yet. Promote your services to get more clients!"
                      : `No ${activeTab} bookings found.`}
                  </p>
                </div>
              ) : (
                <div className="bookings-list">
                  {filteredBookings.map((booking) => (
                    <div key={booking._id} className="booking-card">
                      {/* Left: Image - mirrors client card */}
                      <div className="booking-image">
                        <img
                          src={
                            booking.service?.image ||
                            booking.image ||
                            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
                          }
                          alt={booking.service?.title || 'Service'}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
                          }}
                        />
                      </div>

                      {/* Middle: Details with header */}
                      <div className="booking-details">
                        <div className="booking-header">
                          <h3>{booking.service?.title || 'Service'}</h3>
                          <span
                            className="booking-status"
                            style={{ backgroundColor: getStatusColor(booking.status) }}
                          >
                            {formatStatusLabel(booking.status)}
                          </span>
                        </div>

                        <div className="booking-info">
                          <div className="info-row">
                            <span className="info-label">Client:</span>
                            <span className="info-value">
                              {booking.customer?.name || 'Not specified'}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Email:</span>
                            <span className="info-value">
                              {booking.customer?.email || 'Not specified'}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Phone:</span>
                            <span className="info-value">
                              {booking.customer?.phone || 'Not specified'}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Date & Time:</span>
                            <span className="info-value">
                              {formatDate(booking.date)} at {formatTime(booking.time)}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Duration:</span>
                            <span className="info-value">
                              {booking.service?.duration || 'Not specified'}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Amount:</span>
                            <span className="info-value price">
                              ₹{booking.totalAmount || booking.service?.price || '0'}
                            </span>
                          </div>
                          {booking.notes && (
                            <div className="info-row">
                              <span className="info-label">Notes:</span>
                              <span className="info-value">{booking.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions - match client structure */}
                      <div className="booking-actions">
                        {/* Contact Client button - available for all booking statuses */}
                        <button
                          className="action-btn contact"
                          onClick={() => handleContactClient(booking)}
                          title="Contact client about this booking"
                        >
                          <span className="btn-icon" aria-hidden>
                            💬
                          </span>
                          <span className="btn-label">Contact Client</span>
                        </button>

                        {/* Status-specific actions */}
                        {booking.status === 'pending' && (
                          <>
                            <button
                              className="action-btn primary"
                              onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                            >
                              <span className="btn-icon" aria-hidden>
                                ✅
                              </span>
                              <span className="btn-label">Confirm</span>
                            </button>
                            <button
                              className="action-btn secondary"
                              onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                            >
                              <span className="btn-icon" aria-hidden>
                                ❌
                              </span>
                              <span className="btn-label">Decline</span>
                            </button>
                          </>
                        )}

                        {normalizeStatus(booking.status) === 'confirmed' && (
                          <button
                            className="action-btn primary"
                            onClick={() => handleUpdateStatus(booking._id, 'in-progress')}
                          >
                            <span className="btn-icon" aria-hidden>
                              🛠️
                            </span>
                            <span className="btn-label">Start Service</span>
                          </button>
                        )}

                        {normalizeStatus(booking.status) === 'in-progress' && (
                          <button
                            className="action-btn primary"
                            onClick={() => handleUpdateStatus(booking._id, 'completed')}
                          >
                            <span className="btn-icon" aria-hidden>
                              ✔️
                            </span>
                            <span className="btn-label">Mark Complete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProviderBookingsPage;
