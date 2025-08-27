import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ServiceCard from '../components/ServiceCard';
import './ServicesPage.css';

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
        <div className="loading">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <Header />
      <div className="services-container">
        <div className="services-header">
          <h1>Our Services</h1>
          <p>Find the perfect service for your needs</p>
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="services-grid">
          {filteredServices.length > 0 ? (
            filteredServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            <div className="no-services">
              <p>No services found for the selected category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
