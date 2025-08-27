import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import './Dashboard.css';

const ProviderServicesPage = () => {
  const [services, setServices] = useState([]);
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
    // Mock data for provider's services
    setServices([
      {
        id: 1,
        title: 'House Cleaning',
        description: 'Deep cleaning service for residential homes',
        category: 'Cleaning',
        price: 50,
        duration: '2-3 hours',
        isActive: true,
        bookings: 25,
        rating: 4.8,
        earnings: 1250
      },
      {
        id: 2,
        title: 'Window Cleaning',
        description: 'Professional window cleaning inside and out',
        category: 'Cleaning',
        price: 35,
        duration: '1-2 hours',
        isActive: true,
        bookings: 15,
        rating: 4.9,
        earnings: 525
      },
      {
        id: 3,
        title: 'Post-Construction Cleanup',
        description: 'Thorough cleaning after construction or renovation',
        category: 'Cleaning',
        price: 120,
        duration: '4-6 hours',
        isActive: false,
        bookings: 8,
        rating: 4.7,
        earnings: 960
      }
    ]);
  }, []);

  const handleAddService = () => {
    if (newService.title && newService.description && newService.category && newService.price) {
      const service = {
        id: services.length + 1,
        ...newService,
        price: parseFloat(newService.price),
        bookings: 0,
        rating: 0,
        earnings: 0
      };
      setServices([...services, service]);
      setNewService({
        title: '',
        description: '',
        category: '',
        price: '',
        duration: '',
        isActive: true
      });
      setShowAddModal(false);
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setNewService(service);
    setShowAddModal(true);
  };

  const handleUpdateService = () => {
    setServices(services.map(service => 
      service.id === editingService.id 
        ? { ...service, ...newService, price: parseFloat(newService.price) }
        : service
    ));
    setEditingService(null);
    setNewService({
      title: '',
      description: '',
      category: '',
      price: '',
      duration: '',
      isActive: true
    });
    setShowAddModal(false);
  };

  const toggleServiceStatus = (serviceId) => {
    setServices(services.map(service =>
      service.id === serviceId
        ? { ...service, isActive: !service.isActive }
        : service
    ));
  };

  const deleteService = (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(service => service.id !== serviceId));
    }
  };

  return (
    <div className="dashboard-page">
      <Header isLoggedIn={true} userType="provider" />
      <main className="dashboard-main">
        <div className="container-fluid px-3">
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <h1 className="h3 mb-0">Manage Services</h1>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add New Service
                </button>
              </div>
            </div>
          </div>

          {/* Services Overview Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card text-center">
                <div className="card-body">
                  <div className="display-6 fw-bold text-primary">{services.length}</div>
                  <div className="text-muted">Total Services</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card text-center">
                <div className="card-body">
                  <div className="display-6 fw-bold text-success">{services.filter(s => s.isActive).length}</div>
                  <div className="text-muted">Active Services</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card text-center">
                <div className="card-body">
                  <div className="display-6 fw-bold text-info">{services.reduce((sum, s) => sum + s.bookings, 0)}</div>
                  <div className="text-muted">Total Bookings</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card text-center">
                <div className="card-body">
                  <div className="display-6 fw-bold text-warning">${services.reduce((sum, s) => sum + s.earnings, 0)}</div>
                  <div className="text-muted">Total Earnings</div>
                </div>
              </div>
            </div>
          </div>

          {/* Services List */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Your Services</h5>
                </div>
                <div className="card-body">
                  {services.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="fs-1 mb-3">🔧</div>
                      <h4 className="mb-3">No services yet</h4>
                      <p className="text-muted mb-4">Start by adding your first service to attract customers.</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowAddModal(true)}
                      >
                        Add Your First Service
                      </button>
                    </div>
                  ) : (
                    <div className="row g-4">
                      {services.map(service => (
                        <div key={service.id} className="col-12 col-md-6 col-lg-4">
                          <div className={`card h-100 ${!service.isActive ? 'opacity-75' : ''}`}>
                            <div className="card-header d-flex justify-content-between align-items-center">
                              <h6 className="card-title mb-0">{service.title}</h6>
                              <span className={`badge ${service.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                {service.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="card-body">
                              <p className="card-text text-muted small mb-3">{service.description}</p>
                              
                              <div className="row g-2 mb-3">
                                <div className="col-6">
                                  <div className="bg-light p-2 rounded text-center">
                                    <div className="fw-bold text-success">${service.price}</div>
                                    <small className="text-muted">Price</small>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="bg-light p-2 rounded text-center">
                                    <div className="fw-bold text-info">{service.duration}</div>
                                    <small className="text-muted">Duration</small>
                                  </div>
                                </div>
                              </div>

                              <div className="row g-2 mb-3">
                                <div className="col-4">
                                  <div className="text-center">
                                    <div className="fw-bold">{service.bookings}</div>
                                    <small className="text-muted">Bookings</small>
                                  </div>
                                </div>
                                <div className="col-4">
                                  <div className="text-center">
                                    <div className="fw-bold">⭐ {service.rating || 'N/A'}</div>
                                    <small className="text-muted">Rating</small>
                                  </div>
                                </div>
                                <div className="col-4">
                                  <div className="text-center">
                                    <div className="fw-bold text-success">${service.earnings}</div>
                                    <small className="text-muted">Earned</small>
                                  </div>
                                </div>
                              </div>

                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-outline-primary btn-sm flex-fill"
                                  onClick={() => handleEditService(service)}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  className={`btn btn-sm ${service.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                  onClick={() => toggleServiceStatus(service.id)}
                                >
                                  {service.isActive ? '⏸️' : '▶️'}
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => deleteService(service.id)}
                                >
                                  🗑️
                                </button>
                              </div>
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

          {/* Add/Edit Service Modal */}
          {showAddModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                  <button 
                    className="close-btn"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingService(null);
                      setNewService({
                        title: '',
                        description: '',
                        category: '',
                        price: '',
                        duration: '',
                        isActive: true
                      });
                    }}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="form-group">
                    <label>Service Title</label>
                    <input
                      type="text"
                      value={newService.title}
                      onChange={(e) => setNewService({...newService, title: e.target.value})}
                      placeholder="Enter service title"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newService.description}
                      onChange={(e) => setNewService({...newService, description: e.target.value})}
                      placeholder="Describe your service"
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={newService.category}
                        onChange={(e) => setNewService({...newService, category: e.target.value})}
                      >
                        <option value="">Select category</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Handyman">Handyman</option>
                        <option value="Pet Care">Pet Care</option>
                        <option value="Gardening">Gardening</option>
                        <option value="Moving">Moving</option>
                        <option value="Beauty">Beauty</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Price ($)</label>
                      <input
                        type="number"
                        value={newService.price}
                        onChange={(e) => setNewService({...newService, price: e.target.value})}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={newService.duration}
                      onChange={(e) => setNewService({...newService, duration: e.target.value})}
                      placeholder="e.g., 2-3 hours"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newService.isActive}
                        onChange={(e) => setNewService({...newService, isActive: e.target.checked})}
                      />
                      Active (visible to customers)
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    className="action-btn secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingService(null);
                      setNewService({
                        title: '',
                        description: '',
                        category: '',
                        price: '',
                        duration: '',
                        isActive: true
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="action-btn primary"
                    onClick={editingService ? handleUpdateService : handleAddService}
                  >
                    {editingService ? 'Update Service' : 'Add Service'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProviderServicesPage;
