import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  // 1. Attach the JWT token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 2. ✅ CRITICAL FIX: If the payload is FormData, DELETE any forced Content-Type.
  // This allows the browser to automatically set the correct 'multipart/form-data' 
  // header WITH the required boundary string.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

export default api;