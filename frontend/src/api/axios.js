import axios from 'axios'

const api = axios.create({
  // Dynamically use Vercel env var, fallback to live Render URL
  baseURL: import.meta.env.VITE_API_URL || 'https://unicross-material-platform.onrender.com/api',
  headers: {
    'Accept': 'application/json'
    // ✅ REMOVED 'Content-Type': 'application/json' from here. 
    // We will set it dynamically in the interceptor below.
  }
})

// Request interceptor - attach token and handle Content-Type
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // 🛡️ DYNAMIC CONTENT-TYPE HANDLING:
  // If the payload is FormData, DELETE the Content-Type header entirely.
  // This allows the browser to automatically set the correct 
  // 'multipart/form-data; boundary=----WebKitFormBoundary...' header.
  // For everything else, explicitly set it to application/json.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  } else {
    config.headers['Content-Type'] = 'application/json'
  }
  
  return config
}, (error) => {
  return Promise.reject(error)
})

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api