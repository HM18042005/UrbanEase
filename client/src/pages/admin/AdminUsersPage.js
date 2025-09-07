import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import './AdminDashboard.css';
import { adminAPI } from '../../api/services';

/**
 * AdminUsersPage Component
 * 
 * What: User management interface for administrators
 * When: Admin needs to view, manage, and moderate users
 * Why: Provides centralized user administration with CRUD operations
 * 
 * Features:
 * - User list with search and filtering
 * - User status management (active/inactive)
 * - User deletion with confirmation
 * - Role-based filtering (customer/provider/admin)
 * - User profile modal for detailed information
 * - Bulk operations for user management
 */
const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    customers: 0,
    providers: 0,
    admins: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getAllUsers();
      const usersData = response.data || response.users || [];
      setUsers(usersData);
      
      // Calculate stats
      const statistics = {
        total: usersData.length,
        customers: usersData.filter(u => u.role === 'customer').length,
        providers: usersData.filter(u => u.role === 'provider').length,
        admins: usersData.filter(u => u.role === 'admin').length,
        active: usersData.filter(u => u.active !== false).length,
        inactive: usersData.filter(u => u.active === false).length
      };
      setStats(statistics);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === false ? true : false;
      await adminAPI.updateUserStatus(userId, newStatus ? 'active' : 'inactive');
      
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, active: newStatus }
          : user
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        active: newStatus ? prev.active + 1 : prev.active - 1,
        inactive: newStatus ? prev.inactive - 1 : prev.inactive + 1
      }));
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      const deletedUser = users.find(u => u._id === userId);
      
      setUsers(users.filter(user => user._id !== userId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        [deletedUser.role + 's']: prev[deletedUser.role + 's'] - 1,
        [deletedUser.active !== false ? 'active' : 'inactive']: prev[deletedUser.active !== false ? 'active' : 'inactive'] - 1
      }));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.active !== false) ||
                         (statusFilter === 'inactive' && user.active === false);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc3545';
      case 'provider': return '#007bff';
      case 'customer': return '#28a745';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="admin-dashboard-page">
          <div className="admin-main">
            <div className="admin-content">
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="admin-dashboard-page">
        <div className="admin-main">
          <div className="admin-content">
      <div className="admin-header">
        <div className="header-content">
          <div className="breadcrumb">
            <span className="breadcrumb-item">Admin</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item current">User Management</span>
          </div>
          <h1>User Management</h1>
          <p>Manage platform users, roles, and permissions</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-icon">👥</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{stats.customers}</div>
            <div className="stat-label">Customers</div>
          </div>
          <div className="stat-icon">🛒</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{stats.providers}</div>
            <div className="stat-label">Providers</div>
          </div>
          <div className="stat-icon">🔧</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-icon">✅</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="admin-card">
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-controls">
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="provider">Providers</option>
              <option value="admin">Admins</option>
            </select>
            
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <button 
              onClick={fetchUsers}
              className="refresh-btn"
              title="Refresh users"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Users ({filteredUsers.length})</h3>
        </div>
        
        <div className="table-container">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h3>No users found</h3>
              <p>No users match your current filters</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.name || 'N/A'}</div>
                          <div className="user-email">{user.email}</div>
                          {user.phone && (
                            <div className="user-phone">{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td>
                      <span 
                        className="role-badge"
                        style={{ backgroundColor: getRoleColor(user.role) }}
                      >
                        {user.role}
                      </span>
                    </td>
                    
                    <td>
                      <span className={`status-badge ${user.active !== false ? 'active' : 'inactive'}`}>
                        {user.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    
                    <td>
                      <span className="date-text">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    
                    <td>
                      <div className="location-info">
                        {user.city && user.state ? (
                          <span>{user.city}, {user.state}</span>
                        ) : (
                          <span className="text-muted">Not specified</span>
                        )}
                      </div>
                    </td>
                    
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className="action-btn view"
                          title="View details"
                        >
                          👁️
                        </button>
                        
                        <button
                          onClick={() => handleStatusToggle(user._id, user.active)}
                          className={`action-btn ${user.active !== false ? 'deactivate' : 'activate'}`}
                          title={user.active !== false ? 'Deactivate user' : 'Activate user'}
                        >
                          {user.active !== false ? '⏸️' : '▶️'}
                        </button>
                        
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="action-btn delete"
                            title="Delete user"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="user-profile">
                <div className="profile-avatar">
                  {selectedUser.name?.[0]?.toUpperCase() || '?'}
                </div>
                
                <div className="profile-info">
                  <h4>{selectedUser.name || 'Unknown User'}</h4>
                  <p className="profile-email">{selectedUser.email}</p>
                  <span 
                    className="profile-role"
                    style={{ backgroundColor: getRoleColor(selectedUser.role) }}
                  >
                    {selectedUser.role}
                  </span>
                </div>
              </div>
              
              <div className="profile-details">
                <div className="detail-group">
                  <label>Phone:</label>
                  <span>{selectedUser.phone || 'Not provided'}</span>
                </div>
                
                <div className="detail-group">
                  <label>Address:</label>
                  <span>
                    {selectedUser.address || 'Not provided'}
                    {selectedUser.city && selectedUser.state && (
                      <><br />{selectedUser.city}, {selectedUser.state} {selectedUser.zipCode}</>
                    )}
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Status:</label>
                  <span className={`status-badge ${selectedUser.active !== false ? 'active' : 'inactive'}`}>
                    {selectedUser.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Member Since:</label>
                  <span>{formatDate(selectedUser.createdAt)}</span>
                </div>
                
                {selectedUser.bio && (
                  <div className="detail-group">
                    <label>Bio:</label>
                    <span>{selectedUser.bio}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              
              <button
                onClick={() => handleStatusToggle(selectedUser._id, selectedUser.active)}
                className={`btn ${selectedUser.active !== false ? 'btn-warning' : 'btn-success'}`}
              >
                {selectedUser.active !== false ? 'Deactivate' : 'Activate'} User
              </button>
              
              {selectedUser.role !== 'admin' && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleDeleteUser(selectedUser._id);
                  }}
                  className="btn btn-danger"
                >
                  Delete User
                </button>
              )}
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUsersPage;
