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
      const data = response.data
      
      console.log('🔍 Raw Login Response from Backend:', data)

      // ✅ Be flexible: extract token and user whether they are nested under 'success' or not
      const loginToken = data.token || (data.success ? data.token : null)
      const loginUser = data.user || (data.success ? data.user : null)

      if (loginToken && loginUser) {
        console.log('✅ Valid token and user found. Saving to localStorage...')
        
        token.value = loginToken
        user.value = loginUser
        
        localStorage.setItem('token', loginToken)
        localStorage.setItem('user', JSON.stringify(loginUser))
        
        console.log('💾 localStorage now contains:', {
          token: localStorage.getItem('token'),
          user: localStorage.getItem('user')
        })
        
        // ✅ Redirect based on role
        if (loginUser.role === 'admin') {
          router.push('/admin')
        } else if (loginUser.role === 'student') {
          router.push('/student-dashboard')
        } else if (loginUser.role === 'lecturer') {
          router.push('/lecturer-dashboard')
        } else {
          router.push('/')
        }
        
        return response.data
      } else {
        console.error('❌ Login response is missing token or user object:', data)
        error.value = 'Login failed: Invalid response from server'
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
      console.error('❌ Login Network Error:', err)
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
        console.log('✅ Profile refreshed from database')
      }
    } catch (err) {
      console.error('❌ Failed to fetch profile:', err)
      logout() // If token is invalid, clear everything
    }
  }

  function logout() {
    console.log('🚪 Logging out, clearing localStorage...')
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
    logout
  }
})