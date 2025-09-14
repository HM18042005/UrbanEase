const Service = require('../models/service');
const User = require('../models/user');
const Review = require('../models/review');

// Get all services with optional filtering
exports.getServices = async (req, res) => {
  try {
    const { category, provider, search, minPrice, maxPrice, sortBy, limit = 10, page = 1 } = req.query;
    
    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (provider) filter.provider = provider;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price-asc':
        sort.price = 1;
        break;
      case 'price-desc':
        sort.price = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
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
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single service by ID
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name email phone bio');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Get reviews for this service
    const reviews = await Review.find({ service: service._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    res.json({
      success: true,
      service: {
        ...service.toObject(),
        reviews,
        averageRating: avgRating.toFixed(1),
        totalReviews: reviews.length
      }
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new service (providers only)
exports.createService = async (req, res) => {
  try {
    const { title, description, price, category, duration, isAvailable } = req.body;

    if (!title || !price) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and price are required' 
      });
    }

    const service = new Service({
      title,
      description,
      price,
      category,
      duration,
      isAvailable: isAvailable !== undefined ? isAvailable : true, // Default to true (active)
      provider: req.user._id
    });

    await service.save();
    await service.populate('provider', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update service (provider only - own services)
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Check if user is the provider of this service
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this service' 
      });
    }

    const { title, description, price, category, duration, isAvailable } = req.body;
    
    if (title) service.title = title;
    if (description) service.description = description;
    if (price) service.price = price;
    if (category) service.category = category;
    if (duration) service.duration = duration;
    if (isAvailable !== undefined) service.isAvailable = isAvailable;

    await service.save();
    await service.populate('provider', 'name email phone');

    res.json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete service (provider only - own services)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Check if user is the provider of this service
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this service' 
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get services by provider
exports.getProviderServices = async (req, res) => {
  try {
    // If providerId is in params, use that; otherwise use current user
    const providerId = req.params.providerId || req.user._id;
    
    const services = await Service.find({ provider: providerId })
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Get provider services error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get service categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Service.distinct('category');
    res.json({
      success: true,
      categories: categories.filter(cat => cat) // Remove null/empty categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle service availability
exports.toggleAvailability = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Check if user is the provider of this service
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to modify this service' 
      });
    }

    service.isAvailable = !service.isAvailable;
    await service.save();

    res.json({ 
      success: true, 
      message: `Service ${service.isAvailable ? 'activated' : 'deactivated'}`,
      service 
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get service statistics for provider
exports.getServiceStats = async (req, res) => {
  try {
    const stats = await Service.aggregate([
      { $match: { provider: req.user._id } },
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          activeServices: { $sum: { $cond: ['$isAvailable', 1, 0] } },
          avgPrice: { $avg: '$price' },
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    // Get recent reviews for provider's services
    const recentReviews = await Review.find()
      .populate({
        path: 'service',
        match: { provider: req.user._id },
        select: 'title'
      })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const filteredReviews = recentReviews.filter(review => review.service);

    res.json({ 
      success: true, 
      stats: stats[0] || {
        totalServices: 0,
        activeServices: 0,
        avgPrice: 0,
        totalRevenue: 0
      },
      recentReviews: filteredReviews
    });
  } catch (error) {
    console.error('Get service stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Search services with advanced filters
exports.searchServices = async (req, res) => {
  try {
    const { 
      q, 
      category, 
      location, 
      minPrice, 
      maxPrice, 
      rating,
      sortBy = 'relevance',
      page = 1,
      limit = 12 
    } = req.query;

    const filter = {};
    
    // Text search
    if (q) {
      filter.$text = { $search: q };
    }
    
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    
    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      filter.averageRating = { $gte: Number(rating) };
    }

    // Sort options
    let sort = {};
    switch (sortBy) {
      case 'price-low':
        sort.price = 1;
        break;
      case 'price-high':
        sort.price = -1;
        break;
      case 'rating':
        sort.averageRating = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'relevance':
      default:
        if (q) {
          sort.score = { $meta: 'textScore' };
        } else {
          sort.createdAt = -1;
        }
    }

    const services = await Service.find(filter)
      .populate('provider', 'name email profilePicture')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(filter);

    res.json({
      success: true,
      services,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalServices: total
      }
    });
  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get featured services
exports.getFeaturedServices = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    // First try to get services that are featured with high ratings
    let services = await Service.find({ 
      isAvailable: true,
      averageRating: { $gte: 4.0 } // Services with rating 4.0 or higher
    })
      .populate('provider', 'name profilePicture')
      .sort({ averageRating: -1, totalBookings: -1 })
      .limit(Number(limit));

    // If no highly rated services found, fallback to just available services
    if (services.length === 0) {
      services = await Service.find({ 
        isAvailable: true
      })
        .populate('provider', 'name profilePicture')
        .sort({ createdAt: -1 }) // Show newest services first
        .limit(Number(limit));
    }

    res.json({ success: true, services });
  } catch (error) {
    console.error('Get featured services error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get popular services
exports.getPopularServices = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const services = await Service.find({ isAvailable: true })
      .populate('provider', 'name profilePicture')
      .sort({ averageRating: -1, totalBookings: -1 })
      .limit(Number(limit));

    res.json({ success: true, services });
  } catch (error) {
    console.error('Get popular services error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
