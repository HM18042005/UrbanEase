import api from './client';

export const register = (data) => api.post('/auth/register', data).then(r => r.data);
export const login = (data) => api.post('/auth/login', data).then(r => r.data);
export const logout = () => api.post('/auth/logout').then(r => r.data);
export const me = () => api.get('/auth/me').then(r => r.data);

// Profile API calls
export const getProfile = () => api.get('/profile').then(r => r.data);
export const updateProfile = (data) => api.patch('/profile', data).then(r => r.data);
