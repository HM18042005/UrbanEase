import { useEffect, useRef, useState } from 'react';

import PropTypes from 'prop-types';

import usePrivateMessaging from '../hooks/usePrivateMessaging';
import './PrivateChat.css';

const PrivateChat = ({ currentUser, otherUser, onClose }) => {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    isConnected,
    joinConversation,
    sendPrivateMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    getConversationMessages,
    isUserOnline,
    typingUsers,
    generateRoomId,
  } = usePrivateMessaging(currentUser);

  const conversationId = generateRoomId(currentUser.id, otherUser.id);
  const messages = getConversationMessages(otherUser.id);
  const isOtherUserOnline = isUserOnline(otherUser.id);
  const currentTypingUsers = typingUsers[conversationId] || {};

  // Join conversation when component mounts
  useEffect(() => {
    if (isConnected && otherUser.id) {
      joinConversation(otherUser.id);
    }
  }, [isConnected, otherUser.id, joinConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessages = messages
        .filter((msg) => msg.senderId._id !== currentUser.id && msg.status !== 'read')
        .map((msg) => msg._id);

      if (unreadMessages.length > 0) {
        markMessagesAsRead(otherUser.id, unreadMessages);
      }
    }
  }, [messages, otherUser.id, currentUser.id, markMessagesAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !isConnected) return;

    const success = sendPrivateMessage(otherUser.id, messageInput.trim());

    if (success) {
      setMessageInput('');
      handleStopTyping();
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    // Handle typing indicators
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      startTyping(otherUser.id);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      stopTyping(otherUser.id);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageStatus = (message) => {
    if (message.senderId._id !== currentUser.id) return '';

    switch (message.status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓ Read';
      default:
        return '';
    }
  };

  return (
    <div className="private-chat">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="user-info">
          <div className="avatar">
            {otherUser.avatar ? (
              <img src={otherUser.avatar} alt={otherUser.name} />
            ) : (
              <div className="avatar-placeholder">{otherUser.name?.charAt(0)?.toUpperCase()}</div>
            )}
            <span className={`status-dot ${isOtherUserOnline ? 'online' : 'offline'}`} />
          </div>
          <div className="user-details">
            <h3>{otherUser.name}</h3>
            <span className="status">{isOtherUserOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="connection-status">
          <span className="offline-indicator">⚠️ Connecting...</span>
        </div>
      )}

      {/* Messages Container */}
      <div className="messages-container">
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwn = message.senderId._id === currentUser.id;
              const showAvatar =
                index === 0 || messages[index - 1].senderId._id !== message.senderId._id;

              return (
                <div key={message._id} className={`message ${isOwn ? 'own' : 'other'}`}>
                  {!isOwn && showAvatar && (
                    <div className="message-avatar">
                      {message.senderId.avatar ? (
                        <img src={message.senderId.avatar} alt={message.senderId.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {message.senderId.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="message-content">
                    <div className="message-bubble">
                      <p>{message.message}</p>
                    </div>
                    <div className="message-meta">
                      <span className="time">{formatTime(message.timestamp)}</span>
                      {isOwn && <span className="status">{getMessageStatus(message)}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {Object.keys(currentTypingUsers).length > 0 && (
            <div className="typing-indicator">
              <div className="typing-avatar">
                <div className="avatar-placeholder">{otherUser.name?.charAt(0)?.toUpperCase()}</div>
              </div>
              <div className="typing-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <form onSubmit={handleSendMessage}>
          <div className="input-wrapper">
            <input
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              onBlur={handleStopTyping}
              placeholder="Type a message..."
              className="message-input"
              disabled={!isConnected}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!messageInput.trim() || !isConnected}
            >
              <svg viewBox="0 0 24 24" className="send-icon">
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrivateChat;

PrivateChat.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    avatar: PropTypes.string,
  }).isRequired,
  otherUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    avatar: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
