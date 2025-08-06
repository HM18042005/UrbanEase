import React, { useState } from 'react';
import Header from '../components/Header';
import './BookingsPage.css';

const BookingsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock bookings data
  const bookings = {
    upcoming: [
      {
        id: 1,
        service: 'House Cleaning',
        provider: 'Sarah Johnson',
        date: '2025-08-15',
        time: '10:00 AM',
        status: 'confirmed',
        price: 120,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        address: '123 Main St, City Center'
      },
      {
        id: 2,
        service: 'Plumbing Repair',
        provider: 'Mike Wilson',
        date: '2025-08-18',
        time: '2:00 PM',
        status: 'pending',
        price: 85,
        image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
        address: '456 Oak Ave, Downtown'
      },
      {
        id: 3,
        service: 'Garden Maintenance',
        provider: 'Green Thumb Co.',
        date: '2025-08-20',
        time: '9:00 AM',
        status: 'confirmed',
        price: 95,
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
        address: '789 Garden Rd, Suburbs'
      }
    ],
    completed: [
      {
        id: 4,
        service: 'AC Repair',
        provider: 'Cool Air Services',
        date: '2025-07-25',
        time: '11:00 AM',
        status: 'completed',
        price: 150,
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop',
        address: '321 Summer St, Uptown',
        rating: 5,
        review: 'Excellent service! Very professional and quick.'
      },
      {
        id: 5,
        service: 'House Painting',
        provider: 'Paint Masters',
        date: '2025-07-20',
        time: '8:00 AM',
        status: 'completed',
        price: 450,
        image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop',
        address: '654 Brush Lane, Old Town',
        rating: 4,
        review: 'Good work, finished on time.'
      }
    ],
    cancelled: [
      {
        id: 6,
        service: 'Carpet Cleaning',
        provider: 'Fresh Carpets',
        date: '2025-07-30',
        time: '3:00 PM',
        status: 'cancelled',
        price: 80,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        address: '987 Fabric St, Midtown',
        cancellationReason: 'Customer request'
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'completed': return '#007bff';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const handleReschedule = (bookingId) => {
    alert(`Reschedule booking ${bookingId}`);
  };

  const handleCancel = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      alert(`Booking ${bookingId} cancelled`);
    }
  };

  const handleReview = (bookingId) => {
    alert(`Leave review for booking ${bookingId}`);
  };

  const handleRebook = (bookingId) => {
    alert(`Rebook service ${bookingId}`);
  };

  return (
    <div className="bookings-page">
      <Header />
      
      <div className="bookings-container">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <p>Track and manage all your service bookings</p>
        </div>

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
              <p>You don't have any {activeTab} bookings at the moment.</p>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings[activeTab].map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-image">
                    <img src={booking.image} alt={booking.service} />
                  </div>
                  
                  <div className="booking-details">
                    <div className="booking-header">
                      <h3>{booking.service}</h3>
                      <span 
                        className="booking-status"
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="booking-info">
                      <div className="info-row">
                        <span className="info-label">Provider:</span>
                        <span className="info-value">{booking.provider}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Date & Time:</span>
                        <span className="info-value">{booking.date} at {booking.time}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Address:</span>
                        <span className="info-value">{booking.address}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Price:</span>
                        <span className="info-value price">${booking.price}</span>
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
                    </div>
                  </div>
                  
                  <div className="booking-actions">
                    {activeTab === 'upcoming' && (
                      <>
                        <button 
                          className="action-btn primary"
                          onClick={() => handleReschedule(booking.id)}
                        >
                          Reschedule
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleCancel(booking.id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {activeTab === 'completed' && (
                      <>
                        <button 
                          className="action-btn primary"
                          onClick={() => handleReview(booking.id)}
                        >
                          {booking.rating ? 'Edit Review' : 'Leave Review'}
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleRebook(booking.id)}
                        >
                          Book Again
                        </button>
                      </>
                    )}
                    
                    {activeTab === 'cancelled' && (
                      <button 
                        className="action-btn primary"
                        onClick={() => handleRebook(booking.id)}
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
