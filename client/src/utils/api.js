import axios from 'axios';

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: inject JWT Bearer token automatically ───────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: global 401 handling ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth data — page will redirect via ProtectedRoute
      localStorage.removeItem('fm_token');
      localStorage.removeItem('fm_user');
    }
    return Promise.reject(error);
  }
);

export default api;
