import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import api from '../api/axios'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // ✅ 1. IMMEDIATE HYDRATION: Load state from localStorage on app startup
  const token = ref(localStorage.getItem('token') || '')
  const storedUser = localStorage.getItem('user')
  const user = ref(storedUser ? JSON.parse(storedUser) : null)

  const loading = ref(false)
  const error = ref(null)

  // ✅ 2. RESTORE AXIOS HEADERS: Ensure API calls work immediately after refresh
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  const isAuthenticated = computed(() => !!token.value)

  // ✅ 3. AUTO-SYNC: Whenever the user object changes, save it to localStorage safely
  watch(user, (newUser) => {
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('user')
    }
  }, { deep: true })

    async function login(credentials) {
    loading.value = true
    try {
      const response = await api.post('/auth/login', credentials)
      const { token, user } = response.data
      
      // Save token
      localStorage.setItem('token', token)
      
      // Save user data EXACTLY as it comes from the DB
      user.value = user 
      
      return response.data
    } catch (err) {
      console.error('Login failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    token.value = ''
    user.value = null // Watcher will automatically remove 'user' from localStorage
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    router.push('/')
  }

  return { user, token, loading, error, isAuthenticated, login, register, logout }
})