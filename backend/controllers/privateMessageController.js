const Message = require('../models/message');
const User = require('../models/user');
const Booking = require('../models/booking');
const { generateRoomId } = require('../socket/privateMessagingHandler');

// Get conversation history between two users
exports.getConversationHistory = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;

    // Verify that these users have a booking relationship
    const hasBookingRelationship = await Booking.findOne({
      $or: [
        { customer: currentUserId, provider: otherUserId },
        { customer: otherUserId, provider: currentUserId }
      ]
    });

    if (!hasBookingRelationship) {
      return res.status(403).json({
        message: 'Cannot access conversation. No booking relationship exists.'
      });
    }

    // Get messages between these two users
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'name email avatar')
    .sort({ timestamp: 1 })
    .limit(100); // Limit to last 100 messages

    // Generate conversation ID for consistency
    const conversationId = generateRoomId(currentUserId, otherUserId);

    // Mark messages as read (messages sent to current user)
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: currentUserId,
        status: { $ne: 'read' }
      },
      { status: 'read' }
    );

    res.json({
      conversationId,
      messages: messages.map(msg => ({
        _id: msg._id,
        senderId: {
          _id: msg.sender._id,
          name: msg.sender.name,
          email: msg.sender.email,
          avatar: msg.sender.avatar
        },
        receiverId: msg.receiver,
        message: msg.content,
        timestamp: msg.timestamp,
        status: msg.status
      }))
    });

  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ message: 'Failed to fetch conversation history' });
  }
};

// Send a message (for REST API, but Socket.IO is preferred)
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    // Verify booking relationship
    const hasBookingRelationship = await Booking.findOne({
      $or: [
        { customer: senderId, provider: receiverId },
        { customer: receiverId, provider: senderId }
      ]
    });

    if (!hasBookingRelationship) {
      return res.status(403).json({
        message: 'Cannot send message. No booking relationship exists.'
      });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content: message,
      timestamp: new Date(),
      conversationId: generateRoomId(senderId, receiverId)
    });

    const savedMessage = await newMessage.save();
    await savedMessage.populate('sender', 'name email avatar');

    res.json({
      message: 'Message sent successfully',
      data: {
        _id: savedMessage._id,
        senderId: savedMessage.sender,
        receiverId: savedMessage.receiver,
        message: savedMessage.content,
        timestamp: savedMessage.timestamp
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const unreadCount = await Message.countDocuments({
      receiver: userId,
      status: { $ne: 'read' }
    });

    res.json({ unreadCount });

  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
};

module.exports = exports;