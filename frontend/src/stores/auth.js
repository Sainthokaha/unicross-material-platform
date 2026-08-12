import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // State
  const savedUser = localStorage.getItem('user')
  const user = ref(savedUser ? JSON.parse(savedUser) : null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isStudent = computed(() => user.value?.role === 'student')
  const isLecturer = computed(() => user.value?.role === 'lecturer')

  // Actions
  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      // 🛡️ BULLETPROOF: Guarantee the payload is a proper JSON object
      const payload = {
        email: credentials.email,
        password: credentials.password
      }
      
      const response = await api.post('/auth/login', payload)
      const data = response.data
      const loginToken = data.token
      const loginUser = data.user

      if (loginToken && loginUser) {
        token.value = loginToken
        user.value = loginUser
        
        localStorage.setItem('token', loginToken)
        localStorage.setItem('user', JSON.stringify(loginUser))
        
        return data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
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

  async function updateProfile(data) {
    loading.value = true
    try {
      const response = await api.patch('/auth/profile', data)
      if (user.value) {
        user.value.full_name = data.full_name
        localStorage.setItem('user', JSON.stringify(user.value))
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return {
    user, 
    token, 
    loading, 
    error,
    isAuthenticated, 
    isAdmin, 
    isStudent, 
    isLecturer,
    login, 
    fetchProfile, 
    logout, 
    updateProfile
  }
})