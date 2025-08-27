const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  getAllServices,
  getAllBookings,
  updateUser,
  deleteUser,
  deleteService,
  getReports
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard and statistics
router.get('/dashboard', getDashboardStats);
router.get('/reports', getReports);

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Service management
router.get('/services', getAllServices);
router.delete('/services/:serviceId', deleteService);

// Booking management
router.get('/bookings', getAllBookings);

module.exports = router;
