const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getProviderServices,
  getCategories,
  toggleAvailability,
  getServiceStats,
  searchServices,
  getFeaturedServices,
  getPopularServices,
  advancedSearch
} = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes - specific routes first
router.get('/', getServices);
router.get('/categories', getCategories);
router.get('/search', searchServices);
router.post('/advanced-search', advancedSearch);
router.get('/featured', getFeaturedServices);
router.get('/popular', getPopularServices);
router.get('/:id', getService);

// Protected routes
router.use(protect);

// Provider routes - specific routes first
router.post('/', restrictTo('provider', 'admin'), createService);
router.get('/provider/stats', restrictTo('provider'), getServiceStats);
router.get('/provider/my-services', restrictTo('provider'), getProviderServices);
router.get('/provider/:providerId', getProviderServices);
router.put('/:id', restrictTo('provider', 'admin'), updateService);
router.delete('/:id', restrictTo('provider', 'admin'), deleteService);
router.patch('/:id/toggle-availability', restrictTo('provider', 'admin'), toggleAvailability);

module.exports = router;
