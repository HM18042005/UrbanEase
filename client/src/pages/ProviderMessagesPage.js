import React from 'react';
import Header from '../components/Header';
import './Dashboard.css';
import { Link } from 'react-router-dom';

const ProviderMessagesPage = () => {
  return (
    <div className="dashboard-page">
      <Header isLoggedIn={true} userType="provider" />
      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="page-title">Message Customers</h1>
          </div>
          <div className="dashboard-content">
            <div className="dashboard-left">
              <div className="dashboard-card">
                <h3 className="card-title">Conversations</h3>
                <p>Send and receive messages with your customers.</p>
              </div>
            </div>
            <div className="dashboard-right">
              <div className="dashboard-card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions">
                  <button className="action-btn primary">
                    <span className="btn-icon">✉️</span>
                    New Message
                  </button>
                  <Link to="/provider/reports" className="action-btn">
                    <span className="btn-icon">📈</span>
                    View Reports
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderMessagesPage;
