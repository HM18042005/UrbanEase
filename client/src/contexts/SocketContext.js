import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  const connectSocket = useCallback((token) => {
    if (socket?.connected) return;

    const newSocket = io(process.env.REACT_APP_API_URL.replace('/api', ''), {
      auth: { token },
      transports: ['websocket'],
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
      toast.success('Connected to real-time chat!', { autoClose: 3000 });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      if (reason !== 'io client disconnect') {
        toast.warn('Connection lost. Trying to reconnect...', { autoClose: 3000 });
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
      toast.error('Chat connection failed. Please refresh.', { autoClose: 5000 });
    });

    // Real-time message handlers
    newSocket.on('new_message', (data) => {
      const { message, conversationId } = data;
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), message]
      }));

      // Update unread count if not current conversation
      const currentConversation = window.location.pathname.includes('/messages');
      if (!currentConversation) {
        setUnreadCounts(prev => ({
          ...prev,
          [conversationId]: (prev[conversationId] || 0) + 1
        }));
      }

      // Show notification
      if (message.senderId._id !== getCurrentUserId()) {
        toast.info(`New message from ${message.senderId.name}`, { autoClose: 3000 });
      }
    });

    newSocket.on('user_typing', (data) => {
      const { userId, userName, conversationId, isTyping } = data;
      
      setTypingUsers(prev => ({
        ...prev,
        [conversationId]: isTyping 
          ? { ...prev[conversationId], [userId]: userName }
          : Object.fromEntries(
              Object.entries(prev[conversationId] || {}).filter(([id]) => id !== userId)
            )
      }));

      // Clear typing indicator after 3 seconds
      if (isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [conversationId]: Object.fromEntries(
              Object.entries(prev[conversationId] || {}).filter(([id]) => id !== userId)
            )
          }));
        }, 3000);
      }
    });

    newSocket.on('user_status_changed', (data) => {
      const { userId, status } = data;
      
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        if (status === 'online') {
          updated.add(userId);
        } else {
          updated.delete(userId);
        }
        return updated;
      });
    });

    newSocket.on('message_delivered', (data) => {
      const { messageId, conversationId } = data;
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(msg =>
          msg._id === messageId ? { ...msg, status: 'delivered' } : msg
        )
      }));
    });

    newSocket.on('messages_read', (data) => {
      const { messageIds, conversationId } = data;
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(msg =>
          messageIds.includes(msg._id) ? { ...msg, status: 'read' } : msg
        )
      }));
    });

    setSocket(newSocket);
  }, [socket]);

  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers(new Set());
      setMessages({});
      setTypingUsers({});
    }
  }, [socket]);

  const sendMessage = useCallback((receiverId, message, conversationId) => {
    if (!socket?.connected) {
      toast.error('Not connected to chat server');
      return false;
    }

    socket.emit('send_message', {
      receiverId,
      message,
      conversationId
    });

    return true;
  }, [socket]);

  const joinConversation = useCallback((conversationId) => {
    if (socket?.connected) {
      socket.emit('join_conversation', { conversationId });
    }
  }, [socket]);

  const startTyping = useCallback((conversationId, receiverId) => {
    if (socket?.connected) {
      socket.emit('typing_start', { conversationId, receiverId });
    }
  }, [socket]);

  const stopTyping = useCallback((conversationId) => {
    if (socket?.connected) {
      socket.emit('typing_stop', { conversationId });
    }
  }, [socket]);

  const markMessagesAsRead = useCallback((conversationId, messageIds) => {
    if (socket?.connected) {
      socket.emit('mark_messages_read', { conversationId, messageIds });
      
      // Clear unread count
      setUnreadCounts(prev => ({
        ...prev,
        [conversationId]: 0
      }));
    }
  }, [socket]);

  // Helper function to get current user ID (you'll need to implement this)
  const getCurrentUserId = () => {
    // Get from your auth context or localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user._id || user.id;
  };

  // Auto-connect when token is available
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !socket) {
      connectSocket(token);
    }

    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket, socket]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    messages,
    typingUsers,
    unreadCounts,
    connectSocket,
    disconnectSocket,
    sendMessage,
    joinConversation,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    setMessages
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
