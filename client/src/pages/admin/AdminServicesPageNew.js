import { useEffect, useMemo, useState } from 'react';

import { adminAPI } from '../../api/services';
import Header from '../../components/Header';
import './AdminDashboard.css';

/**
 * AdminServicesPage Component
 *
 * What: Service management interface for administrators
 * When: Admin needs to monitor, approve, and manage all platform services
 * Why: Provides centralized service administration with approval workflows
 *
 * Features:
 * - Service list with search and filtering
 * - Service approval/rejection workflow
 * - Service status management
 * - Service performance analytics
 * - Service detail modal for full information
 */
const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Service statistics
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.status === 'active').length;
    const pending = services.filter((s) => s.status === 'pending').length;
    const suspended = services.filter((s) => s.status === 'suspended').length;
    const categories = [...new Set(services.map((s) => s.category))].length;
    const avgRating =
      services.length > 0
        ? services.reduce((sum, s) => sum + (s.averageRating || 0), 0) / services.length
        : 0;

    return { total, active, pending, suspended, categories, avgRating };
  }, [services]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch real services data from API
      const servicesData = await adminAPI.getAllServices();
      setServices(servicesData || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (serviceId, newStatus) => {
    try {
      // Update service status via API
      await adminAPI.updateServiceStatus(serviceId, newStatus);

      // Update local state
      setServices(
        services.map((service) =>
          service._id === serviceId ? { ...service, status: newStatus } : service
        )
      );
    } catch (err) {
      console.error('Error updating service status:', err);
      setError(err.response?.data?.message || 'Failed to update service status');
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || service.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [services, searchTerm, categoryFilter, statusFilter]);

  const categories = useMemo(() => {
    return [...new Set(services.map((s) => s.category))];
  }, [services]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'suspended':
        return '#ef4444';
      case 'inactive':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
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
                <p>Loading services...</p>
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
                  <span className="breadcrumb-item current">Service Management</span>
                </div>
                <h1>Service Management</h1>
                <p>Monitor and manage all platform services</p>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
                <button className="alert-close" onClick={() => setError('')}>
                  ×
                </button>
              </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total Services</div>
                </div>
                <div className="stat-icon">🛠️</div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{stats.active}</div>
                  <div className="stat-label">Active</div>
                </div>
                <div className="stat-icon">✅</div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{stats.pending}</div>
                  <div className="stat-label">Pending</div>
                </div>
                <div className="stat-icon">⏳</div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{stats.suspended}</div>
                  <div className="stat-label">Suspended</div>
                </div>
                <div className="stat-icon">⛔</div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-value">{stats.avgRating.toFixed(1)}</div>
                  <div className="stat-label">Avg Rating</div>
                </div>
                <div className="stat-icon">⭐</div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="admin-card">
              <div className="filters-section">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search services, descriptions, providers, or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>

                <div className="filter-controls">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <button onClick={fetchServices} className="refresh-btn" title="Refresh services">
                    🔄
                  </button>
                </div>
              </div>
            </div>

            {/* Services Table */}
            <div className="admin-card">
              <div className="card-header">
                <h3>Services ({filteredServices.length})</h3>
              </div>

              <div className="table-container">
                {filteredServices.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🛠️</div>
                    <h3>No services found</h3>
                    <p>No services match your current filters</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Provider</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Rating</th>
                        <th>Bookings</th>
                        <th>Created</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((service) => (
                        <tr key={service._id}>
                          <td>
                            <div className="service-info">
                              <div className="service-name">{service.title || 'N/A'}</div>
                              <div className="service-description">
                                {service.description?.length > 60
                                  ? `${service.description.substring(0, 60)}...`
                                  : service.description || 'No description'}
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="user-info">
                              <div className="user-avatar">
                                {service.providerName?.[0]?.toUpperCase() || 'P'}
                              </div>
                              <div className="user-details">
                                <div className="user-name">{service.providerName || 'N/A'}</div>
                                <div className="user-email">{service.providerEmail}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="category-badge">{service.category || 'Other'}</span>
                          </td>

                          <td>
                            <span className="price-text">{formatCurrency(service.price)}</span>
                          </td>

                          <td>
                            <div className="rating-cell">
                              <span className="stars">
                                {renderStars(service.averageRating || 0)}
                              </span>
                              <span className="rating-number">
                                ({(service.averageRating || 0).toFixed(1)})
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="bookings-count">{service.totalBookings || 0}</span>
                          </td>

                          <td>
                            <span className="date-text">{formatDate(service.createdAt)}</span>
                          </td>

                          <td>
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor: getStatusColor(service.status),
                                color: 'white',
                              }}
                            >
                              {service.status}
                            </span>
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() => {
                                  setSelectedService(service);
                                  setShowModal(true);
                                }}
                                className="action-btn view"
                                title="View details"
                              >
                                👁️
                              </button>

                              {service.status === 'pending' && (
                                <button
                                  onClick={() => handleStatusUpdate(service._id, 'active')}
                                  className="action-btn activate"
                                  title="Approve service"
                                >
                                  ✅
                                </button>
                              )}

                              {service.status === 'active' && (
                                <button
                                  onClick={() => handleStatusUpdate(service._id, 'suspended')}
                                  className="action-btn delete"
                                  title="Suspend service"
                                >
                                  ⛔
                                </button>
                              )}

                              {service.status === 'suspended' && (
                                <button
                                  onClick={() => handleStatusUpdate(service._id, 'active')}
                                  className="action-btn activate"
                                  title="Reactivate service"
                                >
                                  🔄
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

            {/* Service Detail Modal */}
            {showModal && selectedService && (
              <div
                className="modal-overlay"
                role="button"
                tabIndex={0}
                aria-label="Close modal"
                onClick={(e) => {
                  if (e.currentTarget === e.target) setShowModal(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowModal(false);
                  }
                }}
              >
                <div
                  className="modal-content user-modal"
                  role="dialog"
                  aria-modal="true"
                  tabIndex={-1}
                >
                  <div className="modal-header">
                    <h3>Service Details</h3>
                    <button className="modal-close" onClick={() => setShowModal(false)}>
                      ×
                    </button>
                  </div>

                  <div className="modal-body">
                    <div className="service-profile">
                      <div className="profile-info">
                        <h4>{selectedService.title}</h4>
                        <p className="profile-email">{selectedService.category}</p>
                        <span
                          className="profile-role"
                          style={{ backgroundColor: getStatusColor(selectedService.status) }}
                        >
                          {selectedService.status}
                        </span>
                      </div>
                    </div>

                    <div className="profile-details">
                      <dl className="detail-list">
                        <div className="detail-group">
                          <dt>Description:</dt>
                          <dd style={{ whiteSpace: 'pre-wrap' }}>
                            {selectedService.description || 'No description provided'}
                          </dd>
                        </div>

                        <div className="detail-group">
                          <dt>Provider:</dt>
                          <dd>
                            {selectedService.providerName} ({selectedService.providerEmail})
                          </dd>
                        </div>

                        <div className="detail-group">
                          <dt>Category:</dt>
                          <dd>{selectedService.category}</dd>
                        </div>

                        <div className="detail-group">
                          <dt>Price:</dt>
                          <dd>{formatCurrency(selectedService.price)}</dd>
                        </div>

                        <div className="detail-group">
                          <dt>Rating:</dt>
                          <dd>
                            {renderStars(selectedService.averageRating || 0)} (
                            {(selectedService.averageRating || 0).toFixed(1)})
                          </dd>
                        </div>

                        <div className="detail-group">
                          <dt>Total Bookings:</dt>
                          <dd>{selectedService.totalBookings || 0}</dd>
                        </div>

                        <div className="detail-group">
                          <dt>Created:</dt>
                          <dd>{formatDate(selectedService.createdAt)}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Close
                    </button>

                    {selectedService.status === 'pending' && (
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedService._id, 'active');
                          setShowModal(false);
                        }}
                        className="btn btn-success"
                      >
                        Approve Service
                      </button>
                    )}

                    {selectedService.status === 'active' && (
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedService._id, 'suspended');
                          setShowModal(false);
                        }}
                        className="btn btn-danger"
                      >
                        Suspend Service
                      </button>
                    )}

                    {selectedService.status === 'suspended' && (
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedService._id, 'active');
                          setShowModal(false);
                        }}
                        className="btn btn-success"
                      >
                        Reactivate Service
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

export default AdminServicesPage;
