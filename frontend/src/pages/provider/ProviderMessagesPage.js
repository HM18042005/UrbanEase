import { useCallback, useEffect, useState } from 'react';

import { useSearchParams } from 'react-router-dom';

import {
  getBookingBasedConversations,
  getMessages as getConversationMessages,
  markMessagesAsRead,
} from '../../api/services';
import ChatWindow from '../../components/ChatWindow';
import Header from '../../components/Header';
import '../client/MessagesPage.css';
import { useSocket } from '../../contexts/SocketContext';

const ProviderMessagesPage = () => {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const clientName = searchParams.get('clientName');
  const { setMessages } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Provider view now uses global SocketProvider; no local hook needed

  // Get current user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          _id: payload.id,
          id: payload.id,
          name: payload.name || payload.username || 'Unknown User',
          email: payload.email,
          role: payload.role,
        };
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        if (!currentUser?._id) return;
        const response = await getBookingBasedConversations();
        // Normalize to expected shape if needed
        const list = (response.conversations || []).map((conv) => ({
          _id: conv.participant?._id || conv._id,
          id: conv.participant?._id || conv._id,
          conversationId:
            conv.conversationId ||
            (conv.participant?._id && currentUser?._id
              ? `conv_${[conv.participant._id || conv._id, currentUser._id].sort().join('_')}`
              : undefined),
          participant: conv.participant || {
            _id: conv._id,
            name: conv.participantName || conv.customerName || 'Unknown',
            email: conv.participantEmail || conv.customerEmail,
            avatar: conv.participant?.avatar || '/default-avatar.svg',
          },
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime || conv.lastMessageDate,
          unreadCount: conv.unreadCount || 0,
          customerName: conv.customerName,
        }));
        setConversations(list);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]);
      }
    };
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?._id]);

  const markAsRead = useCallback(
    async (customerId) => {
      try {
        await markMessagesAsRead({ senderId: customerId });
        setConversations(
          conversations.map((conv) =>
            conv._id === customerId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    },
    [conversations]
  );

  // Auto-select conversation when clientId is provided
  useEffect(() => {
    if (clientId && conversations.length > 0) {
      const targetConversation = conversations.find(
        (conv) =>
          conv._id === clientId || conv.customerName === decodeURIComponent(clientName || '')
      );

      if (targetConversation) {
        setSelectedConversation(targetConversation);
        markAsRead(targetConversation._id);
      }
    }
  }, [clientId, clientName, conversations, markAsRead]);

  const filteredConversations = conversations.filter((conv) =>
    (conv.participant?.name || conv.customerName || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  // Preload messages for selected conversation
  useEffect(() => {
    const loadHistory = async () => {
      try {
        if (!selectedConversation || !currentUser) return;
        const otherUserId = selectedConversation.participant?._id || selectedConversation._id;
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
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="messages-page">
      <Header isLoggedIn={true} userType="provider" />
      <main className="messages-main">
        <div className="container-fluid">
          <div className="messages-header">
            <div className="header-content">
              <h1>Messages</h1>
              <p>Communicate with your customers</p>
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

          <div className="messages-container">
            <div className="conversations-sidebar">
              <div className="sidebar-header">
                <h3>Conversations</h3>
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search conversations..."
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
                    <p>Start a conversation by contacting a customer</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <button
                      type="button"
                      key={conversation._id}
                      className={`conversation-item ${selectedConversation?._id === conversation._id ? 'active' : ''} ${conversation.unreadCount > 0 ? 'unread' : ''}`}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        markAsRead(conversation._id);
                      }}
                      aria-pressed={selectedConversation?._id === conversation._id}
                    >
                      <div className="conversation-avatar">
                        {conversation.participant?.avatar ? (
                          <img
                            src={conversation.participant.avatar}
                            alt={conversation.participant.name}
                            onError={(e) => {
                              e.target.src = '/default-avatar.svg';
                            }}
                          />
                        ) : (
                          <img src={'/default-avatar.svg'} alt="avatar" />
                        )}
                        {conversation.isOnline && <div className="online-indicator"></div>}
                      </div>

                      <div className="conversation-content">
                        <div className="conversation-header">
                          <h4 className="provider-name">
                            {conversation.participant?.name ||
                              conversation.customerName ||
                              'Unknown'}
                          </h4>
                          <span className="last-time">
                            {formatTime(
                              conversation.lastMessageTime || conversation.lastMessageDate
                            )}
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

            <div className="chat-area">
              {selectedConversation && currentUser ? (
                <ChatWindow
                  conversation={{
                    id: selectedConversation.participant?._id || selectedConversation._id,
                    conversationId: `conv_${[currentUser?._id, selectedConversation.participant?._id || selectedConversation._id].sort().join('_')}`,
                    participant: {
                      _id: selectedConversation.participant?._id || selectedConversation._id,
                      name:
                        selectedConversation.participant?.name || selectedConversation.customerName,
                      email:
                        selectedConversation.participant?.email ||
                        selectedConversation.customerEmail,
                      avatar: selectedConversation.participant?.avatar,
                    },
                  }}
                  currentUser={currentUser}
                />
              ) : (
                <div className="chat-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">💬</div>
                    <h3>Select a conversation</h3>
                    <p>Choose a conversation from the sidebar to start messaging</p>
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

export default ProviderMessagesPage;
