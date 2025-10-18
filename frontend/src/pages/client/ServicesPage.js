import { useState, useEffect, useCallback } from 'react';

import { useSearchParams } from 'react-router-dom';

import {
  getServices,
  searchServices,
  getServicesByCategory,
  advancedSearchServices,
} from '../../api/services';
import Header from '../../components/Header';
import ServiceCard from '../../components/ServiceCard';
import './ServicesPage.css';

const ServicesPage = () => {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Services');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sortBy: 'newest',
    location: '',
    radius: '50',
  });

  const categories = [
    'All Services',
    'Appliance Repair',
    'Carpentry',
    'Cleaning',
    'Electrical',
    'Flooring',
    'Gardening',
    'General Maintenance',
    'HVAC',
    'Home Security',
    'Interior Design',
    'Moving',
    'Painting',
    'Plumbing',
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
      setFilteredServices(
        services.filter((service) => service.category?.toLowerCase() === category.toLowerCase())
      );
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const applyAdvancedFilters = async () => {
    try {
      setLoading(true);
      setError('');

      const searchData = {
        query: searchQuery,
        categories: activeCategory !== 'All Services' ? [activeCategory] : [],
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        minRating: filters.minRating ? Number(filters.minRating) : undefined,
        location: filters.location || undefined,
        radius: Number(filters.radius),
        sortBy: filters.sortBy,
        page: 1,
        limit: 20,
      };

      const result = await advancedSearchServices(searchData);
      setServices(result.services || []);
      setFilteredServices(result.services || []);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sortBy: 'newest',
      location: '',
      radius: '50',
    });
    setActiveCategory('All Services');
    fetchServices();
  };

  return (
    <div className="services-page">
      <Header />
      <main className="services-main">
        <div className="container">
          <div className="services-header">
            <h1 className="page-title">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : categoryFilter
                  ? `${categoryFilter} Services`
                  : 'Our Services'}
            </h1>
            <p className="page-subtitle">
              {loading
                ? 'Loading...'
                : error
                  ? 'Failed to load services'
                  : 'Find the perfect service for your needs'}
            </p>
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="category-select" className="filter-label">
                Filter by Category:
              </label>
              <select
                id="category-select"
                className="category-dropdown"
                value={activeCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-select" className="filter-label">
                Sort by:
              </label>
              <select
                id="sort-select"
                className="sort-dropdown"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <button
              className="advanced-filters-toggle"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
            </button>
          </div>

          {showAdvancedFilters && (
            <div className="advanced-filters">
              <div className="filter-row">
                <div className="filter-group">
                  <label className="filter-label" htmlFor="min-price">
                    Price Range:
                  </label>
                  <div className="price-range">
                    <input
                      type="number"
                      id="min-price"
                      placeholder="Min Price"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="price-input"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      id="max-price"
                      placeholder="Max Price"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="price-input"
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label className="filter-label" htmlFor="min-rating">
                    Minimum Rating:
                  </label>
                  <select
                    id="min-rating"
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    className="rating-dropdown"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Stars</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label" htmlFor="location-input">
                    Location:
                  </label>
                  <input
                    type="text"
                    id="location-input"
                    placeholder="Enter city or address"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="location-input"
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label" htmlFor="radius-select">
                    Radius (km):
                  </label>
                  <select
                    id="radius-select"
                    value={filters.radius}
                    onChange={(e) => handleFilterChange('radius', e.target.value)}
                    className="radius-dropdown"
                  >
                    <option value="10">10 km</option>
                    <option value="25">25 km</option>
                    <option value="50">50 km</option>
                    <option value="100">100 km</option>
                  </select>
                </div>
              </div>

              <div className="filter-actions">
                <button className="apply-filters-btn" onClick={applyAdvancedFilters}>
                  Apply Filters
                </button>
                <button className="reset-filters-btn" onClick={resetFilters}>
                  Reset All
                </button>
              </div>
            </div>
          )}

          <div className="services-content">
            <div className="services-header-info">
              <h2 className="category-title">{activeCategory}</h2>
              <span className="services-count">
                {loading
                  ? 'Loading...'
                  : error
                    ? 'Error loading services'
                    : `${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''} found`}
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
                  <button className="retry-button" onClick={fetchServices}>
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
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
