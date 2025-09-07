import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import './ServiceDetail.css';
import { serviceAPI, reviewAPI } from '../../api/services';

/**
 * ServiceDetail Component
 * 
 * What: Detailed view of a specific service with booking functionality
 * When: Accessed when user clicks on a service card
 * Why: Provides comprehensive service information and enables booking
 * 
 * Features:
 * - Service images gallery
 * - Service description and details
 * - Provider information and reviews
 * - Booking form
 * - What's included checklist
 * - Customer reviews section
 */
const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServiceDetail();
  }, [id]);

  const fetchServiceDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch service details
      const serviceResponse = await serviceAPI.getServiceById(id);
      const serviceData = serviceResponse.data;
      setService(serviceData);
      
      // Fetch provider info if available
      if (serviceData.providerId) {
        try {
          const providerResponse = await serviceAPI.getProviderById(serviceData.providerId);
          setProvider(providerResponse.data);
        } catch (providerError) {
          console.error('Error fetching provider:', providerError);
        }
      }
      
      // Fetch reviews for this service
      try {
        const reviewsResponse = await reviewAPI.getServiceReviews(id);
        setReviews(reviewsResponse.data || []);
      } catch (reviewError) {
        console.error('Error fetching reviews:', reviewError);
        setReviews([]);
      }
      
    } catch (err) {
      console.error('Error fetching service detail:', err);
      setError(err.response?.data?.message || 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    // Navigate to booking form - TODO: Implement booking functionality
    navigate(`/book-service/${id}`);
  };

  const renderStars = (rating) => {
    if (!rating) return '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return '⭐'.repeat(fullStars) + (hasHalfStar ? '⭐' : '');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="service-detail-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner">Loading service details...</div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="service-detail-page">
        <Header />
        <div className="error-container">
          <h2>{error || 'Service not found'}</h2>
          <p>{error || 'The service you are looking for could not be found.'}</p>
          <button onClick={() => navigate('/services')}>Back to Services</button>
        </div>
      </div>
    );
  }

  return (
    <div className="service-detail-page">
      <Header />
      
      <main className="service-detail-main">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <span onClick={() => navigate('/services')} className="breadcrumb-link">
              Services
            </span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{service.category || 'Service'}</span>
          </nav>

          <div className="service-detail-content">
            {/* Left Column - Images and Details */}
            <div className="service-left">
              <div className="service-images">
                <div className="main-image">
                  <img 
                    src={service.images?.[0] || service.image || 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&h=400&fit=crop'} 
                    alt={service.title || service.name || 'Service'} 
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&h=400&fit=crop';
                    }}
                  />
                </div>
                {service.images && service.images.length > 1 && (
                  <div className="image-thumbnails">
                    {service.images.slice(1, 4).map((image, index) => (
                      <img 
                        key={index} 
                        src={image} 
                        alt={`${service.title || service.name} ${index + 2}`}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&h=400&fit=crop';
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="service-info">
                <h1 className="service-title">{service.title || service.name || 'Service'}</h1>
                <p className="service-description">
                  {service.longDescription || service.description || 'No description available.'}
                </p>
              </div>

              {/* What's Included */}
              {(service.whatsIncluded || service.features) && (
                <div className="whats-included">
                  <h3>What's Included</h3>
                  <ul className="included-list">
                    {(service.whatsIncluded || service.features || []).map((item, index) => (
                      <li key={index} className="included-item">
                        <span className="check-icon">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Provider Section */}
              {provider && (
                <div className="provider-section">
                  <h3>Provider</h3>
                  <div className="provider-card">
                    <div className="provider-avatar">
                      {provider.profileImage ? (
                        <img src={provider.profileImage} alt={provider.name} />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div className="provider-info">
                      <h4 className="provider-name">{provider.name}</h4>
                      <p className="provider-title">{provider.title || provider.businessName || 'Service Provider'}</p>
                      <div className="provider-rating">
                        <span className="rating-stars">{renderStars(provider.rating)}</span>
                        <span className="rating-value">{provider.rating || 'No rating'}</span>
                        <span className="rating-count">({provider.reviewCount || 0} reviews)</span>
                      </div>
                      <p className="provider-description">
                        {provider.description || provider.bio || 'Professional service provider.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking Card */}
            <div className="service-right">
              <div className="booking-card">
                <div className="price-section">
                  <span className="price-label">Starting at</span>
                  <span className="price-value">${service.price || service.startingPrice || 0}</span>
                  {service.duration && <span className="duration">({service.duration})</span>}
                </div>

                <div className="service-rating">
                  <span className="rating-stars">{renderStars(service.rating)}</span>
                  <span className="rating-value">{service.rating || 'No rating'}</span>
                  <span className="rating-count">({reviews.length} reviews)</span>
                </div>

                <button className="book-now-btn" onClick={handleBookNow}>
                  Book Now
                </button>

                <div className="booking-info">
                  <div className="info-item">
                    <span className="info-icon">📅</span>
                    <span>Flexible scheduling</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">💰</span>
                    <span>No hidden fees</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">🛡️</span>
                    <span>Satisfaction guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="reviews-section">
            <h3>Customer Reviews</h3>
            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((review, index) => (
                  <div key={review._id || review.id || index} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <span className="reviewer-name">
                          {review.customerName || review.userName || 'Anonymous'}
                        </span>
                        <span className="review-date">
                          {formatDate(review.createdAt || review.date)}
                        </span>
                      </div>
                      <div className="review-rating">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="review-comment">
                      {review.comment || review.review || 'No comment provided.'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to review this service!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceDetail;
