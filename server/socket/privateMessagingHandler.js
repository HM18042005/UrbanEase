const Message = require('../models/message');
const User = require('../models/user');

// Store online users mapping: userId -> socketId
const onlineUsers = new Map();

// Helper function to generate consistent room names
const generateRoomId = (userId1, userId2) => {
  return `room_${[userId1, userId2].sort().join('_')}`;
};

// DEPRECATED: Logic has been merged into socketHandler.js unified implementation.
// This file kept temporarily for reference; do not call handlePrivateMessaging again.
const handlePrivateMessaging = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins the application
    socket.on('user_online', (userId) => {
      console.log(`User ${userId} is online with socket ${socket.id}`);
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      
      // Broadcast to all users that this user is online
      socket.broadcast.emit('user_status_change', {
        userId,
        status: 'online'
      });
    });

    // Join a specific private conversation room
    socket.on('join_private_room', ({ senderId, receiverId }) => {
      const roomId = generateRoomId(senderId, receiverId);
      console.log(`User ${senderId} joining room: ${roomId}`);
      
      socket.join(roomId);
      socket.currentRoom = roomId;
      
      // Notify the room that user joined
      socket.to(roomId).emit('user_joined_room', {
        userId: senderId,
        roomId
      });
    });

    // Handle private message sending
    socket.on('send_private_message', async (data) => {
      try {
        const { senderId, receiverId, message, conversationId } = data;
        const roomId = generateRoomId(senderId, receiverId);

        console.log(`Message from ${senderId} to ${receiverId} in room ${roomId}`);

        // Save message to database
        const newMessage = new Message({
          sender: senderId,
          receiver: receiverId,
          content: message,
          timestamp: new Date(),
          conversationId: conversationId || roomId,
          status: 'sent'
        });

        const savedMessage = await newMessage.save();
        
        // Populate sender info for real-time display
        await savedMessage.populate('sender', 'name email avatar');

        // Prepare message data for real-time emission
        const messageData = {
          _id: savedMessage._id,
          senderId: {
            _id: savedMessage.sender._id,
            name: savedMessage.sender.name,
            email: savedMessage.sender.email,
            avatar: savedMessage.sender.avatar
          },
          receiverId: receiverId,
          message: savedMessage.content,
          timestamp: savedMessage.timestamp,
          conversationId: savedMessage.conversationId,
          status: 'sent'
        };

        // Emit to the specific room (both users if online)
        io.to(roomId).emit('receive_private_message', messageData);

        // Mark as delivered if receiver is online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          // Update message status to delivered
          await Message.findByIdAndUpdate(savedMessage._id, { status: 'delivered' });
          
          // Notify sender about delivery
          socket.emit('message_delivered', {
            messageId: savedMessage._id,
            status: 'delivered'
          });
        }

        console.log(`Message sent successfully in room ${roomId}`);

      } catch (error) {
        console.error('Error sending private message:', error);
        socket.emit('message_error', {
          error: 'Failed to send message'
        });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', ({ senderId, receiverId }) => {
      const roomId = generateRoomId(senderId, receiverId);
      socket.to(roomId).emit('user_typing', {
        userId: senderId,
        isTyping: true
      });
    });

    socket.on('typing_stop', ({ senderId, receiverId }) => {
      const roomId = generateRoomId(senderId, receiverId);
      socket.to(roomId).emit('user_typing', {
        userId: senderId,
        isTyping: false
      });
    });

    // Mark messages as read
    socket.on('mark_messages_read', async ({ senderId, receiverId, messageIds }) => {
      try {
        const roomId = generateRoomId(senderId, receiverId);
        
        // Update message status in database
        await Message.updateMany(
          { 
            _id: { $in: messageIds },
            receiver: senderId,
            sender: receiverId 
          },
          { status: 'read' }
        );

        // Notify the sender that messages were read
        socket.to(roomId).emit('messages_read', {
          messageIds,
          readBy: senderId
        });

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        
        // Broadcast to all users that this user is offline
        socket.broadcast.emit('user_status_change', {
          userId: socket.userId,
          status: 'offline'
        });
      }
    });
  });
};

// Utility function to get online users (for API endpoints)
const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

// Check if a specific user is online
const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

module.exports = {
  handlePrivateMessaging,
  getOnlineUsers,
  isUserOnline,
  generateRoomId
};