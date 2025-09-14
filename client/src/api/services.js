import api from './client';

// Helper function to transform service data
const transformService = (service) => {
  if (!service) return service;
  return {
    ...service,
    id: service._id || service.id
  };
};

const transformServices = (services) => {
  if (!Array.isArray(services)) return services;
  return services.map(transformService);
};

// =================== SERVICES API ===================
export const getServices = (params = {}) => 
  api.get('/services', { params }).then(r => transformServices(r.data.services || []));

export const getService = (id) => 
  api.get(`/services/${id}`).then(r => transformService(r.data.service || r.data));

export const searchServices = (query, filters = {}) => 
  api.get('/services/search', { params: { q: query, ...filters } }).then(r => transformServices(r.data.services || []));

export const getFeaturedServices = () => 
  api.get('/services/featured').then(r => transformServices(r.data.services || []));

export const getServicesByCategory = (category) => 
  api.get('/services', { params: { category } }).then(r => transformServices(r.data.services || []));

// =================== BOOKINGS API ===================
export const createBooking = (bookingData) => 
  api.post('/bookings', bookingData).then(r => r.data);

export const getBookings = (params = {}) => 
  api.get('/bookings', { params }).then(r => r.data);

export const getBooking = (id) => 
  api.get(`/bookings/${id}`).then(r => r.data);

export const updateBooking = (id, data) => 
  api.put(`/bookings/${id}/status`, data).then(r => r.data);

export const cancelBooking = (id) => 
  api.put(`/bookings/${id}/cancel`).then(r => r.data);

// =================== REVIEWS API ===================
export const getReviews = (serviceId) => 
  api.get(`/reviews/service/${serviceId}`).then(r => r.data);

export const createReview = (reviewData) => 
  api.post('/reviews', reviewData).then(r => r.data);

export const getUserReviews = () => 
  api.get('/reviews/user').then(r => r.data);

// =================== MESSAGES API ===================
export const getConversations = () => 
  api.get('/messages/conversations').then(r => r.data);

export const getMessages = (userId) => 
  api.get(`/messages/conversation/${userId}`).then(r => r.data);

export const sendMessage = (messageData) => 
  api.post('/messages/send', messageData).then(r => r.data);

export const markMessagesAsRead = (conversationData) => 
  api.put('/messages/mark-read', conversationData).then(r => r.data);

// =================== USER DASHBOARD API ===================
export const getUserDashboard = () => 
  api.get('/users/me/dashboard').then(r => r.data);

export const getUserStats = () => 
  api.get('/users/me/stats').then(r => r.data);

// =================== ADMIN API ===================
export const getAdminDashboard = () => 
  api.get('/admin/dashboard').then(r => r.data);

export const getAdminStats = () => 
  api.get('/admin/dashboard').then(r => r.data);

export const getAllUsers = (params = {}) => 
  api.get('/admin/users', { params }).then(r => r.data);

export const updateUserStatus = (userId, status) => 
  api.put(`/admin/users/${userId}`, { status }).then(r => r.data);

export const deleteUser = (userId) => 
  api.delete(`/admin/users/${userId}`).then(r => r.data);

export const getAllBookings = (params = {}) => 
  api.get('/admin/bookings', { params }).then(r => r.data);

export const getAllServices = (params = {}) => 
  api.get('/admin/services', { params }).then(r => r.data);

export const getAllReviews = (params = {}) => 
  api.get('/admin/reviews', { params }).then(r => r.data);

export const getAdminReports = (type = 'overview', params = {}) => 
  api.get('/admin/reports', { params: { type, ...params } }).then(r => r.data);

// Additional Admin API functions
export const deleteService = (serviceId) =>
  api.delete(`/admin/services/${serviceId}`).then(r => r.data);

// =================== ADMIN API OBJECT ===================
export const adminAPI = {
  // Dashboard
  getAdminDashboard,
  getAdminStats,
  getDashboardStats: getAdminDashboard,
  
  // Users
  getAllUsers,
  updateUserStatus,
  deleteUser,
  
  // Services
  getAllServices,
  deleteService,
  
  // Bookings
  getAllBookings,
  
  // Reviews
  getAllReviews,
  
  // Reports
  getAdminReports,
  getReports: (type, params) => getAdminReports(type, params)
};

// =================== BOOKING API OBJECT ===================
export const bookingAPI = {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking
};

// =================== SERVICE API OBJECT ===================
export const serviceAPI = {
  getServices,
  getService,
  searchServices,
  getFeaturedServices,
  getServicesByCategory
};

// =================== REVIEW API OBJECT ===================
export const reviewAPI = {
  getReviews,
  createReview,
  getUserReviews
};

// =================== CATEGORIES API ===================
export const getCategories = () => 
  api.get('/services/categories').then(r => r.data.categories || []);

// Export all as a single object for easy import
const servicesAPI = {
  // Services
  getServices,
  getService,
  searchServices,
  getFeaturedServices,
  getServicesByCategory,
  
  // Bookings
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  
  // Reviews
  getReviews,
  createReview,
  getUserReviews,
  
  // Messages
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  
  // User Dashboard
  getUserDashboard,
  getUserStats,
  
  // Admin
  getAdminDashboard,
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllBookings,
  getAllServices,
  getAllReviews,
  getAdminReports,
  
  // Categories
  getCategories
};

export default servicesAPI;
