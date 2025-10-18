import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { bookingAPI } from '../../api/services';
import Header from '../../components/Header';
import PaymentModal from '../../components/PaymentModal';
import RescheduleModal from '../../components/RescheduleModal';
import ReviewModal from '../../components/ReviewModal';
import './BookingsPage.css';

const BookingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState({
    upcoming: [],
    completed: [],
    cancelled: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all bookings and categorize them
      const response = await bookingAPI.getBookings();
      console.warn('Bookings API response:', response);

      // Extract bookings array from response
      const allBookings = response?.bookings || response || [];
      console.warn('Extracted bookings:', allBookings);

      // Ensure we have an array
      if (!Array.isArray(allBookings)) {
        console.error('Bookings data is not an array:', allBookings);
        setError('Invalid bookings data format');
        return;
      }

      // Debug each booking object
      allBookings.forEach((booking, index) => {
        console.warn(`Booking ${index}:`, booking);
      });

      // Categorize bookings by status
      const categorizedBookings = {
        upcoming: allBookings.filter((booking) =>
          ['pending', 'confirmed', 'in_progress'].includes(booking.status.toLowerCase())
        ),
        completed: allBookings.filter((booking) => booking.status.toLowerCase() === 'completed'),
        cancelled: allBookings.filter((booking) => booking.status.toLowerCase() === 'cancelled'),
      };

      setBookings(categorizedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Failed to load bookings');
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
      case 'in_progress':
      case 'in-progress':
        return '#17a2b8';
      case 'completed':
        return '#007bff';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const renderStars = (rating) => {
    if (!rating) return '';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const handleReschedule = async (booking) => {
    setSelectedBooking(booking);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSuccess = () => {
    fetchBookings(); // Refresh bookings list
    setPaymentSuccess('Booking rescheduled successfully!');
    setTimeout(() => setPaymentSuccess(''), 3000);
  };

  // Payment functions
  const handlePayNow = (booking) => {
    const computedPrice = getBookingPrice(booking);

    setSelectedBooking({
      ...booking,
      servicePrice: computedPrice,
      totalAmount: booking.totalAmount ?? computedPrice,
      serviceName:
        booking.serviceName || booking.service?.title || booking.service?.name || 'Service',
      providerName: booking.providerName || booking.provider?.name || 'Not specified',
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (result) => {
    setShowPaymentModal(false);
    setSelectedBooking(null);
    setPaymentSuccess('Payment successful! Your booking has been confirmed.');
    // Refresh bookings to show updated status
    fetchBookings();
    // Clear success message after 5 seconds
    setTimeout(() => setPaymentSuccess(''), 5000);
  };

  const handlePaymentError = (error) => {
    setShowPaymentModal(false);
    setSelectedBooking(null);
    setError(`Payment failed: ${error}`);
  };

  const getPaymentStatus = (booking) => {
    return booking.paymentStatus || 'unpaid';
  };

  const getBookingPrice = (booking) => {
    const rawPrice =
      booking.totalAmount ??
      booking.price ??
      booking.amount ??
      booking.service?.price ??
      booking.service?.amount ??
      0;

    const numericPrice = Number(rawPrice);
    return Number.isFinite(numericPrice) ? Math.max(numericPrice, 0) : 0;
  };

  const formatPrice = (value) => {
    const numericPrice = Number(value);
    if (!Number.isFinite(numericPrice)) {
      return '0';
    }

    return numericPrice.toLocaleString('en-IN', {
      maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
    });
  };

  // Format status labels nicely for display
  const formatStatusLabel = (s) =>
    s ? s.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unknown';

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingAPI.cancelBooking(bookingId);
        alert('Booking cancelled successfully');
        fetchBookings(); // Refresh the list
      } catch (err) {
        console.error('Error cancelling booking:', err);
        alert('Failed to cancel booking');
      }
    }
  };

  const handleReview = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
    setPaymentSuccess('Review submitted successfully! Thank you for your feedback.');
    // Refresh bookings to show updated review status
    fetchBookings();
    // Clear success message after 5 seconds
    setTimeout(() => setPaymentSuccess(''), 5000);
  };

  const handleRebook = (booking) => {
    // TODO: Navigate to service detail page or booking form
    alert(`Rebook functionality coming soon for ${booking.serviceId || 'this service'}`);
  };

  const handleContactProvider = (booking) => {
    // Navigate to messages page - the booking-based conversation will show this provider
    navigate('/messages');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    // Handle both time string formats
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return timeString;
  };

  if (loading) {
    return (
      <div className="bookings-page">
        <Header />
        <div className="bookings-container">
          <div className="loading-container">
            <div className="loading-spinner">Loading your bookings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <Header />

      <div className="bookings-container">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <p>Track and manage all your service bookings</p>
        </div>

        {error && (
          <div className="error-container">
            <div className="error-message">
              <h3>Failed to Load Bookings</h3>
              <p>{error}</p>
              <button className="retry-button" onClick={fetchBookings}>
                Try Again
              </button>
            </div>
          </div>
        )}

        <div className="bookings-tabs">
          <button
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({bookings.upcoming.length})
          </button>
          <button
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({bookings.completed.length})
          </button>
          <button
            className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled ({bookings.cancelled.length})
          </button>
        </div>

        <div className="bookings-content">
          {bookings[activeTab].length === 0 ? (
            <div className="no-bookings">
              <div className="no-bookings-icon">📅</div>
              <h3>No {activeTab} bookings</h3>
              <p>
                {activeTab === 'upcoming'
                  ? "You don't have any upcoming bookings. Browse our services to book your next appointment!"
                  : `You don't have any ${activeTab} bookings at the moment.`}
              </p>
              {activeTab === 'upcoming' && (
                <button
                  className="browse-services-button"
                  onClick={() => (window.location.href = '/services')}
                >
                  Browse Services
                </button>
              )}
            </div>
          ) : (
            <div className="bookings-list">
              {bookings[activeTab].map((booking) => (
                <div key={booking._id || booking.id} className="booking-card">
                  <div className="booking-image">
                    <img
                      src={
                        booking.serviceImage ||
                        booking.image ||
                        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
                      }
                      alt={
                        booking.serviceName ||
                        booking.service?.title ||
                        booking.service?.name ||
                        'Service'
                      }
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
                      }}
                    />
                  </div>

                  <div className="booking-details">
                    <div className="booking-header">
                      <h3>
                        {booking.serviceName ||
                          booking.service?.title ||
                          booking.service?.name ||
                          'Service'}
                      </h3>
                      <span
                        className="booking-status"
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {formatStatusLabel(booking.status)}
                      </span>
                    </div>

                    <div className="booking-info">
                      <div className="info-row">
                        <span className="info-label">Provider:</span>
                        <span className="info-value">
                          {booking.providerName || booking.provider?.name || 'Not specified'}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Date & Time:</span>
                        <span className="info-value">
                          {formatDate(booking.date)} at {formatTime(booking.time)}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Address:</span>
                        <span className="info-value">{booking.address || 'Not specified'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Price:</span>
                        <span className="info-value price">
                          ₹{formatPrice(getBookingPrice(booking))}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Payment:</span>
                        <span className={`payment-status ${getPaymentStatus(booking)}`}>
                          {getPaymentStatus(booking).charAt(0).toUpperCase() +
                            getPaymentStatus(booking).slice(1)}
                        </span>
                      </div>

                      {booking.rating && (
                        <div className="info-row">
                          <span className="info-label">Rating:</span>
                          <span className="info-value rating">
                            {renderStars(booking.rating)} ({booking.rating}/5)
                          </span>
                        </div>
                      )}

                      {booking.review && (
                        <div className="info-row">
                          <span className="info-label">Review:</span>
                          <span className="info-value">"{booking.review}"</span>
                        </div>
                      )}

                      {booking.cancellationReason && (
                        <div className="info-row">
                          <span className="info-label">Reason:</span>
                          <span className="info-value">{booking.cancellationReason}</span>
                        </div>
                      )}

                      {booking.notes && (
                        <div className="info-row">
                          <span className="info-label">Notes:</span>
                          <span className="info-value">{booking.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="booking-actions">
                    {/* Contact Provider button - available for all booking statuses */}
                    <button
                      className="action-btn contact"
                      onClick={() => handleContactProvider(booking)}
                      title="Contact provider about this booking"
                    >
                      <span className="btn-icon" aria-hidden>
                        💬
                      </span>
                      <span className="btn-label">Contact Provider</span>
                    </button>

                    {activeTab === 'upcoming' && (
                      <>
                        {getPaymentStatus(booking) === 'unpaid' && (
                          <button
                            className="action-btn pay-now"
                            onClick={() => handlePayNow(booking)}
                            title="Pay now to confirm your booking"
                          >
                            <span className="btn-icon" aria-hidden>
                              💳
                            </span>
                            <span className="btn-label">Pay Now</span>
                          </button>
                        )}
                        <button
                          className="action-btn primary"
                          onClick={() => handleReschedule(booking)}
                          title="Reschedule this booking"
                        >
                          <span className="btn-icon" aria-hidden>
                            🗓️
                          </span>
                          <span className="btn-label">Reschedule</span>
                        </button>
                        <button
                          className="action-btn secondary"
                          onClick={() => handleCancel(booking._id || booking.id)}
                          title="Cancel this booking"
                        >
                          <span className="btn-icon" aria-hidden>
                            ❌
                          </span>
                          <span className="btn-label">Cancel</span>
                        </button>
                      </>
                    )}

                    {activeTab === 'completed' && (
                      <>
                        <button
                          className="action-btn primary"
                          onClick={() => handleReview(booking)}
                          title={booking.rating ? 'Edit your review' : 'Leave a review'}
                        >
                          <span className="btn-icon" aria-hidden>
                            {booking.rating ? '✏️' : '⭐'}
                          </span>
                          <span className="btn-label">
                            {booking.rating ? 'Edit Review' : 'Leave Review'}
                          </span>
                        </button>
                        <button
                          className="action-btn secondary"
                          onClick={() => handleRebook(booking)}
                          title="Book this service again"
                        >
                          <span className="btn-icon" aria-hidden>
                            🔁
                          </span>
                          <span className="btn-label">Book Again</span>
                        </button>
                      </>
                    )}

                    {activeTab === 'cancelled' && (
                      <button
                        className="action-btn primary"
                        onClick={() => handleRebook(booking)}
                        title="Book this service again"
                      >
                        <span className="btn-icon" aria-hidden>
                          🔁
                        </span>
                        <span className="btn-label">Book Again</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Success Message */}
        {paymentSuccess && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            <span>{paymentSuccess}</span>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <PaymentModal
          booking={selectedBooking}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBooking(null);
          }}
          onError={handlePaymentError}
        />
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedBooking && (
        <RescheduleModal
          booking={selectedBooking}
          isOpen={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedBooking(null);
          }}
          onSuccess={handleRescheduleSuccess}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default BookingsPage;
