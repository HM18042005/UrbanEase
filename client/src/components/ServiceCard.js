import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './ServiceCard.css';
import { getCategoryImage, getDefaultImage } from '../utils/categoryImages';

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
    _id,
    title,
    description,
    image,
    category,
    rating = 4.8,
    reviews = 125,
    price,
    startingPrice,
  } = service;

  // Use _id as fallback if id is not available
  const serviceId = id || _id;

  // Removed verbose debug logging to reduce dev console load

  const fallbackImg = category ? getCategoryImage(category, 'card') : getDefaultImage('card');

  // Prefer `price` from backend; fall back to `startingPrice` if present; default to 0
  const resolvedPrice = Number(
    (price !== undefined && price !== null ? price : startingPrice) ?? 0
  );

  const formatINR = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

  return (
    <div className={`service-card ${size}`}>
      <Link to={`/service/${serviceId}`} className="service-card-link">
        <div className="service-image">
          <img
            src={image || fallbackImg}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              // Avoid infinite error loops by removing the handler and using default image
              e.target.onerror = null;
              e.target.src = getDefaultImage('card');
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
              <span className="price-value">{formatINR(resolvedPrice)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ServiceCard;

ServiceCard.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    category: PropTypes.string,
    rating: PropTypes.number,
    reviews: PropTypes.number,
    price: PropTypes.number,
    startingPrice: PropTypes.number,
  }).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};
