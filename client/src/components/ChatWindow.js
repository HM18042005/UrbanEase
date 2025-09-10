import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSocket } from '../contexts/SocketContext';
import TypingIndicator from './TypingIndicator';
import './ChatWindow.css';

const ChatWindow = ({ conversation, currentUser }) => {
  const {
    messages,
    sendMessage,
    joinConversation,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    onlineUsers,
    typingUsers
  } = useSocket();

  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const conversationId = useMemo(() => 
    conversation?.conversationId || `conv_${[currentUser._id, conversation?.participant?._id].sort().join('_')}`,
    [conversation?.conversationId, currentUser._id, conversation?.participant?._id]
  );
  
  const conversationMessages = useMemo(() => 
    messages[conversationId] || [],
    [messages, conversationId]
  );
  const participant = conversation?.participant;
  const isParticipantOnline = participant && onlineUsers.has(participant._id);
  const currentTypingUsers = typingUsers[conversationId] || {};

  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);
    }
  }, [conversationId, joinConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  useEffect(() => {
    // Mark messages as read when conversation is viewed
    const unreadMessages = conversationMessages
      .filter(msg => msg.receiverId === currentUser._id && msg.status !== 'read')
      .map(msg => msg._id);
    
    if (unreadMessages.length > 0) {
      markMessagesAsRead(conversationId, unreadMessages);
    }
  }, [conversationMessages, conversationId, currentUser._id, markMessagesAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !participant) return;

    const success = sendMessage(participant._id, messageInput.trim(), conversationId);
    
    if (success) {
      setMessageInput('');
      handleStopTyping();
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      startTyping(conversationId, participant?._id);
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
      stopTyping(conversationId);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getMessageStatus = (message) => {
    if (message.senderId._id !== currentUser._id) return '';
    
    switch (message.status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  if (!conversation || !participant) {
    return (
      <div className="chat-window-empty">
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>Select a conversation</h3>
          <p>Choose a conversation from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="participant-info">
          <div className="avatar-container">
            <img 
              src={participant.avatar || '/default-avatar.png'} 
              alt={participant.name}
              className="participant-avatar"
            />
            <div className={`status-indicator ${isParticipantOnline ? 'online' : 'offline'}`} />
          </div>
          <div className="participant-details">
            <h3>{participant.name}</h3>
            <span className={`status-text ${isParticipantOnline ? 'online' : 'offline'}`}>
              {isParticipantOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        <div className="messages-list">
          {conversationMessages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            conversationMessages.map((message, index) => {
              const isOwn = message.senderId._id === currentUser._id;
              const showAvatar = index === 0 || 
                conversationMessages[index - 1].senderId._id !== message.senderId._id;

              return (
                <div key={message._id || index} className={`message ${isOwn ? 'own' : 'other'}`}>
                  {!isOwn && showAvatar && (
                    <img 
                      src={message.senderId.avatar || '/default-avatar.png'}
                      alt={message.senderId.name}
                      className="message-avatar"
                    />
                  )}
                  <div className="message-bubble">
                    <div className="message-content">{message.message}</div>
                    <div className="message-meta">
                      <span className="message-time">
                        {formatMessageTime(message.timestamp)}
                      </span>
                      {isOwn && (
                        <span className={`message-status status-${message.status}`}>
                          {getMessageStatus(message)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing Indicator */}
          {Object.keys(currentTypingUsers).length > 0 && (
            <TypingIndicator users={Object.values(currentTypingUsers)} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            onBlur={handleStopTyping}
            placeholder="Type a message..."
            className="message-input"
            autoComplete="off"
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!messageInput.trim()}
          >
            <span className="send-icon">📤</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
