import apiClient from './client';

// Provider API object
export const api = {
  // Dashboard endpoints
  getDashboard: () => apiClient.get('/provider/dashboard'),
  getStats: (period = '30d') => apiClient.get(`/provider/stats?period=${period}`),

  // Service management endpoints
  getServices: () => apiClient.get('/provider/services'),
  createService: (serviceData) => apiClient.post('/provider/services', serviceData),
  updateService: (id, serviceData) => apiClient.put(`/provider/services/${id}`, serviceData),
  deleteService: (id) => apiClient.delete(`/provider/services/${id}`),
  toggleServiceStatus: (id) => apiClient.patch(`/provider/services/${id}/toggle`),

  // Message endpoints
  getMessages: () => apiClient.get('/provider/messages'),
  getConversation: (customerId) => apiClient.get(`/provider/messages/${customerId}`),
  sendMessage: (messageData) => apiClient.post('/provider/messages', messageData),
  markMessagesRead: (customerId) => apiClient.patch(`/provider/messages/${customerId}/read`),

  // Schedule and booking endpoints
  getSchedule: (params) => apiClient.get('/provider/schedule', { params }),
  updateAvailability: (availabilityData) => apiClient.put('/provider/availability', availabilityData),
  getBookings: (params) => apiClient.get('/provider/bookings', { params }),
  updateBookingStatus: (id, status) => apiClient.patch(`/provider/bookings/${id}/status`, { status }),

  // Reports endpoints
  getReports: (period = '30d') => apiClient.get(`/provider/reports?period=${period}`),
  getEarningsReport: (period = '30d') => apiClient.get(`/provider/reports/earnings?period=${period}`),
  getPerformanceReport: () => apiClient.get('/provider/reports/performance'),
  getCustomerReport: () => apiClient.get('/provider/reports/customers')
};

// Provider Dashboard APIs
export const getProviderDashboard = () => apiClient.get('/provider/dashboard').then(r => r.data);
export const getProviderStats = () => apiClient.get('/provider/stats').then(r => r.data);

// Provider Services APIs
export const getProviderServices = () => apiClient.get('/provider/services').then(r => r.data);
export const createService = (data) => apiClient.post('/provider/services', data).then(r => r.data);
export const updateService = (id, data) => apiClient.put(`/provider/services/${id}`, data).then(r => r.data);
export const deleteService = (id) => apiClient.delete(`/provider/services/${id}`).then(r => r.data);
export const toggleServiceStatus = (id) => apiClient.patch(`/provider/services/${id}/toggle`).then(r => r.data);

// Provider Messages APIs
export const getProviderMessages = () => apiClient.get('/provider/messages').then(r => r.data);
export const getConversation = (customerId) => apiClient.get(`/provider/messages/${customerId}`).then(r => r.data);
export const sendMessage = (data) => apiClient.post('/provider/messages', data).then(r => r.data);
export const markMessagesRead = (customerId) => apiClient.patch(`/provider/messages/${customerId}/read`).then(r => r.data);

// Provider Schedule APIs
export const getProviderSchedule = (params) => apiClient.get('/provider/schedule', { params }).then(r => r.data);
export const updateAvailability = (data) => apiClient.post('/provider/schedule/availability', data).then(r => r.data);
export const getProviderBookings = (params) => apiClient.get('/provider/bookings', { params }).then(r => r.data);
export const updateBookingStatus = (bookingId, status) => apiClient.patch(`/provider/bookings/${bookingId}`, { status }).then(r => r.data);

// Provider Reports APIs
export const getProviderReports = (params) => apiClient.get('/provider/reports', { params }).then(r => r.data);
export const getEarningsReport = (params) => apiClient.get('/provider/reports/earnings', { params }).then(r => r.data);
export const getPerformanceReport = (params) => apiClient.get('/provider/reports/performance', { params }).then(r => r.data);
export const getCustomerReport = (params) => apiClient.get('/provider/reports/customers', { params }).then(r => r.data);

// Default export
export default api;
