import axios from 'axios';

// Ensure baseURL always points to the valid /api endpoint regardless of how VITE_API_URL is configured
const getBaseURL = () => {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw || !raw.trim()) {
    return 'http://localhost:5000/api';
  }
  let clean = raw.trim().replace(/\/+$/, '');
  if (!clean.endsWith('/api')) {
    clean = `${clean}/api`;
  }
  return clean;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // 60s timeout to accommodate Render free tier cold-starts
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('samvadai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry / 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking auth or on login page
      const isAuthCheck = error.config.url.includes('/auth/me');
      if (!isAuthCheck) {
        localStorage.removeItem('samvadai_token');
        localStorage.removeItem('samvadai_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
