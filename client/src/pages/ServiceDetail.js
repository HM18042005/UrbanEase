import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './ServiceDetail.css';

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

  useEffect(() => {
    // Mock API call to fetch service details
    setTimeout(() => {
      // Mock data based on the Deep Cleaning service from the image
      setService({
        id: parseInt(id),
        title: 'Deep Cleaning Service',
        description: 'Comprehensive cleaning for your entire home, including hard-to-reach areas.',
        longDescription: 'Our deep cleaning service goes beyond the basics to provide a thorough and comprehensive clean of your home. We focus on areas that are often overlooked, such as baseboards, inside appliances, and under furniture. Our experienced cleaners use eco-friendly products and advanced techniques to ensure your home is spotless and healthy. This service is perfect for move-in/move-out cleaning, seasonal deep cleans, or preparing for a special event.',
        images: [
          'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=600&h=400&fit=crop'
        ],
        category: 'Home Cleaning',
        rating: 4.8,
        reviewCount: 125,
        startingPrice: 45,
        duration: '3-4 hours',
        whatsIncluded: [
          'Dusting and polishing all surfaces',
          'Cleaning inside appliances (oven, refrigerator, microwave)',
          'Scrubbing and sanitizing bathrooms',
          'Vacuuming and mopping all floors',
          'Cleaning windows and mirrors'
        ]
      });

      setProvider({
        id: 1,
        name: 'Sarah Miller',
        title: 'Professional Cleaner',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=100&h=100&fit=crop&crop=face',
        rating: 4.8,
        reviewCount: 125,
        yearsExperience: 5,
        description: 'Sarah Miller has been providing top-notch cleaning services in the city for over 5 years. With a keen eye for detail and a commitment to customer satisfaction, Sarah ensures every home she cleans is left sparkling. Her clients appreciate her professionalism, reliability, and friendly demeanor.'
      });

      setReviews([
        {
          id: 1,
          customerName: 'Emily Carter',
          rating: 5,
          date: '2 weeks ago',
          comment: 'Sarah did an amazing job with our deep cleaning! Our home has never looked better. She was thorough, efficient, and very pleasant to work with. Highly recommend!'
        },
        {
          id: 2,
          customerName: 'Jessica Lee',
          rating: 4,
          date: '1 month ago',
          comment: 'Sarah was great, but missed a few spots in the kitchen. Overall, the house was much cleaner, but I expected a bit more attention to detail in certain areas.'
        },
        {
          id: 3,
          customerName: 'Amanda Green',
          rating: 5,
          date: '2 months ago',
          comment: 'Sarah is a cleaning superstar! She transformed our apartment from top to bottom. Her attention to detail and friendly service made the experience wonderful. Will definitely book again!'
        }
      ]);

      setLoading(false);
    }, 500);
  }, [id]);

  const handleBookNow = () => {
    // Navigate to booking form or open booking modal
    alert('Booking functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="service-detail-page">
        <Header isLoggedIn={true} />
        <div className="loading-container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-detail-page">
        <Header isLoggedIn={true} />
        <div className="error-container">
          <h2>Service not found</h2>
          <button onClick={() => navigate('/services')}>Back to Services</button>
        </div>
      </div>
    );
  }

  return (
    <div className="service-detail-page">
      <Header isLoggedIn={true} />
      
      <main className="service-detail-main">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <span onClick={() => navigate('/services')} className="breadcrumb-link">
              Services
            </span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{service.category}</span>
          </nav>

          <div className="service-detail-content">
            {/* Left Column - Images and Details */}
            <div className="service-left">
              <div className="service-images">
                <div className="main-image">
                  <img src={service.images[0]} alt={service.title} />
                </div>
                <div className="image-thumbnails">
                  {service.images.slice(1).map((image, index) => (
                    <img key={index} src={image} alt={`${service.title} ${index + 2}`} />
                  ))}
                </div>
              </div>

              <div className="service-info">
                <h1 className="service-title">{service.title}</h1>
                <p className="service-description">{service.longDescription}</p>
              </div>

              {/* What's Included */}
              <div className="whats-included">
                <h3>What's Included</h3>
                <ul className="included-list">
                  {service.whatsIncluded.map((item, index) => (
                    <li key={index} className="included-item">
                      <span className="check-icon">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Provider Section */}
              <div className="provider-section">
                <h3>Provider</h3>
                <div className="provider-card">
                  <img src={provider.avatar} alt={provider.name} className="provider-avatar" />
                  <div className="provider-info">
                    <h4 className="provider-name">{provider.name}</h4>
                    <p className="provider-title">{provider.title}</p>
                    <div className="provider-rating">
                      <span className="rating-stars">⭐</span>
                      <span className="rating-value">{provider.rating}</span>
                      <span className="rating-count">({provider.reviewCount} reviews)</span>
                    </div>
                    <p className="provider-description">{provider.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="service-right">
              <div className="booking-card">
                <div className="price-section">
                  <span className="price-label">Starting at</span>
                  <span className="price-value">${service.startingPrice}</span>
                  <span className="duration">({service.duration})</span>
                </div>

                <div className="service-rating">
                  <span className="rating-stars">⭐</span>
                  <span className="rating-value">{service.rating}</span>
                  <span className="rating-count">({service.reviewCount} reviews)</span>
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
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <span className="reviewer-name">{review.customerName}</span>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <div className="review-rating">
                      {'⭐'.repeat(review.rating)}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceDetail;
