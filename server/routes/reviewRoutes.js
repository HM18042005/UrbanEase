const express = require('express');
const {
  getServiceReviews,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  getProviderReviews
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/service/:serviceId', getServiceReviews);

// Protected routes
router.use(protect);

// User review management
router.get('/user', getUserReviews);
router.get('/provider', restrictTo('provider', 'admin'), getProviderReviews);
router.post('/', restrictTo('customer'), createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
