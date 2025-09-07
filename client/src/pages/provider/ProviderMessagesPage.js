import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { api } from '../../api/provider';
import './Dashboard.css';

const ProviderMessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.getMessages();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (customerId) => {
    try {
      const response = await api.getConversation(customerId);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const filteredConversations = conversations.filter(conv =>
    conv._id?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      try {
        const messageData = {
          customer: selectedConversation._id._id,
          content: newMessage
        };
        const response = await api.sendMessage(messageData);
        setMessages([...messages, response.data.message]);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

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
              <div className="card h-100">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="card-header">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <div className="position-relative me-3" style={{fontSize: '2rem'}}>
                            {selectedConversation.customerAvatar}
                            {selectedConversation.isOnline && (
                              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle">
                                <span className="visually-hidden">Online</span>
                              </span>
                            )}
                          </div>
                          <div>
                            <h5 className="mb-0">{selectedConversation.customerName}</h5>
                            <small className="text-muted">Service: {selectedConversation.service}</small>
                          </div>
                        </div>
                        <div className="d-flex gap-2 d-none d-md-flex">
                          <button className="btn btn-outline-primary btn-sm">📞 Call</button>
                          <button className="btn btn-outline-secondary btn-sm">📧 Email</button>
                        </div>
                      </div>
                    </div>

                    {/* Messages List */}
                    <div className="card-body d-flex flex-column p-0" style={{height: 'calc(100% - 140px)'}}>
                      <div className="flex-grow-1 overflow-auto p-3">
                        {messages.map(message => (
                          <div 
                            key={message.id}
                            className={`d-flex mb-3 ${message.sender === 'provider' ? 'justify-content-end' : 'justify-content-start'}`}
                          >
                            <div className={`card ${message.sender === 'provider' ? 'bg-primary text-white' : 'bg-light'}`} style={{maxWidth: '70%'}}>
                              <div className="card-body p-3">
                                <p className="mb-1">{message.content}</p>
                                <small className={`${message.sender === 'provider' ? 'text-white-50' : 'text-muted'}`}>
                                  {message.timestamp}
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div className="border-top p-3">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <button 
                            className="btn btn-primary"
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                          >
                            📤
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
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
