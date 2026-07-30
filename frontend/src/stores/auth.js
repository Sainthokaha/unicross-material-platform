import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // 1. Initialize from localStorage immediately to prevent refresh logouts
  const savedUser = localStorage.getItem('user')
  const user = ref(savedUser ? JSON.parse(savedUser) : null)
  const token = ref(localStorage.getItem('token') || null)
  
  const loading = ref(false)
  const error = ref(null)

  // 2. Computed properties for easy role checking in the UI
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isStudent = computed(() => user.value?.role === 'student')
  const isLecturer = computed(() => user.value?.role === 'lecturer')

  // 3. Login Function
  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/login', credentials)
      const data = response.data
      
      const loginToken = data.token
      const loginUser = data.user

      if (loginToken && loginUser) {
        token.value = loginToken
        user.value = loginUser
        
        // Save BOTH to localStorage
        localStorage.setItem('token', loginToken)
        localStorage.setItem('user', JSON.stringify(loginUser))
        
        // Redirect based on role
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

  // 4. Fetch Fresh Profile Data (Called on Profile page load)
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
      logout() // If token is invalid, clear everything
    }
  }

  // ✅ 5. NEW: Update Profile (Name Only)
  async function updateProfile(data) {
    loading.value = true
    try {
      const response = await api.patch('/auth/profile', data)
      
      // Update local state and localStorage instantly so the UI reflects it immediately
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

  // 6. Logout Function
  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  // 7. Return all state and actions
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
    updateProfile // ✅ Make sure this is included!
  }
})