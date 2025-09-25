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
        credentials: true,
        allowedHeaders: ['Authorization', 'Content-Type']
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
        console.log('🔐 Incoming socket connection attempt');
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          console.warn('⚠️  Socket auth failed: missing token');
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          console.warn('⚠️  Socket auth failed: user not found');
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        console.log(`✅ Socket auth success for user ${user.name} (${socket.userId})`);
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
      socket.on('error', (err) => {
        console.error('Socket runtime error:', err.message || err);
      });
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      
      // Notify user is online
      this.broadcastUserStatus(socket.userId, 'online');

      // Join user to their conversation rooms
      this.joinUserRooms(socket);

      // Minimal regenerated DM API
      socket.on('dm:join', ({ conversationId }) => {
        if (!conversationId) return;
        socket.join(conversationId);
        console.log(`dm:join -> ${socket.userId} joined ${conversationId}`);
      });

      socket.on('dm:send', async ({ to, text, conversationId }) => {
        try {
          if (!to || !text || !conversationId) return;
          const msg = new Message({
            senderId: socket.userId,
            receiverId: to,
            message: String(text).trim(),
            conversationId,
            status: 'sent',
            timestamp: new Date()
          });
          const saved = await msg.save();
          await saved.populate([{ path: 'senderId', select: 'name email avatar role' }]);
          this.io.to(conversationId).emit('dm:new', { conversationId, message: saved });
        } catch (e) {
          console.error('dm:send error', e);
        }
      });

      socket.on('dm:typing', ({ conversationId, to, isTyping }) => {
        if (!conversationId) return;
        socket.to(conversationId).emit('dm:typing', { conversationId, userId: socket.userId, isTyping: !!isTyping });
      });

      socket.on('dm:read', async ({ conversationId, messageIds }) => {
        try {
          if (!conversationId || !Array.isArray(messageIds) || messageIds.length === 0) return;
          await Message.updateMany({ _id: { $in: messageIds }, receiverId: socket.userId }, { status: 'read' });
          socket.to(conversationId).emit('dm:read', { conversationId, messageIds });
        } catch (e) {
          console.error('dm:read error', e);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => this.handleDisconnection(socket));
    });
  }

  async joinUserRooms(socket) {
    try {
      // Join all conversation rooms where this user is sender or receiver
      const conversations = await Message.distinct('conversationId', {
        $or: [
          { senderId: socket.userId },
          { receiverId: socket.userId }
        ]
      });

      // Join all conversation rooms
      conversations.forEach(conversationId => {
        socket.join(conversationId);
      });

      this.userRooms.set(socket.userId, conversations);
      
    } catch (error) {
      console.error('Error joining user rooms:', error);
    }
  }

  // Removed legacy handlers: handleSendMessage/handleJoinConversation/typing/read

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

  // 1:1 private room id generator (mirrors client generateRoomId)
  generatePrivateRoomId(userId1, userId2) {
    return `room_${[userId1.toString(), userId2.toString()].sort().join('_')}`;
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
