const express = require('express');
const {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentDetails,
  refundPayment
} = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Payment management
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/failure', handlePaymentFailure);
router.get('/:bookingId', getPaymentDetails);

// Admin only routes
router.post('/refund', restrictTo('admin'), refundPayment);

module.exports = router;
