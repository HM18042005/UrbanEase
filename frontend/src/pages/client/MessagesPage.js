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
              <span className="header-eyebrow">Inbox</span>
              <div className="header-title-row">
                <h1>Messages</h1>
                {totalUnread === 0 && conversations.length > 0 && (
                  <span className="status-chip">All caught up</span>
                )}
              </div>
              <p>Stay connected with your service providers in real time.</p>
            </div>
            <div className="header-stats" role="list">
              <div className="stat-item" role="listitem">
                <div className="stat-icon stat-icon--unread" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5A2.25 2.25 0 0 1 19.5 6.75v7.5A2.25 2.25 0 0 1 17.25 16.5H8.561a.75.75 0 0 0-.498.192l-2.934 2.64a.75.75 0 0 1-1.254-.552v-11.58Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="stat-copy">
                  <span className="stat-label">Unread</span>
                  <span className="stat-value">{totalUnread}</span>
                </div>
              </div>
              <div className="stat-item" role="listitem">
                <div className="stat-icon stat-icon--conversations" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6.75 6.75A2.25 2.25 0 0 1 9 4.5h8.25A2.25 2.25 0 0 1 19.5 6.75v6a2.25 2.25 0 0 1-2.25 2.25H9.939a.75.75 0 0 0-.498.192l-2.934 2.64a.75.75 0 0 1-1.254-.552v-10.53Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.5 10.5V15a2.25 2.25 0 0 0 2.25 2.25H9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="stat-copy">
                  <span className="stat-label">Conversations</span>
                  <span className="stat-value">{conversations.length}</span>
                </div>
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
                  <span className="search-icon" aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="6" />
                      <path d="m20 20-2.8-2.8" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search providers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    aria-label="Search providers"
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
                      aria-pressed={selectedConversation?.id === conversation.id}
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
                          <div className="conversation-title">
                            <h4 className="provider-name">{conversation.participant.name}</h4>
                            {conversation.unreadCount > 0 && (
                              <span className="conversation-pill">New</span>
                            )}
                          </div>
                          <span className="last-time">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>

                        <div className="conversation-preview">
                          <p className="last-message">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="unread-badge">{conversation.unreadCount}</span>
                      )}
                      <span className="conversation-chevron" aria-hidden="true">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </span>
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
                    <button
                      type="button"
                      className="primary-cta"
                      onClick={() => navigate('/services')}
                    >
                      Explore services
                    </button>
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
