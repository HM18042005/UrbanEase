const Message = require('../models/message');
const User = require('../models/user');
const Booking = require('../models/booking');

// Get conversations (list of users with whom current user has exchanged messages)
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', userId] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$message' },
          lastMessageDate: { $first: '$createdAt' },
          senderId: { $first: '$senderId' },
          receiverId: { $first: '$receiverId' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          lastMessageDate: 1,
          otherUser: {
            _id: '$otherUser._id',
            name: '$otherUser.name',
            email: '$otherUser.email',
            role: '$otherUser.role'
          }
        }
      },
      {
        $sort: { lastMessageDate: -1 }
      }
    ]);

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get conversations based on booking relationships (customers can only contact providers they've booked)
exports.getBookingBasedConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

  let conversations = [];

  if (userRole === 'customer') {
      // For customers: get providers they have bookings with
      const bookings = await Booking.find({ customer: userId })
        .populate('provider', '_id name email role')
        .populate('service', 'title')
        .select('provider service status createdAt');

      // Get unique providers from bookings
      const providerMap = new Map();
      bookings.forEach(booking => {
        if (booking.provider && !providerMap.has(booking.provider._id.toString())) {
          providerMap.set(booking.provider._id.toString(), {
            _id: booking.provider._id,
            name: booking.provider.name,
            email: booking.provider.email,
            role: booking.provider.role,
            lastBooking: booking.service.title,
            lastBookingDate: booking.createdAt
          });
        }
      });

      // Get last message with each provider
      for (const [providerId, providerInfo] of providerMap) {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: providerId },
            { senderId: providerId, receiverId: userId }
          ]
        })
        .sort({ createdAt: -1 })
        .select('message createdAt senderId receiverId');

        // Count unread messages from provider to this customer
        const unreadCount = await Message.countDocuments({
          senderId: providerId,
          receiverId: userId,
          status: { $ne: 'read' }
        });

        conversations.push({
          _id: providerId,
          participant: providerInfo,
          lastMessage: lastMessage?.message || '',
          lastMessageTime: lastMessage?.createdAt || providerInfo.lastBookingDate,
          unreadCount,
          conversationType: 'booking-based'
        });
      }

    } else if (userRole === 'provider') {
      // For providers: get customers who have booked their services
      const bookings = await Booking.find({ provider: userId })
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

      // Get last message with each customer
      for (const [customerId, customerInfo] of customerMap) {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: customerId },
            { senderId: customerId, receiverId: userId }
          ]
        })
        .sort({ createdAt: -1 })
        .select('message createdAt senderId receiverId');

        // Count unread messages from customer to this provider
        const unreadCount = await Message.countDocuments({
          senderId: customerId,
          receiverId: userId,
          status: { $ne: 'read' }
        });

        conversations.push({
          _id: customerId,
          participant: customerInfo,
          lastMessage: lastMessage?.message || '',
          lastMessageTime: lastMessage?.createdAt || customerInfo.lastBookingDate,
          unreadCount,
          conversationType: 'booking-based'
        });
      }
    }

    // Sort conversations by last message time
    conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get booking-based conversations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get messages between current user and another user
exports.getConversationMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, page = 1 } = req.query;
    const currentUserId = req.user._id;

    // Check if the other user exists
  const otherUser = await User.findById(userId).select('name email role');
    if (!otherUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    })
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Message.countDocuments({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    });

    // Reverse messages to show oldest first
    messages.reverse();

    res.json({
      success: true,
      messages,
      otherUser,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalMessages: total,
        hasNextPage: page < Math.ceil(total / Number(limit)),
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
  const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Receiver ID and content are required' 
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message content cannot be empty' 
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }

    // Check if user is trying to send message to themselves
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot send message to yourself' 
      });
    }

    const message = new Message({
      senderId: req.user._id,
      receiverId,
      message: String(content).trim(),
      conversationId: Message.generateConversationId(req.user._id, receiverId),
      timestamp: new Date(),
      status: 'sent'
    });

    await message.save();
    await message.populate([
      { path: 'senderId', select: 'name email role' },
      { path: 'receiverId', select: 'name email role' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a message (sender only)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this message' 
      });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Mark messages as read (for future implementation)
exports.markAsRead = async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user._id;

    if (!senderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sender ID is required' 
      });
    }

    const result = await Message.updateMany(
      {
        senderId,
        receiverId,
        status: { $ne: 'read' }
      },
      { $set: { status: 'read' } }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get unread message count (for future implementation)
exports.getUnreadCount = async (req, res) => {
  try {
    // This would require adding a 'read' field to the Message schema
    // For now, return 0
    res.json({
      success: true,
      unreadCount: 0
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Search messages
exports.searchMessages = async (req, res) => {
  try {
  const { query, userId } = req.query;
    const currentUserId = req.user._id;

    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    const filter = {
      message: { $regex: query, $options: 'i' },
      $or: [
        { senderId: currentUserId },
        { receiverId: currentUserId }
      ]
    };

    // If userId is provided, search within that conversation only
    if (userId) {
      filter.$or = [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ];
    }

    const messages = await Message.find(filter)
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      messages,
      searchQuery: query
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
