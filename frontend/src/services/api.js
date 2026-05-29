import axios from 'axios';

// Use REACT_APP_API_URL from .env, fall back to relative /api for same-origin proxying
const baseURL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  updatePassword: (data) => api.patch('/auth/password', data),
  me:             ()     => api.get('/auth/me'),
};

// ── Users (admin) ─────────────────────────────────────────────
export const usersAPI = {
  list:   (params) => api.get('/users', { params }),
  get:    (id)     => api.get(`/users/${id}`),
  create: (data)   => api.post('/users', data),
  stats:  ()       => api.get('/users/stats'),
};

// ── Stores ────────────────────────────────────────────────────
export const storesAPI = {
  list:           (params) => api.get('/stores', { params }),
  get:            (id)     => api.get(`/stores/${id}`),
  create:         (data)   => api.post('/stores', data),
  ownerDashboard: ()       => api.get('/stores/owner/dashboard'),
};

// ── Ratings ───────────────────────────────────────────────────
export const ratingsAPI = {
  submit: (data)          => api.post('/ratings', data),
  update: (storeId, data) => api.put(`/ratings/${storeId}`, data),
  remove: (storeId)       => api.delete(`/ratings/${storeId}`),
};

export default api;
