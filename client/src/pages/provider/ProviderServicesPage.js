import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { api } from '../../api/provider';
import './Dashboard.css';

const ProviderServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    isActive: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.getServices();
      setServices(response.data.services);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (newService.title && newService.description && newService.category && newService.price) {
      try {
        const serviceData = {
          ...newService,
          price: parseFloat(newService.price)
        };
        const response = await api.createService(serviceData);
        setServices([...services, response.data.service]);
        resetForm();
        setShowAddModal(false);
      } catch (error) {
        console.error('Error creating service:', error);
        setError('Failed to create service');
      }
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setNewService({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price.toString(),
      duration: service.duration,
      isActive: service.isActive
    });
    setShowAddModal(true);
  };

  const handleUpdateService = async () => {
    try {
      const serviceData = {
        ...newService,
        price: parseFloat(newService.price)
      };
      const response = await api.updateService(editingService._id, serviceData);
      setServices(services.map(service => 
        service._id === editingService._id ? response.data.service : service
      ));
      resetForm();
      setEditingService(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error updating service:', error);
      setError('Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.deleteService(serviceId);
        setServices(services.filter(service => service._id !== serviceId));
      } catch (error) {
        console.error('Error deleting service:', error);
        setError('Failed to delete service');
      }
    }
  };

  const handleToggleStatus = async (serviceId) => {
    try {
      const response = await api.toggleServiceStatus(serviceId);
      setServices(services.map(service => 
        service._id === serviceId ? response.data.service : service
      ));
    } catch (error) {
      console.error('Error toggling service status:', error);
      setError('Failed to update service status');
    }
  };

  const resetForm = () => {
    setNewService({
      title: '',
      description: '',
      category: '',
      price: '',
      duration: '',
      isActive: true
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingService(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Header />
        <main className="dashboard-main">
          <div className="container">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Header />
      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="page-title">My Services</h1>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <i className="fas fa-plus"></i> Add New Service
            </button>
          </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError('')}
              ></button>
            </div>
          )}

          {/* Services Grid */}
          <div className="row g-4">
            {services.map(service => (
              <div key={service._id} className="col-lg-6 col-xl-4">
                <div className="card service-card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">{service.title}</h5>
                    <div className="service-actions dropdown">
                      <button 
                        className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                        type="button" 
                        data-bs-toggle="dropdown"
                      >
                        Actions
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button 
                            className="dropdown-item"
                            onClick={() => handleEditService(service)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                        </li>
                        <li>
                          <button 
                            className="dropdown-item"
                            onClick={() => handleToggleStatus(service._id)}
                          >
                            <i className={`fas fa-${service.isActive ? 'pause' : 'play'}`}></i>
                            {service.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button 
                            className="dropdown-item text-danger"
                            onClick={() => handleDeleteService(service._id)}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <p className="card-text text-muted">{service.description}</p>
                    
                    <div className="service-details">
                      <div className="detail-item">
                        <span className="detail-label">Category:</span>
                        <span className="badge bg-secondary">{service.category}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Price:</span>
                        <span className="detail-value">${service.price}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Duration:</span>
                        <span className="detail-value">{service.duration}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className={`badge ${service.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {services.length === 0 && (
            <div className="text-center py-5">
              <div className="empty-state">
                <i className="fas fa-tools fa-3x text-muted mb-3"></i>
                <h3>No Services Yet</h3>
                <p className="text-muted">Start by adding your first service to attract customers.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Your First Service
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Service Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeModal}
                ></button>
              </div>
              
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Service Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newService.title}
                        onChange={(e) => setNewService({...newService, title: e.target.value})}
                        placeholder="e.g., House Cleaning"
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        value={newService.category}
                        onChange={(e) => setNewService({...newService, category: e.target.value})}
                      >
                        <option value="">Select category</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Gardening">Gardening</option>
                        <option value="Moving">Moving</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newService.description}
                      onChange={(e) => setNewService({...newService, description: e.target.value})}
                      placeholder="Describe your service in detail..."
                    ></textarea>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Price ($) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={newService.price}
                        onChange={(e) => setNewService({...newService, price: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Duration</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newService.duration}
                        onChange={(e) => setNewService({...newService, duration: e.target.value})}
                        placeholder="e.g., 2-3 hours"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={newService.isActive}
                        onChange={(e) => setNewService({...newService, isActive: e.target.checked})}
                      />
                      <label className="form-check-label">
                        Active (Available for booking)
                      </label>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={editingService ? handleUpdateService : handleAddService}
                >
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderServicesPage;
