import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Catch and log errors clearly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API ERROR:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;