import React from 'react';
import { Link } from 'react-router-dom';
import './ServiceCard.css';

/**
 * ServiceCard Component
 * 
 * What: Displays individual service information in a card format
 * When: Used on home page, services page, and category listings
 * Why: Provides consistent service display with image, title, description, and actions
 * 
 * Props:
 * - service: Object containing service details (id, title, description, image, category)
 * - size: 'small' | 'medium' | 'large' for different card sizes
 */
const ServiceCard = ({ service, size = 'medium' }) => {
  const {
    id,
    title,
    description,
    image,
    category,
    rating = 4.8,
    reviews = 125,
    startingPrice = 25
  } = service;

  return (
    <div className={`service-card ${size}`}>
      <Link to={`/service/${id}`} className="service-card-link">
        <div className="service-image">
          <img 
            src={image || `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop`} 
            alt={title}
            onError={(e) => {
              e.target.src = `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop`;
            }}
          />
          <div className="service-category">{category}</div>
        </div>
        
        <div className="service-content">
          <h3 className="service-title">{title}</h3>
          <p className="service-description">{description}</p>
          
          <div className="service-meta">
            <div className="service-rating">
              <span className="rating-stars">⭐</span>
              <span className="rating-value">{rating}</span>
              <span className="rating-count">({reviews} reviews)</span>
            </div>
            
            <div className="service-price">
              <span className="price-label">Starting at</span>
              <span className="price-value">${startingPrice}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ServiceCard;
