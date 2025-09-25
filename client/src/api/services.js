import api from './client';

// Helper function to transform service data
const transformService = (service) => {
  if (!service) return service;
  return {
    ...service,
    id: service._id || service.id,
  };
};

const transformServices = (services) => {
  if (!Array.isArray(services)) return services;
  return services.map(transformService);
};

// =================== SERVICES API ===================
export const getServices = (params = {}) =>
  api.get('/services', { params }).then((r) => transformServices(r.data.services || []));

export const getService = (id) =>
  api.get(`/services/${id}`).then((r) => transformService(r.data.service || r.data));

export const searchServices = (query, filters = {}) =>
  api
    .get('/services/search', { params: { q: query, ...filters } })
    .then((r) => transformServices(r.data.services || []));

export const getFeaturedServices = () =>
  api.get('/services/featured').then((r) => transformServices(r.data.services || []));

export const getServicesByCategory = (category) =>
  api
    .get('/services', { params: { category } })
    .then((r) => transformServices(r.data.services || []));

export const advancedSearchServices = (searchData) =>
  api.post('/services/advanced-search', searchData).then((r) => r.data);

export const getServiceFilters = () => api.get('/services/filters').then((r) => r.data);

// =================== BOOKINGS API ===================
export const createBooking = (bookingData) =>
  api.post('/bookings', bookingData).then((r) => r.data);

export const getBookings = (params = {}) => api.get('/bookings', { params }).then((r) => r.data);

export const getBooking = (id) => api.get(`/bookings/${id}`).then((r) => r.data);

export const updateBooking = (id, data) =>
  api.put(`/bookings/${id}/status`, data).then((r) => r.data);

export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`).then((r) => r.data);

export const rescheduleBooking = (id, data) =>
  api.put(`/bookings/${id}/reschedule`, data).then((r) => r.data);

// =================== REVIEWS API ===================
export const getReviews = (serviceId) =>
  api.get(`/reviews/service/${serviceId}`).then((r) => r.data);

export const createReview = (reviewData) => api.post('/reviews', reviewData).then((r) => r.data);

export const getUserReviews = () => api.get('/reviews/user').then((r) => r.data);

// =================== MESSAGES API ===================
export const getConversations = () => api.get('/messages/conversations').then((r) => r.data);

export const getBookingBasedConversations = () =>
  api.get('/messages/booking-conversations').then((r) => r.data);

export const getMessages = (userId) =>
  api.get(`/messages/conversation/${userId}`).then((r) => r.data);

export const sendMessage = (messageData) =>
  api.post('/messages/send', messageData).then((r) => r.data);

export const markMessagesAsRead = (conversationData) =>
  api.put('/messages/mark-read', conversationData).then((r) => r.data);

// =================== USER DASHBOARD API ===================
export const getUserDashboard = () => api.get('/users/me/dashboard').then((r) => r.data);

export const getUserStats = () => api.get('/users/me/stats').then((r) => r.data);

// =================== ADMIN API ===================
export const getAdminDashboard = () => api.get('/admin/dashboard').then((r) => r.data);

export const getAdminStats = () => api.get('/admin/dashboard').then((r) => r.data);

export const getAllUsers = (params = {}) => api.get('/admin/users', { params }).then((r) => r.data);

export const updateUserStatus = (userId, status) =>
  api.put(`/admin/users/${userId}`, { status }).then((r) => r.data);

export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`).then((r) => r.data);

export const getAllBookings = (params = {}) =>
  api.get('/admin/bookings', { params }).then((r) => r.data);

export const getAllServices = (params = {}) =>
  api.get('/admin/services', { params }).then((r) => r.data);

export const getAllReviews = (params = {}) =>
  api.get('/admin/reviews', { params }).then((r) => r.data);

export const getAdminReports = (type = 'overview', params = {}) =>
  api.get('/admin/reports', { params: { type, ...params } }).then((r) => r.data);

export const getAdvancedAnalytics = (timeRange = '30') =>
  api.get('/admin/analytics', { params: { timeRange } }).then((r) => r.data);

export const getRealTimeMetrics = () => api.get('/admin/metrics').then((r) => r.data);

// Additional Admin API functions
export const deleteService = (serviceId) =>
  api.delete(`/admin/services/${serviceId}`).then((r) => r.data);

// =================== ADMIN API OBJECT ===================
export const adminAPI = {
  // Dashboard
  getAdminDashboard,
  getAdminStats,
  getDashboardStats: getAdminDashboard,

  // Analytics
  getAdvancedAnalytics,
  getRealTimeMetrics,

  // Users
  getAllUsers,
  updateUserStatus,
  deleteUser,

  // Services
  getAllServices,
  deleteService,

  // Bookings
  getAllBookings,
  updateBookingStatus: (bookingId, status) => updateBooking(bookingId, { status }),

  // Reviews
  getAllReviews,

  // Reports
  getAdminReports,
  getReports: (type, params) => getAdminReports(type, params),
};

