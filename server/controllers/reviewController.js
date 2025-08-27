const Review = require('../models/review');
const Service = require('../models/service');
const Booking = require('../models/booking');

// Get reviews for a service
exports.getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { limit = 10, page = 1, sortBy = 'newest' } = req.query;

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'rating-high':
        sort.rating = -1;
        break;
      case 'rating-low':
        sort.rating = 1;
        break;
      default:
        sort.createdAt = -1;
    }

    const reviews = await Review.find({ service: serviceId })
      .populate('user', 'name')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Review.countDocuments({ service: serviceId });

    // Calculate rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { service: mongoose.Types.ObjectId(serviceId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    const ratingDistribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    ratingStats.forEach(stat => {
      ratingDistribution[stat._id] = stat.count;
    });

    // Calculate average rating
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalReviews: total,
        hasNextPage: page < Math.ceil(total / Number(limit)),
        hasPreviousPage: page > 1
      },
      stats: {
        averageRating: avgRating.toFixed(1),
        totalReviews: total,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Get service reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get reviews by user
exports.getUserReviews = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const reviews = await Review.find({ user: req.user._id })
      .populate('service', 'title description provider')
      .populate({
        path: 'service',
        populate: {
          path: 'provider',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Review.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalReviews: total,
        hasNextPage: page < Math.ceil(total / Number(limit)),
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new review
exports.createReview = async (req, res) => {
  try {
    const { serviceId, rating, comment } = req.body;

    if (!serviceId || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Service ID and rating are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Check if user has completed booking for this service
    const completedBooking = await Booking.findOne({
      customer: req.user._id,
      service: serviceId,
      status: 'completed'
    });

    if (!completedBooking) {
      return res.status(400).json({ 
        success: false, 
        message: 'You can only review services you have used' 
      });
    }

    // Check if user already reviewed this service
    const existingReview = await Review.findOne({
      user: req.user._id,
      service: serviceId
    });

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this service' 
      });
    }

    const review = new Review({
      user: req.user._id,
      service: serviceId,
      rating,
      comment
    });

    await review.save();
    await review.populate('user', 'name');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update review (user can update their own review)
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this review' 
      });
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Rating must be between 1 and 5' 
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) review.comment = comment;

    await review.save();
    await review.populate('user', 'name');

    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete review (user can delete their own review)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this review' 
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get reviews for provider's services
exports.getProviderReviews = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    // Get all services by this provider
    const providerServices = await Service.find({ provider: req.user._id }).select('_id');
    const serviceIds = providerServices.map(service => service._id);

    const reviews = await Review.find({ service: { $in: serviceIds } })
      .populate('user', 'name')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Review.countDocuments({ service: { $in: serviceIds } });

    // Calculate average rating for all provider services
    const allReviews = await Review.find({ service: { $in: serviceIds } });
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
      : 0;

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalReviews: total,
        hasNextPage: page < Math.ceil(total / Number(limit)),
        hasPreviousPage: page > 1
      },
      stats: {
        averageRating: avgRating.toFixed(1),
        totalReviews: total
      }
    });
  } catch (error) {
    console.error('Get provider reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
