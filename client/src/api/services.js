import api from './client';

// =================== SERVICES API ===================
export const getServices = (params = {}) => 
  api.get('/services', { params }).then(r => r.data);

export const getService = (id) => 
  api.get(`/services/${id}`).then(r => r.data);

export const searchServices = (query, filters = {}) => 
  api.get('/services/search', { params: { q: query, ...filters } }).then(r => r.data);

export const getFeaturedServices = () => 
  api.get('/services/featured').then(r => r.data.services || []);

export const getServicesByCategory = (category) => 
  api.get(`/services/category/${category}`).then(r => r.data);

// =================== BOOKINGS API ===================
export const createBooking = (bookingData) => 
  api.post('/bookings', bookingData).then(r => r.data);

export const getBookings = (params = {}) => 
  api.get('/bookings', { params }).then(r => r.data);

export const getBooking = (id) => 
  api.get(`/bookings/${id}`).then(r => r.data);

export const updateBooking = (id, data) => 
  api.put(`/bookings/${id}`, data).then(r => r.data);

export const cancelBooking = (id) => 
  api.patch(`/bookings/${id}/cancel`).then(r => r.data);

// =================== REVIEWS API ===================
export const getReviews = (serviceId) => 
  api.get(`/reviews/service/${serviceId}`).then(r => r.data);

export const createReview = (reviewData) => 
  api.post('/reviews', reviewData).then(r => r.data);

export const getUserReviews = () => 
  api.get('/reviews/my-reviews').then(r => r.data);

// =================== MESSAGES API ===================
export const getConversations = () => 
  api.get('/messages/conversations').then(r => r.data);

export const getMessages = (conversationId) => 
  api.get(`/messages/${conversationId}`).then(r => r.data);

export const sendMessage = (messageData) => 
  api.post('/messages', messageData).then(r => r.data);

export const markMessagesAsRead = (conversationId) => 
  api.patch(`/messages/${conversationId}/read`).then(r => r.data);

// =================== USER DASHBOARD API ===================
export const getUserDashboard = () => 
  api.get('/user/dashboard').then(r => r.data);

export const getUserStats = () => 
  api.get('/user/stats').then(r => r.data);

// =================== ADMIN API ===================
export const getAdminDashboard = () => 
  api.get('/admin/dashboard').then(r => r.data);

export const getAdminStats = () => 
  api.get('/admin/stats').then(r => r.data);

export const getAllUsers = (params = {}) => 
  api.get('/admin/users', { params }).then(r => r.data);

export const updateUserStatus = (userId, status) => 
  api.patch(`/admin/users/${userId}/status`, { status }).then(r => r.data);

export const deleteUser = (userId) => 
  api.delete(`/admin/users/${userId}`).then(r => r.data);

export const getAllBookings = (params = {}) => 
  api.get('/admin/bookings', { params }).then(r => r.data);

export const getAllServices = (params = {}) => 
  api.get('/admin/services', { params }).then(r => r.data);

export const getAllReviews = (params = {}) => 
  api.get('/admin/reviews', { params }).then(r => r.data);

export const getAdminReports = (period = '30d') => 
  api.get(`/admin/reports?period=${period}`).then(r => r.data);

// Additional Admin API functions
export const updateBookingStatus = (bookingId, status) =>
  api.patch(`/admin/bookings/${bookingId}/status`, { status }).then(r => r.data);

export const updateServiceStatus = (serviceId, status) =>
  api.patch(`/admin/services/${serviceId}/status`, { status }).then(r => r.data);

export const deleteService = (serviceId) =>
  api.delete(`/admin/services/${serviceId}`).then(r => r.data);

export const updateReviewStatus = (reviewId, status) =>
  api.patch(`/admin/reviews/${reviewId}/status`, { status }).then(r => r.data);

export const deleteReview = (reviewId) =>
  api.delete(`/admin/reviews/${reviewId}`).then(r => r.data);

export const getSettings = () =>
  api.get('/admin/settings').then(r => r.data);

export const updateSettings = (category, settings) =>
  api.patch(`/admin/settings/${category}`, settings).then(r => r.data);

export const exportReports = (params) =>
  api.get('/admin/reports/export', { params, responseType: 'blob' }).then(r => r.data);

export const getDashboardStats = () =>
  api.get('/admin/dashboard/stats').then(r => r.data);

export const getRecentActivity = () =>
  api.get('/admin/dashboard/activity').then(r => r.data);

export const getRecentFeedback = () =>
  api.get('/admin/dashboard/feedback').then(r => r.data);

export const getPlatformMetrics = () =>
  api.get('/admin/dashboard/metrics').then(r => r.data);

export const getReports = (type, params = {}) =>
  api.get('/admin/reports', { params: { type, ...params } }).then(r => r.data);

// =================== ADMIN API OBJECT ===================
export const adminAPI = {
  // Dashboard
  getDashboardStats,
  getRecentActivity,
  getRecentFeedback,
  getPlatformMetrics,
  
  // Users
  getAllUsers,
  updateUserStatus,
  deleteUser,
  
  // Services
  getAllServices,
  updateServiceStatus,
  deleteService,
  
  // Bookings
  getAllBookings,
  updateBookingStatus,
  
  // Reviews
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  
  // Reports
  getReports,
  exportReports,
  
  // Settings
  getSettings,
  updateSettings
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
