import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔥 CRITICAL: Attach the JWT token to EVERY request automatically 🔥
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Log errors clearly so you are never blind to what's failing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API ERROR:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;