import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import PropTypes from 'prop-types';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null); // hold latest socket instance for cleanup
  const [isConnected, setIsConnected] = useState(false);
  const [messagesByConv, setMessagesByConv] = useState({}); // { [conversationId]: Message[] }
  const [typingByConv, setTypingByConv] = useState({}); // { [conversationId]: { [userId]: true } }
  const reconnectingRef = useRef(false);

  const apiBase = useMemo(() => {
    const url = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return url.replace(/\/?api$/, '');
  }, []);

  const connect = useCallback(
    (token) => {
      if (socketRef.current?.connected || reconnectingRef.current) return;
      reconnectingRef.current = true;

      const s = io(apiBase, {
        auth: { token },
        transports: ['websocket', 'polling'], // allow fallback
        upgrade: true,
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 500,
      });

      s.on('connect', () => {
        setIsConnected(true);
      });

      s.on('disconnect', (reason) => {
        console.warn('Socket disconnected:', reason);
        setIsConnected(false);
      });
      s.on('connect_error', (err) => {
        console.error('Socket connect_error:', err?.message || err);
      });

      // Incoming events
      s.on('dm:new', ({ conversationId, message }) => {
        setMessagesByConv((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), message],
        }));
      });

      s.on('dm:typing', ({ conversationId, userId, isTyping }) => {
        setTypingByConv((prev) => {
          const conv = { ...(prev[conversationId] || {}) };
          if (isTyping) conv[userId] = true;
          else delete conv[userId];
          return { ...prev, [conversationId]: conv };
        });
      });

      s.on('dm:read', ({ conversationId, messageIds }) => {
        setMessagesByConv((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).map((m) =>
            messageIds.includes(m._id) ? { ...m, status: 'read' } : m
          ),
        }));
      });

      socketRef.current = s;
      setSocket(s);
      reconnectingRef.current = false;
    },
    [apiBase]
  );

  const disconnect = useCallback(() => {
    try {
      socketRef.current?.disconnect();
    } finally {
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setMessagesByConv({});
      setTypingByConv({});
    }
  }, []);

  const joinDM = useCallback(
    (conversationId) => {
      if (!socket?.connected || !conversationId) return;
      socket.emit('dm:join', { conversationId });
    },
    [socket]
  );

  const sendDM = useCallback(
    (receiverId, text, conversationId) => {
      if (!socket?.connected || !receiverId || !text?.trim() || !conversationId) return false;
      socket.emit('dm:send', { to: receiverId, text: text.trim(), conversationId });
      return true;
    },
    [socket]
  );

  const typingDM = useCallback(
    (conversationId, to, isTyping) => {
      if (!socket?.connected || !conversationId) return;
      socket.emit('dm:typing', { conversationId, to, isTyping: !!isTyping });
    },
    [socket]
  );

  const markRead = useCallback(
    (conversationId, messageIds) => {
      if (
        !socket?.connected ||
        !conversationId ||
        !Array.isArray(messageIds) ||
        messageIds.length === 0
      )
        return;
      socket.emit('dm:read', { conversationId, messageIds });
    },
    [socket]
  );

  // Connect once on mount; disconnect on unmount (avoid dependency-triggered loops)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) connect(token);
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      messages: messagesByConv,
      typingUsers: typingByConv,
      joinDM,
      sendDM,
      typingDM,
      markRead,
      setMessages: setMessagesByConv,
    }),
    [socket, isConnected, messagesByConv, typingByConv, joinDM, sendDM, typingDM, markRead]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
