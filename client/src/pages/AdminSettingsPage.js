
import Header from '../components/Header';
import './AdminDashboard.css';
import { Link } from 'react-router-dom';

const AdminSettingsPage = () => {
  return (
    <div className="admin-dashboard-page">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>UrbanEase Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="nav-item">
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
          <Link to="/admin/users" className="nav-item">
            <span className="nav-icon">👥</span>
            Users
          </Link>
          <Link to="/admin/services" className="nav-item">
            <span className="nav-icon">🔧</span>
            Services
          </Link>
          <Link to="/admin/settings" className="nav-item active">
            <span className="nav-icon">⚙️</span>
            Settings
          </Link>
          <a href="#reports" className="nav-item">
            <span className="nav-icon">📈</span>
            Reports
          </a>
        </nav>
      </div>

      <div className="admin-main">
        <Header isLoggedIn={true} userType="admin" />
        <div className="admin-content">
          <div className="admin-header">
            <h1 className="admin-title">Settings</h1>
          </div>
          <div className="admin-grid">
            <div className="admin-left">
              <div className="admin-card">
                <h3 className="card-title">System Settings</h3>
                {/* Settings management UI goes here */}
                <p>This is where you can configure system settings.</p>
              </div>
            </div>
            <div className="admin-right">
              <div className="admin-card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions">
                  <button className="action-btn primary">
                    <span className="btn-icon">⚙️</span>
                    Update Settings
                  </button>
                  <button className="action-btn">
                    <span className="btn-icon">🔒</span>
                    Security Options
                  </button>
                  <button className="action-btn">
                    <span className="btn-icon">🔔</span>
                    Notification Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
