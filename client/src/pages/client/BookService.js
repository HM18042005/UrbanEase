import { useCallback, useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { serviceAPI, bookingAPI } from '../../api/services';
import Header from '../../components/Header';
import './BookService.css';

/**
 * BookService Component
 *
 * What: Booking form for a specific service
 * When: Accessed when user clicks "Book Now" on service detail page
 * Why: Allows users to book services with date/time selection and details
 *
 * Features:
 * - Service information display
 * - Date and time selection
 * - Booking form with customer details
 * - Price calculation
 * - Booking confirmation
 */
const BookService = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    serviceId: id,
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
    address: '',
    contactPhone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchService = useCallback(async () => {
    try {
      setLoading(true);
      const serviceData = await serviceAPI.getService(id);
      setService(serviceData);
    } catch (err) {
      console.error('Error fetching service:', err);
      setError('Failed to load service details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bookingData.scheduledDate || !bookingData.scheduledTime || !bookingData.address) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      const booking = {
        ...bookingData,
        scheduledDateTime: `${bookingData.scheduledDate}T${bookingData.scheduledTime}`,
        totalAmount: service?.price || 0,
      };

      await bookingAPI.createBooking(booking);

      alert('Booking created successfully!');
      navigate('/bookings');
    } catch (err) {
      console.error('Error creating booking:', err);
      alert(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="book-service-page">
        <Header />
        <div className="container">
          <div className="loading">Loading service details...</div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="book-service-page">
        <Header />
        <div className="container">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error || 'Service not found'}</p>
            <button onClick={() => navigate('/services')} className="btn-primary">
              Back to Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="book-service-page">
      <Header />

      <main className="book-service-main">
        <div className="container">
          <div className="booking-header">
            <button onClick={() => navigate(`/service/${id}`)} className="back-btn">
              ← Back to Service
            </button>
            <h1>Book Service</h1>
          </div>

          <div className="booking-layout">
            {/* Left Column - Service Summary */}
            <div className="service-summary">
              <div className="service-card">
                <h3>{service.title}</h3>
                <p className="service-category">{service.category}</p>
                <p className="service-description">{service.description}</p>

                <div className="service-details">
                  <div className="detail-item">
                    <span className="label">Duration:</span>
                    <span className="value">{service.duration}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Price:</span>
                    <span className="value">₹{service.price}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Provider:</span>
                    <span className="value">{service.provider?.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="booking-form-section">
              <form onSubmit={handleSubmit} className="booking-form">
                <h3>Booking Details</h3>

                <div className="form-group">
                  <label htmlFor="scheduledDate">Preferred Date *</label>
                  <input
                    type="date"
                    id="scheduledDate"
                    name="scheduledDate"
                    value={bookingData.scheduledDate}
                    onChange={handleInputChange}
                    min={today}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="scheduledTime">Preferred Time *</label>
                  <input
                    type="time"
                    id="scheduledTime"
                    name="scheduledTime"
                    value={bookingData.scheduledTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Service Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={bookingData.address}
                    onChange={handleInputChange}
                    placeholder="Enter the complete address where service is needed"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactPhone">Contact Phone</label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={bookingData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="Your contact number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={bookingData.notes}
                    onChange={handleInputChange}
                    placeholder="Any specific requirements or instructions"
                    rows="3"
                  />
                </div>

                <div className="booking-summary">
                  <div className="summary-row">
                    <span>Service Price:</span>
                    <span>₹{service.price}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount:</span>
                    <span>₹{service.price}</span>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Creating Booking...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookService;
