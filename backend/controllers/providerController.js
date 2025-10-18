const Service = require('../models/service');
const Booking = require('../models/booking');
const Message = require('../models/message');
const Review = require('../models/review');
const User = require('../models/user');

// Dashboard Controller
exports.getDashboard = async (req, res) => {
  try {
    const providerId = req.user.id;

    // Get basic stats
    const [totalServices, activeBookings, totalEarnings, avgRating] = await Promise.all([
      Service.countDocuments({ provider: providerId }),
      // Treat in-progress consistently with DB enum 'in_progress'
      Booking.countDocuments({ provider: providerId, status: { $in: ['confirmed', 'in_progress'] } }),
      Booking.aggregate([
        { $match: { provider: providerId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Review.aggregate([
        { $match: { provider: providerId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    // Get recent bookings
    const recentBookings = await Booking.find({ provider: providerId })
      .populate('customer', 'name email')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent reviews
    const recentReviews = await Review.find({ provider: providerId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    res.json({
      stats: {
        totalServices,
        activeBookings,
        totalEarnings: totalEarnings[0]?.total || 0,
        avgRating: avgRating[0]?.avgRating || 0,
      },
      recentBookings,
      recentReviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get earnings over time
    const earnings = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          earnings: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ earnings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};

// Service Management Controllers
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.id });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch services', error: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const serviceData = { ...req.body, provider: req.user.id };
    const service = await Service.create(serviceData);
    res.status(201).json({ service });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create service', error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, provider: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ service });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update service', error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      provider: req.user.id
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete service', error: error.message });
  }
};

exports.toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      provider: req.user.id
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.isAvailable = !service.isAvailable;
    await service.save();

    res.json({ service });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle service status', error: error.message });
  }
};

// Message Controllers
exports.getMessages = async (req, res) => {
  try {
    // Get conversations based on actual booking relationships
    const bookings = await Booking.find({ provider: req.user.id })
      .populate('customer', '_id name email role')
      .populate('service', 'title')
      .select('customer service status createdAt');

    // Get unique customers from bookings
    const customerMap = new Map();
    bookings.forEach(booking => {
      if (booking.customer && !customerMap.has(booking.customer._id.toString())) {
        customerMap.set(booking.customer._id.toString(), {
          _id: booking.customer._id,
          name: booking.customer.name,
          email: booking.customer.email,
          role: booking.customer.role,
          lastBooking: booking.service.title,
          lastBookingDate: booking.createdAt
        });
      }
    });

    const conversations = [];

    // Get last message with each customer
    for (const [customerIdKey, customerInfo] of customerMap) {
      const customerId = customerIdKey; // Ensure we have the string ID
      console.log('Processing customer:', { customerIdKey, customerId, customerInfo });

      const lastMessage = await Message.findOne({
        $or: [
          { senderId: req.user.id, receiverId: customerId },
          { senderId: customerId, receiverId: req.user.id }
        ]
      })
        .sort({ createdAt: -1 })
        .select('message createdAt senderId receiverId');

      // Count unread messages from this customer
      const unreadCount = await Message.countDocuments({
        senderId: customerId,
        receiverId: req.user.id,
        status: { $ne: 'read' }
      });

      const conversationId = `conv_${[req.user.id.toString(), customerId.toString()].sort().join('_')}`;

      const conversationData = {
        _id: customerId.toString(), // Ensure it's a string
        id: customerId.toString(), // Add id for compatibility
        conversationId: conversationId, // Add conversation ID for ChatWindow
        participant: {
          _id: customerId.toString(), // Ensure it's a string
          id: customerId.toString(),
          name: customerInfo.name,
          email: customerInfo.email,
          role: customerInfo.role,
          avatar: '/default-avatar.png' // Add default avatar
        },
        lastMessage: lastMessage?.message || '',
        lastMessageDate: lastMessage?.createdAt || customerInfo.lastBookingDate,
        lastMessageTime: lastMessage?.createdAt || customerInfo.lastBookingDate,
        unreadCount,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerAvatar: customerInfo.name.charAt(0).toUpperCase(),
        conversationType: 'booking-based',
        service: 'Service' // Add a default service label
      };

      console.log('Final conversationData:', JSON.stringify(conversationData, null, 2));
      conversations.push(conversationData);
    }

    // Sort conversations by last message time
    conversations.sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));

    res.json({ conversations });
  } catch (error) {
    console.error('Provider getMessages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const providerId = req.user.id;
    const messages = await Message.find({
      $or: [
        { senderId: providerId, receiverId: customerId },
        { senderId: customerId, receiverId: providerId }
      ]
    }).sort({ timestamp: 1 });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversation', error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { customerId, content } = req.body;
    if (!customerId || !content) return res.status(400).json({ message: 'customerId and content are required' });
    const conversationId = Message.generateConversationId(req.user.id, customerId);
    const message = await Message.create({
      senderId: req.user.id,
      receiverId: customerId,
      message: String(content).trim(),
      conversationId,
      status: 'sent',
      timestamp: new Date()
    });

    res.status(201).json({ message });
  } catch (error) {
    res.status(400).json({ message: 'Failed to send message', error: error.message });
  }
};

exports.markMessagesRead = async (req, res) => {
  try {
    await Message.updateMany(
      {
        receiverId: req.user.id,
        senderId: req.params.customerId,
        status: { $ne: 'read' }
      },
      { status: 'read' }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark messages as read', error: error.message });
  }
};

// Schedule and Booking Controllers
exports.getSchedule = async (req, res) => {
  try {
    const { date, view = 'day' } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    // Get bookings for the specified date/period
    let startDate = new Date(targetDate);
    let endDate = new Date(targetDate);

    if (view === 'week') {
      startDate.setDate(targetDate.getDate() - targetDate.getDay());
      endDate.setDate(startDate.getDate() + 6);
    } else if (view === 'month') {
      startDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + 1, 0);
    }

    endDate.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      provider: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    })
      .populate('customer', 'name email phone')
      .populate('service', 'title duration price')
      .sort({ date: 1 });

    // Format bookings for frontend consumption
    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      date: booking.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      time: booking.date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      customerName: booking.customer?.name || 'Unknown Customer',
      customerEmail: booking.customer?.email,
      customerPhone: booking.customer?.phone,
      service: booking.service?.title || 'Unknown Service',
      duration: booking.service?.duration ? `${booking.service.duration} minutes` : 'N/A',
      price: booking.service?.price,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      address: booking.address
    }));

    res.json({ bookings: formattedBookings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch schedule', error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const query = { provider: req.user.id };

    if (status) {
      // Normalize incoming status filter (handle 'in-progress' from UI)
      query.status = status === 'in-progress' ? 'in_progress' : status;
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('service', 'title duration price')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({ bookings, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    let { status } = req.body;
    // Normalize status values to match DB enum
    if (status === 'in-progress') status = 'in_progress';
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, provider: req.user.id },
      { status },
      { new: true, runValidators: true }
    ).populate('customer', 'name email').populate('service', 'title');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update booking status', error: error.message });
  }
};

// Reports Controllers
exports.getReports = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { period = '30d' } = req.query;

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [earningsData, bookingsData, ratingsData] = await Promise.all([
      // Earnings summary
      Booking.aggregate([
        {
          $match: {
            provider: providerId,
            status: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$totalAmount' },
            completedBookings: { $sum: 1 },
            avgBookingValue: { $avg: '$totalAmount' }
          }
        }
      ]),

      // Booking status distribution
      Booking.aggregate([
        { $match: { provider: providerId, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Ratings summary
      Review.aggregate([
        { $match: { provider: providerId, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      earnings: earningsData[0] || { totalEarnings: 0, completedBookings: 0, avgBookingValue: 0 },
      bookingStatus: bookingsData,
      ratings: ratingsData[0] || { avgRating: 0, totalReviews: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
};

exports.getEarningsReport = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { period = '30d' } = req.query;

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const earnings = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          earnings: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ earnings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch earnings report', error: error.message });
  }
};

exports.getPerformanceReport = async (req, res) => {
  try {
    const providerId = req.user.id;

    const performance = await Service.aggregate([
      { $match: { provider: providerId } },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'service',
          as: 'bookings'
        }
      },
      {
        $project: {
          title: 1,
          totalBookings: { $size: '$bookings' },
          completedBookings: {
            $size: {
              $filter: {
                input: '$bookings',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          }
        }
      }
    ]);

    res.json({ performance });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch performance report', error: error.message });
  }
};

exports.getCustomerReport = async (req, res) => {
  try {
    const providerId = req.user.id;

    const customers = await Booking.aggregate([
      { $match: { provider: providerId } },
      {
        $group: {
          _id: '$customer',
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastBooking: { $max: '$createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 20 }
    ]);

    await Booking.populate(customers, { path: '_id', select: 'name email' });

    res.json({ customers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customer report', error: error.message });
  }
};
