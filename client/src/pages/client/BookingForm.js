import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { serviceAPI, bookingAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import './BookingForm.css';

/**
 * BookingForm Component
 * 
 * What: Form for booking a specific service
 * When: Accessed when user clicks "Book Now" on service detail page
 * Why: Enables users to create bookings for services
 */
const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    notes: '',
    address: ''
  });

  const fetchService = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('BookingForm - Fetching service with ID:', id);
      
      if (!id || id === 'undefined') {
        setError('Invalid service ID');
        return;
      }
      
      const serviceData = await serviceAPI.getService(id);
      console.log('BookingForm - Service data received:', serviceData);
      setService(serviceData);
    } catch (err) {
      console.error('Error fetching service:', err);
      console.error('Error details:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load service details';
      setError(`Server error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    // Check if user is authenticated
    if (!user) {
      setError('Please log in to book a service');
      setSubmitting(false);
      navigate('/login');
      return;
    }
    
    // Check if token is missing and try to get one from the server
    let token = localStorage.getItem('token');
    console.log('Initial token check:', { token: token ? 'Present' : 'Missing', tokenLength: token?.length });
    
    if (!token) {
      try {
        console.log('Token missing, attempting to get fresh token from server...');
        // Call the auth/me endpoint to get current user and potentially a fresh token
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const authData = await response.json();
          console.log('Auth response:', authData);
          
          if (authData.token) {
            localStorage.setItem('token', authData.token);
            token = authData.token;
            console.log('Fresh token obtained and stored');
          } else {
            console.log('No token in auth response, relying on cookies');
          }
        } else {
          throw new Error(`Auth check failed: ${response.status}`);
        }
      } catch (authError) {
        console.error('Failed to get fresh token:', authError);
        setError('Authentication failed. Please log in again.');
        setSubmitting(false);
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              from: `/book-service/${id}`,
              message: 'Please log in to book this service'
            } 
          });
        }, 2000);
        return;
      }
    }
    
    console.log('Final token status:', { token: token ? 'Present' : 'Missing' });
    console.log('Proceeding with booking creation...');
    
    // Validate required fields
    if (!formData.date || !formData.time || !formData.address) {
      setError('Please fill in all required fields (Date, Time, and Address)');
      setSubmitting(false);
      return;
    }
    
    try {
      const bookingData = {
        serviceId: id,
        date: `${formData.date}T${formData.time}`,
        address: formData.address,
        notes: formData.notes
      };
      
      console.log('Submitting booking data:', bookingData);
      console.log('Current user:', user);
      console.log('Token being sent:', localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log('API Client withCredentials:', true);
      
      // Test token validity before booking
      try {
        console.log('Testing token validity...');
        const authTest = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Auth test result:', authTest.status, authTest.ok);
        if (!authTest.ok) {
          console.log('Token invalid, clearing and retrying...');
          localStorage.removeItem('token');
          throw new Error('Token expired');
        }
      } catch (tokenError) {
        console.error('Token validation failed:', tokenError);
        setError('Session expired. Please log in again.');
        setSubmitting(false);
        navigate('/login');
        return;
      }
      
      // Try booking with direct fetch call instead of axios
      console.log('Attempting booking with direct fetch...');
      try {
        const bookingResponse = await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bookingData)
        });
        
        console.log('Direct fetch booking result:', bookingResponse.status, bookingResponse.ok);
        
        if (!bookingResponse.ok) {
          const errorData = await bookingResponse.json();
          throw new Error(errorData.message || `Booking failed: ${bookingResponse.status}`);
        }
        
        const result = await bookingResponse.json();
        console.log('Booking created via fetch:', result);
        
        navigate('/bookings', { 
          state: { message: 'Booking created successfully!' }
        });
        return;
      } catch (fetchError) {
        console.error('Direct fetch booking failed:', fetchError);
        console.log('Falling back to axios...');
      }
      
      const result = await bookingAPI.createBooking(bookingData);
      console.log('Booking created:', result);
      
      navigate('/bookings', { 
        state: { message: 'Booking created successfully!' }
      });
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="service-detail">
        <Header />
        <main className="service-main">
          <div className="container">
            <div className="loading-container">
              <p>Loading service details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="service-detail">
        <Header />
        <main className="service-main">
          <div className="container">
            <div className="error-container">
              <h2>Failed to Load Service</h2>
              <p>{error}</p>
              <button onClick={() => navigate('/services')}>
                Back to Services
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="service-detail">
      <Header />
      <main className="service-main">
        <div className="container">
          <div className="service-content">
            <button 
              className="back-button"
              onClick={() => navigate(`/service/${id}`)}
            >
              ← Back to Service
            </button>
            
            <h1>Book Service: {service?.title}</h1>
            
            <div className="booking-layout">
              {/* Service Summary */}
              <div className="service-summary">
                <h3>Service Details</h3>
                <div className="summary-item">
                  <strong>Service:</strong> {service?.title}
                </div>
                <div className="summary-item">
                  <strong>Provider:</strong> {service?.provider?.name}
                </div>
                <div className="summary-item">
                  <strong>Price:</strong> ₹{service?.price}
                </div>
                <div className="summary-item">
                  <strong>Duration:</strong> {service?.duration}
                </div>
              </div>

              {/* Booking Form */}
              <div className="booking-form-container">
                <h3>Booking Information</h3>
                
                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#f0f8ff', 
                    border: '1px solid #ccc', 
                    marginBottom: '20px',
                    borderRadius: '4px'
                  }}>
                    <strong>Debug Info:</strong><br/>
                    User: {user ? `${user.name} (${user.email}) - Role: ${user.role}` : 'Not logged in'}<br/>
                    Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="booking-form">
                  <div className="form-group">
                    <label htmlFor="date">Preferred Date *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="time">Preferred Time *</label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Service Address *</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter the address where service is needed"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes">Additional Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any specific requirements or notes"
                      rows="3"
                    />
                  </div>

                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => navigate(`/service/${id}`)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={submitting}
                    >
                      {submitting ? 'Creating Booking...' : 'Book Now'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingForm;