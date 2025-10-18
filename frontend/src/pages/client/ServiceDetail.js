import { useCallback, useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { reviewAPI, serviceAPI, getServicesByCategory } from '../../api/services';
import Header from '../../components/Header';
import './ServiceDetail.css';
import ServiceCard from '../../components/ServiceCard';
import { getCategoryImage, getDefaultImage } from '../../utils/categoryImages';

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
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [relatedServices, setRelatedServices] = useState([]);

  // Debug log
  console.warn('ServiceDetail - ID from params:', id);

  const fetchServiceDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id || id === 'undefined') {
        setError(`Invalid service ID: ${id}. Please check the URL or go back to services.`);
        setLoading(false);
        return;
      }

      // Fetch service details
      const serviceData = await serviceAPI.getService(id);
      setService(serviceData);

      // Provider info is already included in the service response
      if (serviceData.provider) {
        setProvider(serviceData.provider);
      }

      // Fetch reviews for this service
      try {
        const reviewsData = await reviewAPI.getReviews(id);
        setReviews(reviewsData || []);
      } catch (reviewError) {
        console.error('Error fetching reviews:', reviewError);
        setReviews([]);
      }
      // Fetch related services in same category (best-effort)
      try {
        if (serviceData.category) {
          const rel = await getServicesByCategory(serviceData.category);
          const filtered = (rel || []).filter(
            (s) => (s._id || s.id) !== (serviceData._id || serviceData.id)
          );
          setRelatedServices(filtered.slice(0, 3));
        } else {
          setRelatedServices([]);
        }
      } catch (relErr) {
        console.warn('Related services fetch failed:', relErr);
        setRelatedServices([]);
      }
    } catch (err) {
      console.error('Error fetching service detail:', err);
      setError(err.response?.data?.message || 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchServiceDetail();
  }, [fetchServiceDetail]);

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

  const priceNumber = Number((service.price ?? service.startingPrice) || 0);
  const formattedPrice =
    priceNumber > 0 ? `₹${priceNumber.toLocaleString('en-IN')}` : 'Contact for quote';
  const ratingNumber = Number(service.rating);
  const hasRating = Number.isFinite(ratingNumber) && ratingNumber > 0;
  const ratingDisplay = hasRating ? ratingNumber.toFixed(1) : 'New';
  const ratingStars = hasRating ? renderStars(ratingNumber) : '☆';
  const reviewsLabel =
    reviews.length > 0
      ? `${reviews.length} review${reviews.length > 1 ? 's' : ''}`
      : 'No reviews yet';
  const ratingDescriptor = hasRating ? `${ratingDisplay} / 5` : 'Awaiting reviews';
  const ratingSummaryClass = hasRating ? 'rating-summary positive' : 'rating-summary neutral';

  const quickStats = [
    {
      label: 'Avg Rating',
      value: ratingDisplay,
      hint: reviews.length > 0 ? reviewsLabel : 'Awaiting feedback',
    },
    {
      label: 'Price From',
      value: formattedPrice,
      hint: service.duration || 'Flexible schedule',
    },
    {
      label: 'Status',
      value:
        service.isAvailable !== undefined
          ? service.isAvailable
            ? 'Available'
            : 'Waitlist'
          : 'On request',
      hint: service.category || 'Service',
    },
  ];

  return (
    <div className="service-detail-page">
      <Header />

      <main className="service-detail-main">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <button type="button" onClick={() => navigate('/services')} className="breadcrumb-link">
              Services
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{service.category || 'Service'}</span>
          </nav>

          <div className="service-detail-content">
            {/* Left Column - Images and Details */}
            <div className="service-left">
              <div className="service-images">
                <div className="main-image">
                  <img
                    src={
                      (service.images && service.images[selectedImageIdx]) ||
                      service.image ||
                      getCategoryImage(service.category, 'detail')
                    }
                    alt={service.title || service.name || 'Service'}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getDefaultImage('detail');
                    }}
                  />
                </div>
                {service.images && service.images.length > 1 && (
                  <div className="image-thumbnails">
                    {service.images.slice(0, 6).map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`thumb-btn ${selectedImageIdx === index ? 'active' : ''}`}
                        onClick={() => setSelectedImageIdx(index)}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img
                          src={image || getCategoryImage(service.category, 'thumb')}
                          alt={`${service.title || service.name} ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getDefaultImage('thumb');
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="service-info">
                <h1 className="service-title">{service.title || service.name || 'Service'}</h1>
                <div className="meta-chips" aria-label="Service meta">
                  {service.category && <span className="chip primary">{service.category}</span>}
                  {service.duration && <span className="chip">{service.duration}</span>}
                  {service.isAvailable !== undefined && (
                    <span className={`chip ${service.isAvailable ? 'success' : 'danger'}`}>
                      {service.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  )}
                </div>
                <div className="service-quick-stats" role="list">
                  {quickStats.map((stat) => (
                    <div key={stat.label} className="quick-stat" role="listitem">
                      <span className="quick-stat-label">{stat.label}</span>
                      <span className="quick-stat-value">{stat.value}</span>
                      <span className="quick-stat-hint">{stat.hint}</span>
                    </div>
                  ))}
                </div>
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

              {/* Highlights */}
              <div className="highlights">
                <h3>Highlights</h3>
                <div className="highlights-grid">
                  {(service.highlights && service.highlights.length > 0
                    ? service.highlights
                    : ['Verified provider', 'Upfront pricing', 'Top-rated service']
                  ).map((hl, i) => (
                    <div key={i} className="highlight-card">
                      <div className="highlight-icon">⭐</div>
                      <div className="highlight-text">{hl}</div>
                    </div>
                  ))}
                </div>
              </div>

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
                      <p className="provider-title">
                        {provider.title || provider.businessName || 'Service Provider'}
                      </p>
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
                  <div className="price-primary">
                    <span className="price-label">Starting at</span>
                    <span className="price-value">{formattedPrice}</span>
                    {service.duration && <span className="duration">({service.duration})</span>}
                  </div>
                  <div className={ratingSummaryClass}>
                    <span className="rating-stars" aria-hidden="true">
                      {ratingStars}
                    </span>
                    <div className="rating-copy">
                      <span className="rating-value">{ratingDescriptor}</span>
                      <span className="rating-count">{reviewsLabel}</span>
                    </div>
                  </div>
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
                      <div className="review-rating">{renderStars(review.rating)}</div>
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

          {/* Related Services */}
          {relatedServices.length > 0 && (
            <section className="related-section">
              <h3>Related Services</h3>
              <div className="related-grid">
                {relatedServices.map((srv) => (
                  <ServiceCard key={srv._id || srv.id} service={srv} size="medium" />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default ServiceDetail;
