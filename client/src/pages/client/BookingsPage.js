import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import './BookingsPage.css';
import { bookingAPI } from '../../api/services';

const BookingsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState({
    upcoming: [],
    completed: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all bookings and categorize them
      const response = await bookingAPI.getMyBookings();
      const allBookings = response.data || [];
      
      // Categorize bookings by status
      const categorizedBookings = {
        upcoming: allBookings.filter(booking => 
          ['pending', 'confirmed'].includes(booking.status.toLowerCase())
        ),
        completed: allBookings.filter(booking => 
          booking.status.toLowerCase() === 'completed'
        ),
        cancelled: allBookings.filter(booking => 
          booking.status.toLowerCase() === 'cancelled'
        )
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
      case 'confirmed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'completed': return '#007bff';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const renderStars = (rating) => {
    if (!rating) return '';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const handleReschedule = async (bookingId) => {
    try {
      // TODO: Implement reschedule functionality
      alert(`Reschedule functionality coming soon for booking ${bookingId}`);
    } catch (err) {
      console.error('Error rescheduling booking:', err);
      alert('Failed to reschedule booking');
    }
  };

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

  const handleReview = (bookingId) => {
    // TODO: Implement review functionality
    alert(`Review functionality coming soon for booking ${bookingId}`);
  };

  const handleRebook = (booking) => {
    // TODO: Navigate to service detail page or booking form
    alert(`Rebook functionality coming soon for ${booking.serviceId || 'this service'}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
        hour12: true
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
              <button 
                className="retry-button"
                onClick={fetchBookings}
              >
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
                  onClick={() => window.location.href = '/services'}
                >
                  Browse Services
                </button>
              )}
            </div>
          ) : (
            <div className="bookings-list">
              {bookings[activeTab].map(booking => (
                <div key={booking._id || booking.id} className="booking-card">
                  <div className="booking-image">
                    <img 
                      src={booking.serviceImage || booking.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'} 
                      alt={booking.serviceName || booking.service || 'Service'} 
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
                      }}
                    />
                  </div>
                  
                  <div className="booking-details">
                    <div className="booking-header">
                      <h3>{booking.serviceName || booking.service || 'Service'}</h3>
                      <span 
                        className="booking-status"
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="booking-info">
                      <div className="info-row">
                        <span className="info-label">Provider:</span>
                        <span className="info-value">{booking.providerName || booking.provider || 'Not specified'}</span>
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
                          ${booking.totalAmount || booking.price || 0}
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
                    {activeTab === 'upcoming' && (
                      <>
                        <button 
                          className="action-btn primary"
                          onClick={() => handleReschedule(booking._id || booking.id)}
                        >
                          Reschedule
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleCancel(booking._id || booking.id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {activeTab === 'completed' && (
                      <>
                        <button 
                          className="action-btn primary"
                          onClick={() => handleReview(booking._id || booking.id)}
                        >
                          {booking.rating ? 'Edit Review' : 'Leave Review'}
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleRebook(booking)}
                        >
                          Book Again
                        </button>
                      </>
                    )}
                    
                    {activeTab === 'cancelled' && (
                      <button 
                        className="action-btn primary"
                        onClick={() => handleRebook(booking)}
                      >
                        Book Again
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
  );
};

export default BookingsPage;
