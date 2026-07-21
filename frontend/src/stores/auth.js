import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // ✅ Load BOTH token and user from localStorage on startup
  const savedUser = localStorage.getItem('user')
  const user = ref(savedUser ? JSON.parse(savedUser) : null)
  const token = ref(localStorage.getItem('token') || null)
  
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isStudent = computed(() => user.value?.role === 'student')
  const isLecturer = computed(() => user.value?.role === 'lecturer')

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/login', credentials)
      
      if (response.data.success) {
        // ✅ Save BOTH token and user to localStorage
        token.value = response.data.token
        user.value = response.data.user
        
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        // ✅ Redirect based on role
        if (user.value.role === 'admin') {
          router.push('/admin')
        } else if (user.value.role === 'student') {
          router.push('/student-dashboard')
        } else if (user.value.role === 'lecturer') {
          router.push('/lecturer-dashboard')
        } else {
          router.push('/')
        }
        
        return response.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
      console.error('❌ Login Error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const response = await api.get('/auth/me')
      if (response.data.success) {
        // ✅ Update local memory AND localStorage with fresh DB data
        user.value = response.data.data
        localStorage.setItem('user', JSON.stringify(response.data.data))
      }
    } catch (err) {
      console.error('❌ Failed to fetch profile:', err)
      // If token is invalid/expired, clear everything and log out
      logout() 
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user') // ✅ Clean up user data on logout
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
    logout
  }
})