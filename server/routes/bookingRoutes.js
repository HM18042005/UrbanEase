const express = require('express');
const {
  getUserBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
  getUpcomingBookings,
  getBookingHistory,
  rescheduleBooking,
  getAvailableSlots
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public route for checking available slots
router.get('/available-slots', getAvailableSlots);

// All other booking routes require authentication
router.use(protect);

// Booking management
router.get('/', getUserBookings);
router.get('/stats', getBookingStats);
router.get('/upcoming', getUpcomingBookings);
router.get('/history', getBookingHistory);
router.get('/:id', getBooking);
router.post('/', restrictTo('customer'), createBooking);
router.put('/:id/status', updateBookingStatus);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/reschedule', rescheduleBooking);

module.exports = router;
