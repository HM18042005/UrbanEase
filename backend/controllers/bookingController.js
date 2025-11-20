const Booking = require('../models/booking');
const Service = require('../models/service');
const User = require('../models/user');
const logger = require('../utils/logger');
const { parsePaginationParams, buildPageMetadata } = require('../utils/pagination');

// Get all bookings for a user (customer or provider)
exports.getUserBookings = async (req, res) => {
  try {
    const { status, role = 'customer', limit, page } = req.query;
    const pagination = parsePaginationParams({ page, limit, maxLimit: 50 });

    // Build filter based on user role
    const filter = {};
    if (role === 'customer') {
      filter.customer = req.user._id;
    } else if (role === 'provider') {
      filter.provider = req.user._id;
    }

    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service', 'title description price category')
      .sort({ createdAt: -1 })
      .limit(pagination.limit)
      .skip(pagination.skip);

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      bookings,
      pagination: {
        ...buildPageMetadata({ total, page: pagination.page, limit: pagination.limit }),
        totalBookings: total
      }
    });
  } catch (error) {
    logger.error('Get user bookings error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single booking by ID
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('provider', 'name email phone')
      .populate('service', 'title description price category');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user is involved in this booking
    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isProvider = booking.provider._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    logger.error('Get booking error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new booking (customers only)
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, date, address } = req.body;

    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Service ID and date are required'
      });
    }

    // Check if service exists
    const service = await Service.findById(serviceId).populate('provider');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Check if service has a provider
    if (!service.provider) {
      return res.status(400).json({ success: false, message: 'Service provider not found' });
    }

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Check if user is trying to book their own service
    if (service.provider._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book your own service'
      });
    }

    // Check if date is in the future
    const bookingDate = new Date(date);
    if (bookingDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Booking date must be in the future'
      });
    }

    const booking = new Booking({
      customer: req.user._id,
      provider: service.provider._id,
      service: serviceId,
      date: bookingDate,
      address: address || req.user.address
    });

    await booking.save();
    await booking.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'provider', select: 'name email phone' },
      { path: 'service', select: 'title description price category' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    logger.error('Create booking error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update booking status (provider or customer)
exports.updateBookingStatus = async (req, res) => {
  try {
    let { status } = req.body;
    // Normalize status to underscore variant
    if (status === 'in-progress') status = 'in_progress';
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isProvider = booking.provider.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Status update rules
    if (status === 'confirmed' && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only providers can confirm bookings'
      });
    }

    if (status === 'completed' && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only providers can mark bookings as completed'
      });
    }

    booking.status = status;
    await booking.save();
    await booking.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'provider', select: 'name email phone' },
      { path: 'service', select: 'title description price category' }
    ]);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    logger.error('Update booking status error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Cancel booking (customer or provider)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isProvider = booking.provider.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    logger.error('Cancel booking error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get booking statistics for dashboard
exports.getBookingStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { role = 'customer' } = req.query;

    const matchFilter = role === 'customer'
      ? { customer: userId }
      : { provider: userId };

    const stats = await Booking.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalBookings = await Booking.countDocuments(matchFilter);

    // Format stats
    const formattedStats = {
      total: totalBookings,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    // Get recent bookings
    const recentBookings = await Booking.find(matchFilter)
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'title price')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: formattedStats,
      recentBookings
    });
  } catch (error) {
    logger.error('Get booking stats error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get upcoming bookings
exports.getUpcomingBookings = async (req, res) => {
  try {
    const { role = 'customer', limit } = req.query;
    const pagination = parsePaginationParams({ page: 1, limit, maxLimit: 25 });

    const matchFilter = role === 'customer'
      ? { customer: req.user._id }
      : { provider: req.user._id };

    const upcomingBookings = await Booking.find({
      ...matchFilter,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service', 'title price category')
      .sort({ date: 1 })
      .limit(pagination.limit);

    res.json({
      success: true,
      upcomingBookings,
      meta: {
        requestedLimit: pagination.limit,
        count: upcomingBookings.length
      }
    });
  } catch (error) {
    logger.error('Get upcoming bookings error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get booking history
exports.getBookingHistory = async (req, res) => {
  try {
    const { role = 'customer', page, limit } = req.query;
    const pagination = parsePaginationParams({ page, limit, maxLimit: 50 });

    const matchFilter = role === 'customer'
      ? { customer: req.user._id }
      : { provider: req.user._id };

    const bookings = await Booking.find({
      ...matchFilter,
      status: { $in: ['completed', 'cancelled'] }
    })
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'title price category')
      .sort({ date: -1 })
      .limit(pagination.limit)
      .skip(pagination.skip);

    const total = await Booking.countDocuments({
      ...matchFilter,
      status: { $in: ['completed', 'cancelled'] }
    });

    res.json({
      success: true,
      bookings,
      pagination: {
        ...buildPageMetadata({ total, page: pagination.page, limit: pagination.limit }),
        totalBookings: total
      }
    });
  } catch (error) {
    logger.error('Get booking history error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reschedule booking
exports.rescheduleBooking = async (req, res) => {
  try {
    const { newDate } = req.body;

    if (!newDate) {
      return res.status(400).json({
        success: false,
        message: 'New date is required'
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isProvider = booking.provider.toString() === req.user._id.toString();

    if (!isCustomer && !isProvider) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this booking'
      });
    }

    const rescheduleDate = new Date(newDate);
    if (rescheduleDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'New date must be in the future'
      });
    }

    booking.date = rescheduleDate;
    booking.status = 'pending'; // Reset to pending for provider approval
    await booking.save();

    await booking.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'provider', select: 'name email phone' },
      { path: 'service', select: 'title price' }
    ]);

    res.json({
      success: true,
      message: 'Booking rescheduled successfully',
      booking
    });
  } catch (error) {
    logger.error('Reschedule booking error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get available time slots for a service
exports.getAvailableSlots = async (req, res) => {
  try {
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Service ID and date are required'
      });
    }

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Get existing bookings for this service on this date
    const existingBookings = await Booking.find({
      service: serviceId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Generate available time slots (9 AM to 6 PM, 1-hour slots)
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hour, 0, 0, 0);

      const isBooked = existingBookings.some(booking =>
        booking.date.getHours() === hour
      );

      if (!isBooked && slotTime > new Date()) {
        slots.push({
          time: slotTime,
          available: true
        });
      }
    }

    res.json({
      success: true,
      availableSlots: slots
    });
  } catch (error) {
    logger.error('Get available slots error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
