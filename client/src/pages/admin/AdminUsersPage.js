
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import '../AdminDashboard.css';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // Mock users data
    setUsers([
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        role: 'customer',
        status: 'active',
        joinDate: '2025-01-15',
        lastActive: '2025-08-27',
        totalBookings: 12,
        totalSpent: 560,
        rating: 4.8
      },
      {
        id: 2,
        name: 'Mike Davis',
        email: 'mike.davis@email.com',
        role: 'provider',
        status: 'active',
        joinDate: '2024-12-08',
        lastActive: '2025-08-26',
        totalServices: 3,
        totalEarnings: 1850,
        rating: 4.7,
        completedJobs: 37
      },
      {
        id: 3,
        name: 'Emily Chen',
        email: 'emily.chen@email.com',
        role: 'customer',
        status: 'active',
        joinDate: '2025-02-20',
        lastActive: '2025-08-27',
        totalBookings: 8,
        totalSpent: 320,
        rating: 4.9
      },
      {
        id: 4,
        name: 'David Wilson',
        email: 'david.wilson@email.com',
        role: 'provider',
        status: 'suspended',
        joinDate: '2024-11-12',
        lastActive: '2025-08-20',
        totalServices: 2,
        totalEarnings: 940,
        rating: 3.8,
        completedJobs: 18
      },
      {
        id: 5,
        name: 'Lisa Anderson',
        email: 'lisa.anderson@email.com',
        role: 'customer',
        status: 'inactive',
        joinDate: '2025-03-10',
        lastActive: '2025-07-15',
        totalBookings: 3,
        totalSpent: 150,
        rating: 4.5
      }
    ]);
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const handleUserAction = (userId, action) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'activate':
            return { ...user, status: 'active' };
          case 'suspend':
            return { ...user, status: 'suspended' };
          case 'deactivate':
            return { ...user, status: 'inactive' };
          default:
            return user;
        }
      }
      return user;
    }));
  };

  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'suspended': return '#F59E0B';
      case 'inactive': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'customer': return '👤';
      case 'provider': return '🔧';
      case 'admin': return '👑';
      default: return '👤';
    }
  };

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    customers: users.filter(u => u.role === 'customer').length,
    providers: users.filter(u => u.role === 'provider').length,
    suspended: users.filter(u => u.status === 'suspended').length
  };

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
          <Link to="/admin/users" className="nav-item active">
            <span className="nav-icon">👥</span>
            Users
          </Link>
          <Link to="/admin/services" className="nav-item">
            <span className="nav-icon">🔧</span>
            Services
          </Link>
          <Link to="/admin/bookings" className="nav-item">
            <span className="nav-icon">📅</span>
            Bookings
          </Link>
          <Link to="/admin/reviews" className="nav-item">
            <span className="nav-icon">⭐</span>
            Reviews
          </Link>
          <Link to="/admin/reports" className="nav-item">
            <span className="nav-icon">📈</span>
            Reports
          </Link>
        </nav>
      </div>

      <div className="admin-main">
        <Header />
        <div className="admin-content">
          <div className="admin-header">
            <h1 className="admin-title">User Management</h1>
          </div>

          {/* User Statistics */}
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-number">{userStats.total}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{userStats.active}</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{userStats.customers}</div>
              <div className="stat-label">Customers</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{userStats.providers}</div>
              <div className="stat-label">Providers</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{userStats.suspended}</div>
              <div className="stat-label">Suspended</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="users-controls">
            <div className="search-section">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-section">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="provider">Providers</option>
                <option value="admin">Admins</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Users List */}
          <div className="users-list">
            <div className="list-header">
              <h3>Users ({filteredUsers.length})</h3>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="no-users">
                <div className="no-users-icon">👥</div>
                <h4>No users found</h4>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="users-table">
                <div className="table-header">
                  <span>User</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span>Join Date</span>
                  <span>Activity</span>
                  <span>Actions</span>
                </div>

                {filteredUsers.map(user => (
                  <div key={user.id} className="table-row">
                    <div className="user-cell">
                      <div className="user-avatar">
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>

                    <div className="role-cell">
                      <span className={`role-badge ${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>

                    <div className="status-cell">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(user.status) }}
                      >
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </div>

                    <div className="date-cell">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </div>

                    <div className="activity-cell">
                      <div className="activity-info">
                        {user.role === 'customer' ? (
                          <>
                            <span>{user.totalBookings} bookings</span>
                            <span>${user.totalSpent} spent</span>
                          </>
                        ) : (
                          <>
                            <span>{user.completedJobs} jobs</span>
                            <span>${user.totalEarnings} earned</span>
                          </>
                        )}
                      </div>
                      <div className="last-active">
                        Last: {new Date(user.lastActive).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="actions-cell">
                      <button 
                        className="action-btn view"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                      >
                        👁️
                      </button>
                      
                      {user.status === 'active' ? (
                        <button 
                          className="action-btn suspend"
                          onClick={() => handleUserAction(user.id, 'suspend')}
                        >
                          ⏸️
                        </button>
                      ) : (
                        <button 
                          className="action-btn activate"
                          onClick={() => handleUserAction(user.id, 'activate')}
                        >
                          ▶️
                        </button>
                      )}
                      
                      <button 
                        className="action-btn delete"
                        onClick={() => deleteUser(user.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Details Modal */}
          {showUserModal && selectedUser && (
            <div className="modal-overlay">
              <div className="modal-content user-modal">
                <div className="modal-header">
                  <h3>User Details</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowUserModal(false)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="user-profile">
                    <div className="profile-header">
                      <div className="profile-avatar">
                        {getRoleIcon(selectedUser.role)}
                      </div>
                      <div className="profile-info">
                        <h4>{selectedUser.name}</h4>
                        <p>{selectedUser.email}</p>
                        <span 
                          className="profile-status"
                          style={{ backgroundColor: getStatusColor(selectedUser.status) }}
                        >
                          {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="profile-details">
                      <div className="detail-item">
                        <label>Role:</label>
                        <span>{selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}</span>
                      </div>
                      <div className="detail-item">
                        <label>Member Since:</label>
                        <span>{new Date(selectedUser.joinDate).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <label>Last Active:</label>
                        <span>{new Date(selectedUser.lastActive).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <label>Rating:</label>
                        <span>⭐ {selectedUser.rating}</span>
                      </div>
                      
                      {selectedUser.role === 'customer' ? (
                        <>
                          <div className="detail-item">
                            <label>Total Bookings:</label>
                            <span>{selectedUser.totalBookings}</span>
                          </div>
                          <div className="detail-item">
                            <label>Total Spent:</label>
                            <span>${selectedUser.totalSpent}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="detail-item">
                            <label>Services Offered:</label>
                            <span>{selectedUser.totalServices}</span>
                          </div>
                          <div className="detail-item">
                            <label>Completed Jobs:</label>
                            <span>{selectedUser.completedJobs}</span>
                          </div>
                          <div className="detail-item">
                            <label>Total Earnings:</label>
                            <span>${selectedUser.totalEarnings}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <div className="user-actions">
                    {selectedUser.status === 'active' ? (
                      <button 
                        className="action-btn warning"
                        onClick={() => {
                          handleUserAction(selectedUser.id, 'suspend');
                          setShowUserModal(false);
                        }}
                      >
                        Suspend User
                      </button>
                    ) : (
                      <button 
                        className="action-btn success"
                        onClick={() => {
                          handleUserAction(selectedUser.id, 'activate');
                          setShowUserModal(false);
                        }}
                      >
                        Activate User
                      </button>
                    )}
                    
                    <button 
                      className="action-btn danger"
                      onClick={() => {
                        deleteUser(selectedUser.id);
                        setShowUserModal(false);
                      }}
                    >
                      Delete User
                    </button>
                    
                    <button 
                      className="action-btn secondary"
                      onClick={() => setShowUserModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
