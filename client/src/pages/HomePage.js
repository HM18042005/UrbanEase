import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import ServiceCard from '../components/ServiceCard';
import './HomePage.css';

/**
 * HomePage Component
 * 
 * What: Main dashboard showing featured services, categories, and search functionality
 * When: Displayed after user login, main navigation hub
 * Why: Provides easy access to all services and helps users discover what they need
 * 
 * Features:
 * - Search bar for services
 * - Featured services section
 * - Service categories grid
 * - Responsive design
 * - Quick access to popular services
 */
const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredServices, setFeaturedServices] = useState([]);
  const [categories, setCategories] = useState([]);

  // Mock data - would come from API in real app
  useEffect(() => {
    setFeaturedServices([
      {
        id: 1,
        title: 'Home Cleaning',
        description: 'Professional home cleaning services',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop',
        category: 'Cleaning',
        rating: 4.8,
        reviews: 125,
        startingPrice: 25
      },
      {
        id: 2,
        title: 'Handyman Services',
        description: 'Reliable handyman for all your needs',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=200&fit=crop',
        category: 'Handyman',
        rating: 4.9,
        reviews: 87,
        startingPrice: 35
      },
      {
        id: 3,
        title: 'Pet Sitting',
        description: 'Trusted care for your pets',
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop',
        category: 'Pet Care',
        rating: 4.7,
        reviews: 203,
        startingPrice: 20
      },
      {
        id: 4,
        title: 'Personal Training',
        description: 'Certified personal trainers',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
        category: 'Fitness',
        rating: 4.9,
        reviews: 156,
        startingPrice: 50
      }
    ]);

    setCategories([
      {
        id: 1,
        name: 'Moving & Packing',
        description: 'Efficient moving and packing solutions',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
        serviceCount: 24
      },
      {
        id: 2,
        name: 'Furniture Assembly',
        description: 'Expert furniture assembly services',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
        serviceCount: 18
      },
      {
        id: 3,
        name: 'Gardening',
        description: 'Professional gardening and landscaping',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
        serviceCount: 32
      },
      {
        id: 4,
        name: 'Car Washing',
        description: 'Convenient car washing at your location',
        image: 'https://images.unsplash.com/photo-1558584673-c834fb4d6f01?w=300&h=200&fit=crop',
        serviceCount: 15
      }
    ]);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to services page with search query
      window.location.href = `/services?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="home-page">
  <Header />
      
      <main className="home-main">
        <div className="container">
          {/* Hero Search Section */}
          <section className="hero-search">
            <div className="search-container">
              <form onSubmit={handleSearch} className="search-form-large">
                <input
                  type="text"
                  placeholder="Search for services"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-large"
                />
                <button type="submit" className="search-button">
                  🔍
                </button>
              </form>
            </div>
          </section>

          {/* Featured Services */}
          <section className="featured-section">
            <h2 className="section-title">Featured Services</h2>
            <div className="services-grid medium">
              {featuredServices.map(service => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  size="medium"
                />
              ))}
            </div>
          </section>

          {/* Categories */}
          <section className="categories-section">
            <h2 className="section-title">Categories</h2>
            <div className="categories-grid">
              {categories.map(category => (
                <Link 
                  key={category.id} 
                  to={`/services?category=${category.name}`}
                  className="category-card"
                >
                  <div className="category-image">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      onError={(e) => {
                        e.target.src = '/api/placeholder/300/200';
                      }}
                    />
                  </div>
                  <div className="category-content">
                    <h3 className="category-title">{category.name}</h3>
                    <p className="category-description">{category.description}</p>
                    <span className="category-count">
                      {category.serviceCount} services
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Stats */}
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">1,000+</div>
                <div className="stat-label">Services Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">500+</div>
                <div className="stat-label">Verified Providers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">4.8</div>
                <div className="stat-label">Average Rating</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Customer Support</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
