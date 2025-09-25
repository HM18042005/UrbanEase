import { useState, useEffect, useCallback, useRef } from 'react';

import { io } from 'socket.io-client';

// Singleton socket reference (module-level)
let singletonSocket = null;
let singletonUserId = null; // Track which user initialized it
let listenersAttached = false;

const usePrivateMessaging = (currentUser) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  const typingTimeoutRef = useRef({});

  // Helper function to generate consistent room IDs
  const generateRoomId = useCallback((userId1, userId2) => {
    return `room_${[userId1, userId2].sort().join('_')}`;
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;

    // Reuse existing socket if already created for this user
    if (singletonSocket && singletonUserId === currentUser.id) {
      setSocket(singletonSocket);
      setIsConnected(singletonSocket.connected);
      return; // listeners already attached
    }

    const baseURL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');
    singletonSocket = io(baseURL, {
      transports: ['websocket'],
      auth: { userId: currentUser.id, token: token || undefined },
    });
    singletonUserId = currentUser.id;
    setSocket(singletonSocket);

    const s = singletonSocket;

    if (!listenersAttached) {
      listenersAttached = true;
      s.on('connect', () => {
        console.warn('✅ Socket connected (singleton):', s.id);
        setIsConnected(true);
        s.emit('user_online', currentUser.id);
      });
      s.on('disconnect', () => {
        console.warn('❌ Socket disconnected (singleton)');
        setIsConnected(false);
      });
      s.on('connect_error', (err) => console.error('❌ Socket connect_error:', err.message));
      s.on('error', (err) => console.error('❌ Socket error:', err));
      s.on('user_status_change', ({ userId, status }) => {
        setOnlineUsers((prev) => {
          const setCopy = new Set(prev);
          if (status === 'online') setCopy.add(userId);
          else setCopy.delete(userId);
          return setCopy;
        });
      });
      s.on('receive_private_message', (messageData) => {
        setMessages((prev) => {
          const conversationId = messageData.conversationId;
          const updated = { ...prev };
          updated[conversationId] = [...(updated[conversationId] || []), messageData];
          return updated;
        });
        if (messageData.senderId._id !== currentUser.id) {
          setUnreadCounts((prev) => ({
            ...prev,
            [messageData.conversationId]: (prev[messageData.conversationId] || 0) + 1,
          }));
        }
      });
      s.on('user_typing', ({ userId, isTyping }) => {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          const roomId = generateRoomId(currentUser.id, userId);
          if (isTyping) {
            updated[roomId] = { ...updated[roomId], [userId]: true };
            if (typingTimeoutRef.current[userId]) clearTimeout(typingTimeoutRef.current[userId]);
            typingTimeoutRef.current[userId] = setTimeout(() => {
              setTypingUsers((prevInner) => {
                const dupe = { ...prevInner };
                if (dupe[roomId]) {
                  delete dupe[roomId][userId];
                  if (Object.keys(dupe[roomId]).length === 0) delete dupe[roomId];
                }
                return dupe;
              });
            }, 3000);
          } else {
            if (updated[roomId]) {
              delete updated[roomId][userId];
              if (Object.keys(updated[roomId]).length === 0) delete updated[roomId];
            }
            if (typingTimeoutRef.current[userId]) {
              clearTimeout(typingTimeoutRef.current[userId]);
              delete typingTimeoutRef.current[userId];
            }
          }
          return updated;
        });
      });
      s.on('message_delivered', ({ messageId, status }) => {
        setMessages((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((cid) => {
            updated[cid] = updated[cid].map((m) => (m._id === messageId ? { ...m, status } : m));
          });
          return updated;
        });
      });
      s.on('messages_read', ({ messageIds }) => {
        setMessages((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((cid) => {
            updated[cid] = updated[cid].map((m) =>
              messageIds.includes(m._id) ? { ...m, status: 'read' } : m
            );
          });
          return updated;
        });
      });
    }

    return () => {
      // Do NOT disconnect in component unmount (singleton persists)
    };
  }, [currentUser?.id, generateRoomId]);

  // Join a private conversation
  const joinConversation = useCallback(
    (otherUserId) => {
      if (!socket || !isConnected) return;

      const roomId = generateRoomId(currentUser.id, otherUserId);
      console.warn(`🚪 Joining conversation with ${otherUserId}, room: ${roomId}`);

      socket.emit('join_private_room', {
        senderId: currentUser.id,
        receiverId: otherUserId,
      });

      return roomId;
    },
    [socket, isConnected, currentUser?.id, generateRoomId]
  );

  // Send a private message
  const sendPrivateMessage = useCallback(
    (receiverId, message) => {
      if (!socket || !isConnected || !message.trim()) return false;

      const conversationId = generateRoomId(currentUser.id, receiverId);

      console.warn(`📤 Sending message to ${receiverId}:`, message);

      socket.emit('send_private_message', {
        senderId: currentUser.id,
        receiverId,
        message: message.trim(),
        conversationId,
      });

      return true;
    },
    [socket, isConnected, currentUser?.id, generateRoomId]
  );

  // Start typing indicator
  const startTyping = useCallback(
    (receiverId) => {
      if (!socket || !isConnected) return;

      socket.emit('typing_start', {
        senderId: currentUser.id,
        receiverId,
      });
    },
    [socket, isConnected, currentUser?.id]
  );

  // Stop typing indicator
  const stopTyping = useCallback(
    (receiverId) => {
      if (!socket || !isConnected) return;

      socket.emit('typing_stop', {
        senderId: currentUser.id,
        receiverId,
      });
    },
    [socket, isConnected, currentUser?.id]
  );

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    (otherUserId, messageIds) => {
      if (!socket || !isConnected) return;

      socket.emit('mark_messages_read', {
        senderId: currentUser.id,
        receiverId: otherUserId,
        messageIds,
      });

      // Clear unread count locally
      const conversationId = generateRoomId(currentUser.id, otherUserId);
      setUnreadCounts((prev) => ({
        ...prev,
        [conversationId]: 0,
      }));
    },
    [socket, isConnected, currentUser?.id, generateRoomId]
  );

  // Get messages for a specific conversation
  const getConversationMessages = useCallback(
    (otherUserId) => {
      const conversationId = generateRoomId(currentUser.id, otherUserId);
      return messages[conversationId] || [];
    },
    [messages, currentUser?.id, generateRoomId]
  );

  // Check if user is online
  const isUserOnline = useCallback(
    (userId) => {
      return onlineUsers.has(userId);
    },
    [onlineUsers]
  );

  return {
    socket,
    isConnected,
    onlineUsers,
    messages,
    typingUsers,
    unreadCounts,
    joinConversation,
    sendPrivateMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    getConversationMessages,
    isUserOnline,
    generateRoomId,
  };
};

export default usePrivateMessaging;
