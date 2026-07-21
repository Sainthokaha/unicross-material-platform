import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // 1. Initialize from localStorage immediately
  const savedUser = localStorage.getItem('user')
  const user = ref(savedUser ? JSON.parse(savedUser) : null)
  const token = ref(localStorage.getItem('token') || null)
  
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/login', credentials)
      const data = response.data
      
      // Handle both { token, user } and { success: true, token, user }
      const loginToken = data.token
      const loginUser = data.user

      if (loginToken && loginUser) {
        token.value = loginToken
        user.value = loginUser
        
        // 2. Save BOTH to localStorage
        localStorage.setItem('token', loginToken)
        localStorage.setItem('user', JSON.stringify(loginUser))
        
        // 3. Redirect
        if (loginUser.role === 'admin') router.push('/admin')
        else if (loginUser.role === 'student') router.push('/student-dashboard')
        else if (loginUser.role === 'lecturer') router.push('/lecturer-dashboard')
        else router.push('/')
        
        return data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed.'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 4. Force-refresh profile data from DB (called by ProfileView.vue)
  async function refreshProfile() {
    if (!token.value) return
    try {
      const response = await api.get('/auth/me')
      if (response.data.success && response.data.data) {
        user.value = response.data.data
        localStorage.setItem('user', JSON.stringify(response.data.data))
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err)
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return { user, token, loading, error, isAuthenticated, login, refreshProfile, logout }
})