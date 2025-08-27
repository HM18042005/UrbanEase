const Message = require('../models/message');
const User = require('../models/user');

// Get conversations (list of users with whom current user has exchanged messages)
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId }
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
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$content' },
          lastMessageDate: { $first: '$createdAt' },
          sender: { $first: '$sender' },
          receiver: { $first: '$receiver' }
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
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Message.countDocuments({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
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
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim()
    });

    await message.save();
    await message.populate([
      { path: 'sender', select: 'name email role' },
      { path: 'receiver', select: 'name email role' }
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

    if (!senderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sender ID is required' 
      });
    }

    // This would require adding a 'read' field to the Message schema
    // For now, just return success
    res.json({
      success: true,
      message: 'Messages marked as read'
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
      content: { $regex: query, $options: 'i' },
      $or: [
        { sender: currentUserId },
        { receiver: currentUserId }
      ]
    };

    // If userId is provided, search within that conversation only
    if (userId) {
      filter.$or = [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ];
    }

    const messages = await Message.find(filter)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
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
