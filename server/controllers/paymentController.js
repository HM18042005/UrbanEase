const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Booking = require('../models/booking');
const Service = require('../models/service');

// Create payment order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('service')
      .populate('customer')
      .populate('provider');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to pay for this booking
    if (booking.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking'
      });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid'
      });
    }

    const amount = booking.service.price * 100; // Convert to paise (Razorpay requires amount in paise)
    
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
      payment_capture: 1, // Auto capture payment in test mode
      notes: {
        bookingId: bookingId,
        customerId: booking.customer._id.toString(),
        providerId: booking.provider._id.toString(),
        serviceId: booking.service._id.toString(),
        environment: 'test'
      }
    };

    const order = await razorpay.orders.create(options);

    // Update booking with payment order ID
    booking.paymentOrderId = order.id;
    booking.paymentStatus = 'pending';
    await booking.save();

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      booking: {
        id: booking._id,
        serviceName: booking.service.title,
        providerName: booking.provider.name,
        amount: booking.service.price,
        date: booking.date
      }
    });

  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
};

// Verify payment signature
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Create signature for verification
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update booking with payment details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.paymentId = razorpay_payment_id;
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed'; // Auto-confirm booking after successful payment
    booking.paidAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      booking: {
        id: booking._id,
        paymentStatus: booking.paymentStatus,
        status: booking.status
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};

// Handle payment failure
exports.handlePaymentFailure = async (req, res) => {
  try {
    const { bookingId, error } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.paymentStatus = 'failed';
    booking.paymentError = error.description || 'Payment failed';
    await booking.save();

    res.json({
      success: true,
      message: 'Payment failure recorded'
    });

  } catch (error) {
    console.error('Handle payment failure error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle payment failure'
    });
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('service', 'title price')
      .populate('customer', 'name email')
      .populate('provider', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized
    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isProvider = booking.provider._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view payment details'
      });
    }

    res.json({
      success: true,
      payment: {
        bookingId: booking._id,
        paymentId: booking.paymentId,
        paymentOrderId: booking.paymentOrderId,
        paymentStatus: booking.paymentStatus,
        amount: booking.service.price,
        paidAt: booking.paidAt,
        paymentError: booking.paymentError
      }
    });

  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment details'
    });
  }
};

// Refund payment (admin only)
exports.refundPayment = async (req, res) => {
  try {
    const { bookingId, amount, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund unpaid booking'
      });
    }

    // Create refund through Razorpay
    const refundAmount = amount ? amount * 100 : undefined; // Convert to paise
    const refund = await razorpay.payments.refund(booking.paymentId, {
      amount: refundAmount,
      notes: {
        bookingId: bookingId,
        reason: reason || 'Refund requested'
      }
    });

    // Update booking
    booking.paymentStatus = 'refunded';
    booking.refundId = refund.id;
    booking.refundAmount = refund.amount / 100; // Convert back to rupees
    booking.refundReason = reason;
    booking.refundedAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });

  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Refund processing failed'
    });
  }
};
