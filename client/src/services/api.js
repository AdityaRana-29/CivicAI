import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Reports
export const submitReport = (formData) => {
  return api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getMyReports = () => api.get('/reports/mine');
export const getReports = (params) => api.get('/reports', { params });
export const getReport = (id) => api.get(`/reports/${id}`);
export const updateReportStatus = (id, data) => api.patch(`/reports/${id}/status`, data);
export const reassignReport = (id, data) => api.patch(`/reports/${id}/reassign`, data);
export const flagReport = (id) => api.patch(`/reports/${id}/flag`);
export const confirmIssueType = (id, data) => api.post(`/reports/${id}/confirm-type`, data);

// Heatmap
export const getHeatmapData = (params) => api.get('/heatmap/data', { params });

// Predictions
export const getPredictions = () => api.get('/predictions');

// Notifications
export const getMyNotifications = () => api.get('/notifications/mine');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');

// Analytics
export const getAnalyticsSummary = (params) => api.get('/analytics/summary', { params });
export const getAnalyticsPerformance = (params) => api.get('/analytics/performance', { params });
export const getAnalyticsTrends = (params) => api.get('/analytics/trends', { params });
export const exportAnalyticsCSV = (params) => {
  return api.get('/analytics/export', {
    params,
    responseType: 'blob',
  });
};

export default api;
