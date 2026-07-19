import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'
import router from '../router' // Make sure this path is correct for your project

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
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
        // ✅ Save token and fresh user data exactly as the backend sends it
        token.value = response.data.token
        user.value = response.data.user 
        
        localStorage.setItem('token', response.data.token)
        
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
        user.value = response.data.data // ✅ Overwrite with fresh DB data
      }
    } catch (err) {
      console.error('❌ Failed to fetch profile:', err)
      logout() // If token is invalid, log them out
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
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