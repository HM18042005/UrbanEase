import { useState } from 'react';

import PropTypes from 'prop-types';

import { createReview } from '../api/services';
import './ReviewModal.css';

const ReviewModal = ({ booking, isOpen, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Please provide a review with at least 10 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reviewData = {
        serviceId: booking.service?._id || booking.service?.id || booking.serviceId,
        providerId: booking.provider?._id || booking.provider?.id || booking.providerId,
        bookingId: booking._id || booking.id,
        rating: Number(rating),
        comment: comment.trim(),
      };

      await createReview(reviewData);
      onSuccess && onSuccess();
      onClose();

      // Reset form
      setRating(0);
      setComment('');
    } catch (err) {
      console.error('Review submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setError('');
    onClose();
  };

  const handleStarClick = (selectedRating) => {
    setRating(selectedRating);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="review-modal">
        <div className="modal-header">
          <h3>Write a Review</h3>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="service-info">
            <h4>Service Details:</h4>
            <p>
              <strong>Service:</strong> {booking.service?.title || booking.serviceName}
            </p>
            <p>
              <strong>Provider:</strong> {booking.provider?.name || booking.providerName}
            </p>
            <p>
              <strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-group">
              <label htmlFor="rating-stars">Rating:</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= rating ? 'filled' : ''}`}
                    onClick={() => handleStarClick(star)}
                    id={star === 1 ? 'rating-stars' : undefined}
                  >
                    ★
                  </button>
                ))}
                <span className="rating-text">
                  {rating > 0 && (
                    <span>
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Very Good'}
                      {rating === 5 && 'Excellent'}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comment">Your Review:</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience with this service..."
                rows={4}
                className="comment-textarea"
                maxLength={500}
              />
              <div className="character-count">{comment.length}/500 characters</div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={handleClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={loading || rating === 0}>
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>

          <div className="review-note">
            <p>
              <strong>Note:</strong> Reviews help other customers make informed decisions and help
              providers improve their services. Please be honest and constructive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

ReviewModal.propTypes = {
  booking: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    serviceId: PropTypes.string,
    providerId: PropTypes.string,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    service: PropTypes.shape({
      _id: PropTypes.string,
      id: PropTypes.string,
      title: PropTypes.string,
    }),
    provider: PropTypes.shape({
      _id: PropTypes.string,
      id: PropTypes.string,
      name: PropTypes.string,
    }),
    serviceName: PropTypes.string,
    providerName: PropTypes.string,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
