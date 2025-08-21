import React from 'react';
import Header from '../components/Header';
import './Dashboard.css';
import { Link } from 'react-router-dom';

const ProviderServicesPage = () => {
  return (
    <div className="dashboard-page">
      <Header isLoggedIn={true} userType="provider" />
      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="page-title">Manage Services</h1>
          </div>
          <div className="dashboard-content">
            <div className="dashboard-left">
              <div className="dashboard-card">
                <h3 className="card-title">Your Services</h3>
                <p>Add, edit, or remove services you offer.</p>
              </div>
            </div>
            <div className="dashboard-right">
              <div className="dashboard-card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions">
                  <button className="action-btn primary">
                    <span className="btn-icon">➕</span>
                    Add Service
                  </button>
                  <button className="action-btn">
                    <span className="btn-icon">✏️</span>
                    Edit Service
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

export default ProviderServicesPage;
