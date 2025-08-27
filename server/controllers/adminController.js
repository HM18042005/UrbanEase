const User = require('../models/user');
const Service = require('../models/service');
const Booking = require('../models/booking');
const Review = require('../models/review');
const Message = require('../models/message');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalReviews = await Review.countDocuments();

    // User role breakdown
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Booking status breakdown
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue calculation (completed bookings)
    const revenueData = await Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'serviceData'
        }
      },
      { $unwind: '$serviceData' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$serviceData.price' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent activity
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentBookings = await Booking.find()
      .populate('customer', 'name email')
      .populate('service', 'title price')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly trends
    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const monthlyUsers = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      stats: {
        totals: {
          users: totalUsers,
          services: totalServices,
          bookings: totalBookings,
          reviews: totalReviews,
          revenue: revenueData[0]?.totalRevenue || 0,
          completedBookings: revenueData[0]?.count || 0
        },
        breakdowns: {
          usersByRole: usersByRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        trends: {
          monthlyBookings,
          monthlyUsers
        },
        recent: {
          users: recentUsers,
          bookings: recentBookings
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all users with filtering
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, sortBy = 'newest', limit = 20, page = 1 } = req.query;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'name':
        sort.name = 1;
        break;
      default:
        sort.createdAt = -1;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalUsers: total,
        hasNextPage: page < Math.ceil(total / Number(limit)),
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all services with filtering
exports.getAllServices = async (req, res) => {
  try {
    const { category, search, sortBy = 'newest', limit = 20, page = 1 } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'price-asc':
        sort.price = 1;
        break;
      case 'price-desc':
        sort.price = -1;
        break;
      default:
        sort.createdAt = -1;
    }

    const services = await Service.find(filter)
      .populate('provider', 'name email phone')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Service.countDocuments(filter);

    res.json({
      success: true,
      services,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalServices: total,
        hasNextPage: page < Math.ceil(total / Number(limit)),
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all bookings with filtering
exports.getAllBookings = async (req, res) => {
  try {
    const { status, search, sortBy = 'newest', limit = 20, page = 1 } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'date-asc':
        sort.date = 1;
        break;
      case 'date-desc':
        sort.date = -1;
        break;
      default:
        sort.createdAt = -1;
    }

    let query = Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service', 'title price category');

    // Add search after population
    if (search) {
      const bookings = await query.exec();
      const filteredBookings = bookings.filter(booking => 
        booking.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        booking.provider?.name?.toLowerCase().includes(search.toLowerCase()) ||
        booking.service?.title?.toLowerCase().includes(search.toLowerCase())
      );
      
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

      return res.json({
        success: true,
        bookings: paginatedBookings,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(filteredBookings.length / Number(limit)),
          totalBookings: filteredBookings.length,
          hasNextPage: endIndex < filteredBookings.length,
          hasPreviousPage: page > 1
        }
      });
    }

    const bookings = await query
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalBookings: total,
        hasNextPage: page < Math.ceil(total / Number(limit)),
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, phone, address, city, state, zipCode } = req.body;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }
      user.email = email;
    }
    if (role) user.role = role;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (city) user.city = city;
    if (state) user.state = state;
    if (zipCode) user.zipCode = zipCode;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Don't allow deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete the last admin user' 
        });
      }
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete service (admin only)
exports.deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    await Service.findByIdAndDelete(serviceId);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get system reports
exports.getReports = async (req, res) => {
  try {
    const { type = 'summary', startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let report = {};

    switch (type) {
      case 'revenue':
        report = await Booking.aggregate([
          { $match: { status: 'completed', ...dateFilter } },
          {
            $lookup: {
              from: 'services',
              localField: 'service',
              foreignField: '_id',
              as: 'serviceData'
            }
          },
          { $unwind: '$serviceData' },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              revenue: { $sum: '$serviceData.price' },
              bookings: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        break;

      case 'popular-services':
        report = await Booking.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: '$service',
              bookings: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: 'services',
              localField: '_id',
              foreignField: '_id',
              as: 'serviceData'
            }
          },
          { $unwind: '$serviceData' },
          {
            $project: {
              title: '$serviceData.title',
              category: '$serviceData.category',
              bookings: 1
            }
          },
          { $sort: { bookings: -1 } },
          { $limit: 10 }
        ]);
        break;

      default:
        // Summary report
        const userGrowth = await User.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              users: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const serviceGrowth = await Service.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              services: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        report = {
          userGrowth,
          serviceGrowth
        };
    }

    res.json({
      success: true,
      report,
      type,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
