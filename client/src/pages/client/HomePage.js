import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { getCategories, getFeaturedServices } from '../../api/services';
import Header from '../../components/Header';
import ServiceCard from '../../components/ServiceCard';
import './HomePage.css';
import { getCategoryImage, getDefaultImage } from '../../utils/categoryImages';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch featured services and categories from API
        const [servicesData, categoriesData] = await Promise.all([
          getFeaturedServices().catch(() => []),
          getCategories().catch(() => []),
        ]);

        setFeaturedServices(servicesData || []);

        // Transform category strings into objects
        const transformedCategories = (categoriesData || []).map((categoryName, index) => ({
          id: index + 1,
          name: categoryName,
          description: `Professional ${categoryName.toLowerCase()} services`,
          image: getCategoryImage(categoryName, 'grid'),
          serviceCount: 0, // Will be updated when we have service counts
        }));

        setCategories(transformedCategories);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError('Failed to load homepage data');
        // Set empty arrays as fallback
        setFeaturedServices([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

            {loading ? (
              <div className="loading-state">
                <p>Loading services...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>Error: {error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
              </div>
            ) : featuredServices.length === 0 ? (
              <div className="empty-state">
                <p>No featured services available at the moment.</p>
              </div>
            ) : (
              <div className="services-grid medium">
                {featuredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} size="medium" />
                ))}
              </div>
            )}
          </section>

          {/* Categories section removed as requested */}

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
