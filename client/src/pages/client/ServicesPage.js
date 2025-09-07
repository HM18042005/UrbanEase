import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import ServiceCard from '../../components/ServiceCard';
import { getServices, searchServices, getServicesByCategory } from '../../api/services';
import './ServicesPage.css';

const ServicesPage = () => {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Services');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = [
    'All Services',
    'Cleaning',
    'Handyman',
    'Pet Care',
    'Fitness',
    'Moving',
    'Gardening',
    'Beauty',
    'Tutoring',
    'Photography'
  ];

  // Get search and category from URL params
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      let servicesData = [];

      if (searchQuery) {
        // Search for services
        servicesData = await searchServices(searchQuery);
      } else if (categoryFilter && categoryFilter !== 'All Services') {
        // Get services by category
        servicesData = await getServicesByCategory(categoryFilter);
      } else {
        // Get all services
        servicesData = await getServices();
      }

      setServices(servicesData || []);
      setFilteredServices(servicesData || []);
      
      if (categoryFilter) {
        setActiveCategory(categoryFilter);
      }
      
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    
    if (category === 'All Services') {
      setFilteredServices(services);
    } else {
      setFilteredServices(services.filter(service => 
        service.category?.toLowerCase() === category.toLowerCase()
      ));
    }
  };

  return (
    <div className="services-page">
      <Header />
      <main className="services-main">
        <div className="container">
          <div className="services-header">
            <h1 className="page-title">
              {searchQuery ? `Search Results for "${searchQuery}"` : 
               categoryFilter ? `${categoryFilter} Services` : 'Our Services'}
            </h1>
            <p className="page-subtitle">
              {loading ? 'Loading...' : 
               error ? 'Failed to load services' :
               'Find the perfect service for your needs'}
            </p>
          </div>

          <div className="category-tabs">
            {categories.map(category => (
              <button
                key={category}
                className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="services-content">
            <div className="services-header-info">
              <h2 className="category-title">{activeCategory}</h2>
              <span className="services-count">
                {loading ? 'Loading...' : 
                 error ? 'Error loading services' :
                 `${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''} found`}
              </span>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner">Loading services...</div>
              </div>
            ) : error ? (
              <div className="error-container">
                <div className="error-message">
                  <h3>Failed to Load Services</h3>
                  <p>{error}</p>
                  <button 
                    className="retry-button"
                    onClick={fetchServices}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {filteredServices.length > 0 ? (
                  filteredServices.map(service => (
                    <div key={service.id || service._id} className="col-12 col-md-6 col-lg-4">
                      <ServiceCard service={service} />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="no-services">
                      <div className="no-services-icon">🔍</div>
                      <h3>No services found</h3>
                      <p>
                        {searchQuery 
                          ? `No services found for "${searchQuery}". Try a different search term.`
                          : `No services found for the selected category. Try selecting a different category.`}
                      </p>
                      <button 
                        className="browse-all-button"
                        onClick={() => handleCategoryChange('All Services')}
                      >
                        Browse All Services
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServicesPage;
