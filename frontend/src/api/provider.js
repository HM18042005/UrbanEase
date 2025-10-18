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
  getBookings: (params) => apiClient.get('/provider/bookings', { params }),
  updateBookingStatus: (id, status) => {
    const payload = typeof status === 'string' ? { status } : status;
    return apiClient.patch(`/provider/bookings/${id}`, payload);
  },
};

// Provider Dashboard APIs
export const getProviderDashboard = () => apiClient.get('/provider/dashboard').then((r) => r.data);
export const getProviderStats = () => apiClient.get('/provider/stats').then((r) => r.data);

// Provider Services APIs
export const getProviderServices = () => apiClient.get('/provider/services').then((r) => r.data);
export const createService = (data) =>
  apiClient.post('/provider/services', data).then((r) => r.data);
export const updateService = (id, data) =>
  apiClient.put(`/provider/services/${id}`, data).then((r) => r.data);
export const deleteService = (id) =>
  apiClient.delete(`/provider/services/${id}`).then((r) => r.data);
export const toggleServiceStatus = (id) =>
  apiClient.patch(`/provider/services/${id}/toggle`).then((r) => r.data);

// Provider Messages APIs
export const getProviderMessages = () => apiClient.get('/provider/messages').then((r) => r.data);
export const getConversation = (customerId) =>
  apiClient.get(`/provider/messages/${customerId}`).then((r) => r.data);
export const sendMessage = (data) => apiClient.post('/provider/messages', data).then((r) => r.data);
export const markMessagesRead = (customerId) =>
  apiClient.patch(`/provider/messages/${customerId}/read`).then((r) => r.data);

// Provider Schedule APIs
export const getProviderSchedule = (params) =>
  apiClient.get('/provider/schedule', { params }).then((r) => r.data);
export const getProviderBookings = (params) =>
  apiClient.get('/provider/bookings', { params }).then((r) => r.data);
export const updateBookingStatus = (bookingId, status) =>
  apiClient
    .patch(`/provider/bookings/${bookingId}`, typeof status === 'string' ? { status } : status)
    .then((r) => r.data);

// Provider Reports APIs
// Default export
export default api;
