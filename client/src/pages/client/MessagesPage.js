import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  getBookingBasedConversations,
  getMessages as getConversationMessages,
  markMessagesAsRead,
} from '../../api/services';
import ChatWindow from '../../components/ChatWindow';
import Header from '../../components/Header';
import { useSocket } from '../../contexts/SocketContext';
import './MessagesPage.css';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { setMessages } = useSocket();

  // Get current user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser({
        _id: payload.id,
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      });
    } catch (error) {
      console.error('Error parsing token:', error);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!currentUser?._id) return;
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?._id]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await getBookingBasedConversations();
      console.warn('Booking-based conversations response:', response);

      // Transform conversations for ChatWindow component
      const transformedConversations = (response.conversations || []).map((conv) => {
        // Handle different response structures
        const providerId = conv.provider?._id || conv.providerId || conv.participant?._id;
        const providerName =
          conv.provider?.name ||
          conv.participantName ||
          conv.participant?.name ||
          'Unknown Provider';
        const providerEmail = conv.provider?.email || conv.participant?.email || '';
        const lastMessage = conv.lastMessage || '';
        const lastMessageTime = conv.lastMessageTime || conv.updatedAt || conv.createdAt;
        const unreadCount = conv.unreadCount || 0;

        return {
          id: providerId,
          conversationId:
            currentUser?.id && providerId
              ? `conv_${[currentUser.id, providerId].sort().join('_')}`
              : undefined,
          participant: {
            _id: providerId,
            name: providerName,
            email: providerEmail,
            avatar: conv.provider?.avatar || conv.participant?.avatar || '/default-avatar.svg',
          },
          lastMessage,
          lastMessageTime,
          unreadCount,
          isOnline: false, // Will be updated by Socket.IO
        };
      });

      setConversations(transformedConversations);
      setError('');
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markAsRead = async (providerId) => {
    try {
      // Mark on server so other devices reflect the change
      await markMessagesAsRead({ senderId: providerId });
      // Update local state immediately for better UX
      setConversations(
        conversations.map((conv) => (conv.id === providerId ? { ...conv, unreadCount: 0 } : conv))
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  // Preload messages when a conversation is selected
  useEffect(() => {
    const loadHistory = async () => {
      try {
        if (!selectedConversation || !currentUser) return;
        const otherUserId = selectedConversation.participant?._id || selectedConversation.id;
        const convId = `conv_${[currentUser._id, otherUserId].sort().join('_')}`;
        const resp = await getConversationMessages(otherUserId);
        const msgs = resp.messages || [];
        setMessages((prev) => ({ ...prev, [convId]: msgs }));
      } catch (e) {
        console.error('Failed to load conversation history:', e);
      }
    };
    loadHistory();
  }, [selectedConversation, currentUser, setMessages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="messages-page">
        <Header isLoggedIn={true} userType="client" />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <Header isLoggedIn={true} userType="client" />

      <main className="messages-main">
        <div className="container-fluid">
          {/* Page Header */}
          <div className="messages-header">
            <div className="header-content">
              <h1>Messages</h1>
              <p>Communicate with your service providers</p>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-value">{totalUnread}</span>
                <span className="stat-label">Unread</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{conversations.length}</span>
                <span className="stat-label">Conversations</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button onClick={fetchConversations} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          <div className="messages-container">
            {/* Conversations Sidebar */}
            <div className="conversations-sidebar">
              <div className="sidebar-header">
                <h3>Conversations</h3>
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search providers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="conversations-list">
                {filteredConversations.length === 0 ? (
                  <div className="empty-conversations">
                    <div className="empty-icon">💬</div>
                    <h4>No conversations</h4>
                    <p>Start a conversation by booking a service or contacting a provider</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <button
                      type="button"
                      key={conversation.id}
                      className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''} ${conversation.unreadCount > 0 ? 'unread' : ''}`}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        markAsRead(conversation.id);
                      }}
                    >
                      <div className="conversation-avatar">
                        <img
                          src={conversation.participant.avatar}
                          alt={conversation.participant.name}
                          onError={(e) => {
                            e.target.src = '/default-avatar.svg';
                          }}
                        />
                        {conversation.isOnline && <div className="online-indicator"></div>}
                      </div>

                      <div className="conversation-content">
                        <div className="conversation-header">
                          <h4 className="provider-name">{conversation.participant.name}</h4>
                          <span className="last-time">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>

                        <div className="conversation-preview">
                          <p className="last-message">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="unread-badge">{conversation.unreadCount}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="chat-area">
              {selectedConversation && currentUser ? (
                <ChatWindow conversation={selectedConversation} currentUser={currentUser} />
              ) : (
                <div className="chat-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">💬</div>
                    <h3>Select a conversation</h3>
                    <p>Choose a provider from the sidebar to start messaging</p>
                    {conversations.length === 0 && (
                      <div className="action-hint">
                        <p>To start conversations with providers:</p>
                        <ul>
                          <li>Book a service</li>
                          <li>Contact a provider directly</li>
                          <li>Leave a review and get responses</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
