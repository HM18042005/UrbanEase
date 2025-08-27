const User = require('../models/user');
const Service = require('../models/service');
const Booking = require('../models/booking');
const Review = require('../models/review');

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { query, role, page = 1, limit = 10 } = req.query;

    const filter = {};
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all service providers
exports.getProviders = async (req, res) => {
  try {
    const { category, location, rating, page = 1, limit = 12 } = req.query;

    const filter = { role: 'provider', isActive: true };
    
    // Get providers and their service stats
    let providers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Enrich with service data
    const enrichedProviders = await Promise.all(
      providers.map(async (provider) => {
        // Get provider's services
        const services = await Service.find({ provider: provider._id, isAvailable: true });
        
        // Calculate average rating from reviews
        const serviceIds = services.map(s => s._id);
        const reviews = await Review.find({ service: { $in: serviceIds } });
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;

        // Filter by category if specified
        if (category) {
          const hasCategory = services.some(service => 
            service.category.toLowerCase().includes(category.toLowerCase())
          );
          if (!hasCategory) return null;
        }

        // Filter by location if specified
        if (location && provider.city) {
          if (!provider.city.toLowerCase().includes(location.toLowerCase())) {
            return null;
          }
        }

        // Filter by rating if specified
        if (rating && avgRating < Number(rating)) {
          return null;
        }

        return {
          ...provider.toObject(),
          totalServices: services.length,
          averageRating: Number(avgRating.toFixed(1)),
          totalReviews: reviews.length,
          categories: [...new Set(services.map(s => s.category))]
        };
      })
    );

    // Filter out null results and apply pagination
    const validProviders = enrichedProviders.filter(p => p !== null);
    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      providers: validProviders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalProviders: validProviders.length
      }
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If it's a provider, get their services and stats
    let userProfile = user.toObject();
    
    if (user.role === 'provider') {
      const services = await Service.find({ provider: user._id });
      const bookings = await Booking.find({ provider: user._id });
      
      // Get reviews for provider's services
      const serviceIds = services.map(s => s._id);
      const reviews = await Review.find({ service: { $in: serviceIds } })
        .populate('user', 'name')
        .populate('service', 'title')
        .sort({ createdAt: -1 })
        .limit(10);

      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      userProfile = {
        ...userProfile,
        services: services.length,
        totalBookings: bookings.length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        averageRating: Number(avgRating.toFixed(1)),
        totalReviews: reviews.length,
        recentReviews: reviews.slice(0, 5),
        serviceCategories: [...new Set(services.map(s => s.category))]
      };
    } else if (user.role === 'customer') {
      const bookings = await Booking.find({ customer: user._id });
      const reviews = await Review.find({ user: user._id })
        .populate('service', 'title')
        .sort({ createdAt: -1 })
        .limit(5);

      userProfile = {
        ...userProfile,
        totalBookings: bookings.length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        totalReviews: reviews.length,
        recentReviews: reviews
      };
    }

    res.json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user statistics (for current user)
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'provider') {
      // Provider statistics
      const services = await Service.find({ provider: userId });
      const bookings = await Booking.find({ provider: userId });
      const serviceIds = services.map(s => s._id);
      const reviews = await Review.find({ service: { $in: serviceIds } });

      // Revenue calculation
      const completedBookings = bookings.filter(b => b.status === 'completed');
      const revenue = await Promise.all(
        completedBookings.map(async (booking) => {
          const service = await Service.findById(booking.service);
          return service ? service.price : 0;
        })
      );
      const totalRevenue = revenue.reduce((sum, price) => sum + price, 0);

      stats = {
        totalServices: services.length,
        activeServices: services.filter(s => s.isAvailable).length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
        completedBookings: completedBookings.length,
        totalRevenue,
        averageRating: reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0,
        totalReviews: reviews.length
      };
    } else if (userRole === 'customer') {
      // Customer statistics
      const bookings = await Booking.find({ customer: userId });
      const reviews = await Review.find({ user: userId });

      // Total spent calculation
      const completedBookings = bookings.filter(b => b.status === 'completed');
      const spending = await Promise.all(
        completedBookings.map(async (booking) => {
          const service = await Service.findById(booking.service);
          return service ? service.price : 0;
        })
      );
      const totalSpent = spending.reduce((sum, price) => sum + price, 0);

      stats = {
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
        completedBookings: completedBookings.length,
        cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
        totalSpent,
        totalReviews: reviews.length,
        averageRatingGiven: reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0
      };
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update user profile (for current user)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateFields = req.body;

    // Remove sensitive fields that shouldn't be updated through this endpoint
    delete updateFields.password;
    delete updateFields.role;
    delete updateFields.email; // Email updates should go through a separate verification process

    const user = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let dashboardData = {};

    if (userRole === 'provider') {
      // Provider dashboard
      const services = await Service.find({ provider: userId }).limit(5);
      const recentBookings = await Booking.find({ provider: userId })
        .populate('customer', 'name email')
        .populate('service', 'title')
        .sort({ createdAt: -1 })
        .limit(5);

      const serviceIds = services.map(s => s._id);
      const recentReviews = await Review.find({ service: { $in: serviceIds } })
        .populate('user', 'name')
        .populate('service', 'title')
        .sort({ createdAt: -1 })
        .limit(5);

      dashboardData = {
        services,
        recentBookings,
        recentReviews,
        upcomingBookings: await Booking.find({
          provider: userId,
          date: { $gte: new Date() },
          status: { $in: ['pending', 'confirmed'] }
        })
          .populate('customer', 'name')
          .populate('service', 'title')
          .sort({ date: 1 })
          .limit(5)
      };
    } else if (userRole === 'customer') {
      // Customer dashboard
      const recentBookings = await Booking.find({ customer: userId })
        .populate('provider', 'name')
        .populate('service', 'title price')
        .sort({ createdAt: -1 })
        .limit(5);

      const myReviews = await Review.find({ user: userId })
        .populate('service', 'title')
        .sort({ createdAt: -1 })
        .limit(5);

      dashboardData = {
        recentBookings,
        myReviews,
        upcomingBookings: await Booking.find({
          customer: userId,
          date: { $gte: new Date() },
          status: { $in: ['pending', 'confirmed'] }
        })
          .populate('provider', 'name')
          .populate('service', 'title')
          .sort({ date: 1 })
          .limit(5)
      };
    }

    res.json({
      success: true,
      dashboard: dashboardData
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user notifications (placeholder for future implementation)
exports.getNotifications = async (req, res) => {
  try {
    // This is a placeholder for notification system
    // In a real app, you'd have a notifications collection
    const notifications = [
      {
        id: 1,
        title: 'New booking request',
        message: 'You have a new booking request',
        type: 'booking',
        read: false,
        createdAt: new Date()
      }
    ];

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
