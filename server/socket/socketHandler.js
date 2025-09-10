const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Message = require('../models/message');

class SocketHandler {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://yourdomain.com'] 
          : ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.connectedUsers = new Map(); // userId -> socketId
    this.userRooms = new Map(); // userId -> [roomIds]
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Socket authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.name} connected (${socket.userId})`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      
      // Notify user is online
      this.broadcastUserStatus(socket.userId, 'online');

      // Join user to their conversation rooms
      this.joinUserRooms(socket);

      // Handle incoming messages
      socket.on('send_message', (data) => this.handleSendMessage(socket, data));
      
      // Handle typing indicators
      socket.on('typing_start', (data) => this.handleTypingStart(socket, data));
      socket.on('typing_stop', (data) => this.handleTypingStop(socket, data));
      
      // Handle joining conversation rooms
      socket.on('join_conversation', (data) => this.handleJoinConversation(socket, data));
      
      // Handle message read status
      socket.on('mark_messages_read', (data) => this.handleMarkMessagesRead(socket, data));

      // Handle disconnection
      socket.on('disconnect', () => this.handleDisconnection(socket));
    });
  }

  async joinUserRooms(socket) {
    try {
      // Get user's conversations based on their role
      let conversations = [];
      
      if (socket.user.role === 'provider') {
        // Join provider's conversation rooms
        conversations = await Message.distinct('conversationId', {
          $or: [
            { providerId: socket.userId },
            { receiverId: socket.userId }
          ]
        });
      } else {
        // Join client's conversation rooms
        conversations = await Message.distinct('conversationId', {
          $or: [
            { senderId: socket.userId },
            { receiverId: socket.userId }
          ]
        });
      }

      // Join all conversation rooms
      conversations.forEach(conversationId => {
        socket.join(conversationId);
      });

      this.userRooms.set(socket.userId, conversations);
      
    } catch (error) {
      console.error('Error joining user rooms:', error);
    }
  }

  async handleSendMessage(socket, data) {
    try {
      const { receiverId, message, conversationId } = data;

      // Create message in database
      const newMessage = new Message({
        senderId: socket.userId,
        receiverId,
        message: message.trim(),
        conversationId,
        timestamp: new Date(),
        status: 'sent'
      });

      const savedMessage = await newMessage.save();
      await savedMessage.populate([
        { path: 'senderId', select: 'name email avatar role' },
        { path: 'receiverId', select: 'name email avatar role' }
      ]);

      // Emit to conversation room
      this.io.to(conversationId).emit('new_message', {
        message: savedMessage,
        conversationId,
        timestamp: new Date()
      });

      // Update message status to delivered if receiver is online
      const receiverSocketId = this.connectedUsers.get(receiverId);
      if (receiverSocketId) {
        savedMessage.status = 'delivered';
        await savedMessage.save();
        
        // Notify sender about delivery
        socket.emit('message_delivered', {
          messageId: savedMessage._id,
          conversationId
        });
      }

      console.log(`Message sent from ${socket.user.name} to conversation ${conversationId}`);
      
    } catch (error) {
      console.error('Error handling send message:', error);
      socket.emit('message_error', { 
        error: 'Failed to send message',
        details: error.message 
      });
    }
  }

  handleJoinConversation(socket, data) {
    const { conversationId } = data;
    
    socket.join(conversationId);
    
    // Add to user rooms if not already present
    const userRooms = this.userRooms.get(socket.userId) || [];
    if (!userRooms.includes(conversationId)) {
      userRooms.push(conversationId);
      this.userRooms.set(socket.userId, userRooms);
    }

    console.log(`User ${socket.user.name} joined conversation ${conversationId}`);
  }

  handleTypingStart(socket, data) {
    const { conversationId, receiverId } = data;
    
    socket.to(conversationId).emit('user_typing', {
      userId: socket.userId,
      userName: socket.user.name,
      conversationId,
      isTyping: true
    });
  }

  handleTypingStop(socket, data) {
    const { conversationId } = data;
    
    socket.to(conversationId).emit('user_typing', {
      userId: socket.userId,
      userName: socket.user.name,
      conversationId,
      isTyping: false
    });
  }

  async handleMarkMessagesRead(socket, data) {
    try {
      const { conversationId, messageIds } = data;

      // Update message status to read
      await Message.updateMany(
        { 
          _id: { $in: messageIds },
          receiverId: socket.userId 
        },
        { status: 'read' }
      );

      // Notify sender about read status
      socket.to(conversationId).emit('messages_read', {
        messageIds,
        conversationId,
        readBy: socket.userId
      });

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  handleDisconnection(socket) {
    console.log(`User ${socket.user.name} disconnected`);
    
    // Remove user from connected users
    this.connectedUsers.delete(socket.userId);
    this.userRooms.delete(socket.userId);
    
    // Notify user is offline
    this.broadcastUserStatus(socket.userId, 'offline');
  }

  broadcastUserStatus(userId, status) {
    // Get user's conversations and notify participants
    const userRooms = this.userRooms.get(userId) || [];
    
    userRooms.forEach(conversationId => {
      this.io.to(conversationId).emit('user_status_changed', {
        userId,
        status,
        timestamp: new Date()
      });
    });
  }

  // Utility method to send message to specific user
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }

  // Get online users in a conversation
  getOnlineUsersInConversation(conversationId) {
    const room = this.io.sockets.adapter.rooms.get(conversationId);
    return room ? room.size : 0;
  }
}

module.exports = SocketHandler;
