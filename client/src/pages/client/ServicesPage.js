import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import ServiceCard from '../../components/ServiceCard';
import '../ServicesPage.css';

// Mock services data
const mockServices = [
  {
    id: 1,
    title: 'Home Cleaning',
    description: 'Professional home cleaning services.',
    price: 50,
    rating: 4.5,
    category: 'Cleaning',
    image: '/api/placeholder/300/200',
    startingPrice: 30
  },
  {
    id: 2,
    title: 'Plumbing Repair',
    description: 'Expert plumbing services for all your needs.',
    price: 80,
    rating: 4.8,
    category: 'Handyman',
    image: '/api/placeholder/300/200',
    startingPrice: 50
  },
  {
    id: 3,
    title: 'Dog Walking',
    description: 'Reliable dog walking services.',
    price: 25,
    rating: 4.7,
    category: 'Pet Care',
    image: '/api/placeholder/300/200',
    startingPrice: 15
  }
];

const ServicesPage = () => {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Services');
  const [loading, setLoading] = useState(true);

  const categories = [
    'All Services',
    'Cleaning',
    'Handyman',
    'Pet Care'
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setServices(mockServices);
      setFilteredServices(mockServices);
      setLoading(false);
    }, 500);

    const category = searchParams.get('category');
    if (category) {
      setActiveCategory(category);
    }
  }, [searchParams]);

  const filterServices = useCallback(() => {
    let filtered = services;
    
    if (activeCategory !== 'All Services') {
      filtered = filtered.filter(service => service.category === activeCategory);
    }

    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [services, activeCategory, searchParams]);

  useEffect(() => {
    filterServices();
  }, [filterServices]);

  if (loading) {
    return (
      <div className="services-page">
        <Header />
        <main className="services-main">
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner">Loading services...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="services-page">
      <Header />
      <main className="services-main">
        <div className="container">
          <div className="services-header">
            <h1 className="page-title">Our Services</h1>
            <p className="page-subtitle">Find the perfect service for your needs</p>
          </div>

          <div className="category-tabs">
            {categories.map(category => (
              <button
                key={category}
                className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="services-content">
            <div className="services-header-info">
              <h2 className="category-title">{activeCategory}</h2>
              <span className="services-count">
                {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
              </span>
            </div>

            <div className="row g-4">
              {filteredServices.length > 0 ? (
                filteredServices.map(service => (
                  <div key={service.id} className="col-12 col-md-6 col-lg-4">
                    <ServiceCard service={service} />
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="no-services">
                    <div className="no-services-icon">🔍</div>
                    <h3>No services found</h3>
                    <p>No services found for the selected category. Try selecting a different category.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServicesPage;