// =================== BOOKING API OBJECT ===================
export const bookingAPI = {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
};

// =================== SERVICE API OBJECT ===================
export const serviceAPI = {
  getServices,
  getService,
  searchServices,
  getFeaturedServices,
  getServicesByCategory,
};

// =================== REVIEW API OBJECT ===================
export const reviewAPI = {
  getReviews,
  createReview,
  getUserReviews,
};

// =================== MESSAGES API OBJECT ===================
export const messagesAPI = {
  getConversations,
  getBookingBasedConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
};

// =================== CLIENT API OBJECT ===================
export const clientAPI = {
  // Bookings
  getBookings,
  createBooking,

  // Messages
  getConversations: getBookingBasedConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
};

// =================== CATEGORIES API ===================
export const getCategories = () =>
  api.get('/services/categories').then((r) => r.data.categories || []);

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
  getCategories,
};

// =================== PROVIDER API ===================
export const getProviderDashboard = () => api.get('/provider/dashboard').then((r) => r.data);

export const getProviderStats = () => api.get('/provider/stats').then((r) => r.data);

export const getProviderSchedule = (params = {}) =>
  api.get('/provider/schedule', { params }).then((r) => r.data);

export const getProviderAvailability = (params = {}) =>
  api.get('/provider/availability', { params }).then((r) => r.data);

export const updateProviderAvailability = (scheduleData) =>
  api.post('/provider/schedule/availability', scheduleData).then((r) => r.data);

export const bulkUpdateTimeSlots = (timeSlotData) =>
  api.post('/provider/timeslots/bulk', timeSlotData).then((r) => r.data);

export const getProviderBookings = (params = {}) =>
  api.get('/provider/bookings', { params }).then((r) => r.data);

export const updateProviderBookingStatus = (bookingId, statusData) =>
  api.patch(`/provider/bookings/${bookingId}`, statusData).then((r) => r.data);

export const getProviderServices = () => api.get('/provider/services').then((r) => r.data);

export const createProviderService = (serviceData) =>
  api.post('/provider/services', serviceData).then((r) => r.data);

export const updateProviderService = (serviceId, serviceData) =>
  api.put(`/provider/services/${serviceId}`, serviceData).then((r) => r.data);

export const deleteProviderService = (serviceId) =>
  api.delete(`/provider/services/${serviceId}`).then((r) => r.data);

export const toggleProviderServiceStatus = (serviceId) =>
  api.patch(`/provider/services/${serviceId}/toggle`).then((r) => r.data);

export const getProviderMessages = (params = {}) =>
  api.get('/provider/messages', { params }).then((r) => r.data);

export const getProviderConversation = (customerId) =>
  api.get(`/provider/messages/${customerId}`).then((r) => r.data);

export const sendProviderMessage = (customerId, messageData) =>
  api.post('/provider/messages', { customerId, ...messageData }).then((r) => r.data);

export const markProviderMessagesRead = (customerId) =>
  api.patch(`/provider/messages/${customerId}/read`).then((r) => r.data);

export const getProviderReports = (params = {}) =>
  api.get('/provider/reports', { params }).then((r) => r.data);

export const getProviderEarningsReport = (params = {}) =>
  api.get('/provider/reports/earnings', { params }).then((r) => r.data);

export const getProviderPerformanceReport = (params = {}) =>
  api.get('/provider/reports/performance', { params }).then((r) => r.data);

export const getProviderCustomerReport = (params = {}) =>
  api.get('/provider/reports/customers', { params }).then((r) => r.data);

// =================== PROVIDER API OBJECT ===================
export const providerAPI = {
  // Dashboard
  getDashboard: getProviderDashboard,
  getStats: getProviderStats,

  // Schedule & Availability
  getSchedule: getProviderSchedule,
  getAvailability: getProviderAvailability,
  updateAvailability: updateProviderAvailability,
  bulkUpdateTimeSlots,

  // Bookings
  getBookings: getProviderBookings,
  updateBookingStatus: updateProviderBookingStatus,

  // Services
  getServices: getProviderServices,
  createService: createProviderService,
  updateService: updateProviderService,
  deleteService: deleteProviderService,
  toggleServiceStatus: toggleProviderServiceStatus,

  // Messages
  getMessages: getProviderMessages,
  getConversation: getProviderConversation,
  sendMessage: sendProviderMessage,
  markMessagesRead: markProviderMessagesRead,

  // Reports
  getReports: getProviderReports,
  getEarningsReport: getProviderEarningsReport,
  getPerformanceReport: getProviderPerformanceReport,
  getCustomerReport: getProviderCustomerReport,
};

export default servicesAPI;
