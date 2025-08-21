import React from 'react';
import Header from '../components/Header';
import './Dashboard.css';

const ProviderReportsPage = () => {
  return (
    <div className="dashboard-page">
      <Header isLoggedIn={true} userType="provider" />
      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="page-title">Provider Reports</h1>
          </div>
          <div className="dashboard-content">
            <div className="dashboard-card">
              <h3 className="card-title">Summary</h3>
              <p>View your earnings and performance summaries here.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderReportsPage;
