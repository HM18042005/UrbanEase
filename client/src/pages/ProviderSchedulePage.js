import React from 'react';
import Header from '../components/Header';
import './Dashboard.css';
import { Link } from 'react-router-dom';

const ProviderSchedulePage = () => {
  return (
    <div className="dashboard-page">
      <Header isLoggedIn={true} userType="provider" />
      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="page-title">Update Schedule</h1>
          </div>
          <div className="dashboard-content">
            <div className="dashboard-left">
              <div className="dashboard-card">
                <h3 className="card-title">Availability</h3>
                <p>Set your available days and times for bookings.</p>
              </div>
            </div>
            <div className="dashboard-right">
              <div className="dashboard-card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions">
                  <button className="action-btn primary">
                    <span className="btn-icon">📅</span>
                    Add Availability
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

export default ProviderSchedulePage;
