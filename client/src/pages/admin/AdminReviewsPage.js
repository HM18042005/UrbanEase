import { useEffect, useMemo, useState } from 'react';

import { adminAPI } from '../../api/services';
import Header from '../../components/Header';
import './AdminDashboard.css';

/**
 * AdminReviewsPage Component
 *
 * What: Review management interface for administrators
 * When: Admin needs to moderate, monitor, and manage platform reviews
 * Why: Ensures quality control and maintains platform reputation
 *
 * Features:
 * - Review list with search and filtering
 * - Review moderation (approve/reject/flag)
 * - Review analytics and statistics
 * - Detailed review inspection
 * - Provider and service review summaries
 */
const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Review statistics
  const stats = useMemo(() => {
    if (!Array.isArray(reviews))
      return { total: 0, pending: 0, approved: 0, flagged: 0, rejected: 0, avgRating: 0 };

    const total = reviews.length;
    const pending = reviews.filter((r) => r.status === 'pending').length;
    const approved = reviews.filter((r) => r.status === 'approved').length;
    const flagged = reviews.filter((r) => r.status === 'flagged').length;
    const rejected = reviews.filter((r) => r.status === 'rejected').length;
    const avgRating =
      reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    return { total, pending, approved, flagged, rejected, avgRating };
  }, [reviews]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch real reviews data from API
      const response = await adminAPI.getAllReviews();
      const reviewsData = response?.data || response?.reviews || response || [];

      // Ensure we always set an array
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (reviewId, action) => {
    try {
      let newStatus;
      switch (action) {
        case 'approve':
          newStatus = 'approved';
          break;
        case 'reject':
          newStatus = 'rejected';
          break;
        case 'flag':
          newStatus = 'flagged';
          break;
        default:
          return;
      }

      // Update review status via API
      await adminAPI.updateReviewStatus(reviewId, newStatus);

      // Update local state
      setReviews(
        reviews.map((review) =>
          review._id === reviewId ? { ...review, status: newStatus } : review
        )
      );
    } catch (err) {
      console.error('Error updating review:', err);
      setError(err.response?.data?.message || 'Failed to update review');
    }
  };

  const filteredReviews = useMemo(() => {
    if (!Array.isArray(reviews)) return [];

    return reviews.filter((review) => {
      const matchesSearch =
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.providerName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
      const matchesStatus = statusFilter === 'all' || review.status === statusFilter;

      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [reviews, searchTerm, ratingFilter, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'flagged':
        return '#ef4444';
      case 'rejected':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="admin-dashboard-page">
          <div className="admin-main">
            <div className="admin-content">
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading reviews...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="admin-dashboard-page">
        <div className="admin-main">
          <div className="admin-content">
            <div className="admin-header">
              <div className="header-content">
                <div className="breadcrumb">
                  <span className="breadcrumb-item">Admin</span>
                  <span className="breadcrumb-separator">›</span>
                  <span className="breadcrumb-item current">Review Management</span>
                </div>
                <h1>Review Management</h1>
                <p>Monitor and moderate platform reviews and ratings</p>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
                <button className="alert-close" onClick={() => setError('')}>
                  ×
                </button>
              </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total Reviews</div>
                </div>
                <div className="stat-icon">⭐</div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{stats.pending}</div>
                  <div className="stat-label">Pending Review</div>
                </div>
                <div className="stat-icon">⏳</div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{stats.approved}</div>
                  <div className="stat-label">Approved</div>
                </div>
                <div className="stat-icon">✅</div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{stats.flagged}</div>
                  <div className="stat-label">Flagged</div>
                </div>
                <div className="stat-icon">🚨</div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{stats.avgRating.toFixed(1)}⭐</div>
                  <div className="stat-label">Avg Rating</div>
                </div>
                <div className="stat-icon">📊</div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="admin-card">
              <div className="filters-section">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search reviews by comment, customer, service, or provider..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>

                <div className="filter-controls">
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="flagged">Flagged</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <button onClick={fetchReviews} className="refresh-btn" title="Refresh reviews">
                    🔄
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews Table */}
            <div className="admin-card">
              <div className="card-header">
                <h3>Reviews ({filteredReviews.length})</h3>
              </div>

              <div className="table-container">
                {filteredReviews.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">⭐</div>
                    <h3>No reviews found</h3>
                    <p>No reviews match your current filters</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Provider</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReviews.map((review) => (
                        <tr key={review._id}>
                          <td>
                            <div className="rating-display">
                              <span className="rating-stars">{renderStars(review.rating)}</span>
                              <span className="rating-number">({review.rating})</span>
                            </div>
                          </td>

                          <td>
                            <div className="review-content">
                              <p className="review-text">
                                {review.comment?.length > 80
                                  ? `${review.comment.substring(0, 80)}...`
                                  : review.comment}
                              </p>
                            </div>
                          </td>

                          <td>
                            <div className="user-info">
                              <div className="user-avatar">
                                {review.customerName?.[0]?.toUpperCase() || 'C'}
                              </div>
                              <div className="user-details">
                                <div className="user-name">{review.customerName}</div>
                                <div className="user-email">{review.customerEmail}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="service-info">
                              <span className="service-name">{review.serviceName}</span>
                            </div>
                          </td>

                          <td>
                            <div className="user-info">
                              <div className="user-avatar">
                                {review.providerName?.[0]?.toUpperCase() || 'P'}
                              </div>
                              <div className="user-details">
                                <div className="user-name">{review.providerName}</div>
                                <div className="user-email">{review.providerEmail}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="date-text">{formatDate(review.createdAt)}</span>
                          </td>

                          <td>
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor: getStatusColor(review.status),
                                color: 'white',
                              }}
                            >
                              {review.status}
                            </span>
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() => {
                                  setSelectedReview(review);
                                  setShowModal(true);
                                }}
                                className="action-btn view"
                                title="View full review"
                              >
                                👁️
                              </button>

                              {review.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleReviewAction(review._id, 'approve')}
                                    className="action-btn activate"
                                    title="Approve review"
                                  >
                                    ✅
                                  </button>
                                  <button
                                    onClick={() => handleReviewAction(review._id, 'reject')}
                                    className="action-btn delete"
                                    title="Reject review"
                                  >
                                    ❌
                                  </button>
                                </>
                              )}

                              {review.status !== 'flagged' && (
                                <button
                                  onClick={() => handleReviewAction(review._id, 'flag')}
                                  className="action-btn delete"
                                  title="Flag review"
                                >
                                  🚨
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Review Detail Modal */}
            {showModal && selectedReview && (
              <div
                className="modal-overlay"
                role="button"
                tabIndex={0}
                aria-label="Close modal"
                onClick={(e) => {
                  if (e.currentTarget === e.target) setShowModal(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowModal(false);
                  }
                }}
              >
                <div
                  className="modal-content user-modal"
                  role="dialog"
                  aria-modal="true"
                  tabIndex={-1}
                >
                  <div className="modal-header">
                    <h3>Review Details</h3>
                    <button className="modal-close" onClick={() => setShowModal(false)}>
                      ×
                    </button>
                  </div>

                  <div className="modal-body">
                    <div className="review-profile">
                      <div className="profile-info">
                        <h4>
                          {renderStars(selectedReview.rating)} ({selectedReview.rating}/5)
                        </h4>
                        <p className="profile-email">{selectedReview.serviceName}</p>
                        <span
                          className="profile-role"
                          style={{ backgroundColor: getStatusColor(selectedReview.status) }}
                        >
                          {selectedReview.status}
                        </span>
                      </div>
                    </div>

                    <div className="profile-details">
                      <dl className="detail-list">
                        <div className="detail-group">
                          <dt>Review Comment:</dt>
                          <dd>{selectedReview.comment}</dd>
                        </div>

                        <div className="detail-group">
                          <dt>Customer:</dt>
                          <dd>
                            {selectedReview.customerName} ({selectedReview.customerEmail})
                          </dd>
                        </div>

                        <div className="detail-group">
                          <dt>Service:</dt>
                          <dd>{selectedReview.serviceName}</dd>
                        </div>

                        <div className="detail-group">
                          <dt>Provider:</dt>
                          <dd>
                            {selectedReview.providerName} ({selectedReview.providerEmail})
                          </dd>
                        </div>

                        <div className="detail-group">
                          <dt>Date:</dt>
                          <dd>{formatDate(selectedReview.createdAt)}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Close
                    </button>

                    {selectedReview.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            handleReviewAction(selectedReview._id, 'approve');
                            setShowModal(false);
                          }}
                          className="btn btn-success"
                        >
                          Approve Review
                        </button>
                        <button
                          onClick={() => {
                            handleReviewAction(selectedReview._id, 'reject');
                            setShowModal(false);
                          }}
                          className="btn btn-danger"
                        >
                          Reject Review
                        </button>
                      </>
                    )}

                    {selectedReview.status !== 'flagged' && (
                      <button
                        onClick={() => {
                          handleReviewAction(selectedReview._id, 'flag');
                          setShowModal(false);
                        }}
                        className="btn btn-warning"
                      >
                        Flag Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default AdminReviewsPage;
