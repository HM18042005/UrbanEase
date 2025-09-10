import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import ChatWindow from '../../components/ChatWindow';
import { api } from '../../api/provider';
import './Dashboard.css';

const ProviderMessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role
        });
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.getMessages();
        setConversations(response.data.conversations || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]);
      }
    };
    
    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter(conv =>
    conv._id?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markAsRead = async (customerId) => {
    try {
      await api.markMessagesRead(customerId);
      setConversations(conversations.map(conv =>
        conv._id._id === customerId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className="dashboard-page">
      <Header isLoggedIn={true} userType="provider" />
      <main className="dashboard-main">
        <div className="container-fluid px-3">
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <h1 className="h3 mb-0">Messages</h1>
                <div className="d-flex gap-2">
                  <span className="badge bg-primary">
                    {totalUnread} unread
                  </span>
                  <span className="badge bg-secondary">
                    {conversations.length} conversations
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="row" style={{height: 'calc(100vh - 200px)'}}>
            {/* Conversations Sidebar */}
            <div className="col-lg-4 col-md-5 mb-3">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="card-title mb-0">Conversations</h5>
                </div>
                <div className="card-body p-0">
                  <div className="p-3 border-bottom">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="overflow-auto" style={{height: 'calc(100% - 80px)'}}>
                    {filteredConversations.length === 0 ? (
                      <div className="text-center p-4">
                        <div className="mb-3" style={{fontSize: '3rem'}}>💬</div>
                        <p className="text-muted">No conversations found</p>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {filteredConversations.map(conversation => (
                          <div 
                            key={conversation.id}
                            className={`list-group-item list-group-item-action ${selectedConversation?.id === conversation.id ? 'active' : ''} ${conversation.unreadCount > 0 ? 'border-start border-primary border-3' : ''}`}
                            onClick={() => {
                              setSelectedConversation(conversation);
                              markAsRead(conversation.id);
                            }}
                            style={{cursor: 'pointer'}}
                          >
                            <div className="d-flex align-items-start position-relative">
                              <div className="position-relative me-3" style={{fontSize: '2rem'}}>
                                {conversation.customerAvatar}
                                {conversation.isOnline && (
                                  <span className="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle">
                                    <span className="visually-hidden">Online</span>
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                  <h6 className="mb-0 text-truncate">{conversation.customerName}</h6>
                                  <small className="text-muted ms-2">{conversation.lastMessageTime}</small>
                                </div>
                                
                                <div className="mb-1">
                                  <span className="badge bg-light text-dark small">{conversation.service}</span>
                                </div>
                                <p className="mb-0 text-muted small text-truncate">
                                  {conversation.lastMessage}
                                </p>
                                
                                {conversation.unreadCount > 0 && (
                                  <div className="position-absolute top-50 end-0 translate-middle-y me-2">
                                    <span className="badge bg-primary rounded-pill">{conversation.unreadCount}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="col-lg-8 col-md-7">
              <div className="card h-100" style={{padding: 0}}>
                {selectedConversation && currentUser ? (
                  <ChatWindow 
                    conversation={selectedConversation} 
                    currentUser={currentUser}
                  />
                ) : (
                  <div className="card-body d-flex align-items-center justify-content-center h-100">
                    <div className="text-center">
                      <div className="mb-3" style={{fontSize: '4rem'}}>💬</div>
                      <h5 className="text-muted">Select a conversation to start messaging</h5>
                      <p className="text-muted">Choose a conversation from the sidebar to view messages</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderMessagesPage;
