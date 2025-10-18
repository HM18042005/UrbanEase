const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes - specific routes first
router.get('/search', userController.searchUsers);
router.get('/providers', userController.getProviders);

// Protected routes (require authentication)
router.use(protect);

// User dashboard and profile management - specific routes first
router.get('/me/dashboard', userController.getDashboard);
router.get('/me/stats', userController.getUserStats);
router.get('/me/notifications', userController.getNotifications);
router.put('/me/profile', userController.updateProfile);

// Generic routes last
router.get('/:id', userController.getUserProfile);

module.exports = router;