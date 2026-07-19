import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export const useUsersStore = defineStore('users', () => {
  // ==================== STATE ====================
  const users = ref([])
  const departments = ref([])
  const courses = ref([])
  const materials = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ==================== USERS ACTIONS ====================
  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/admin/users')
      users.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch users'
      console.error('❌ Fetch Users Error:', err)
      users.value = []
    } finally {
      loading.value = false
    }
  }

  async function createUser(userData) {
    loading.value = true
    try {
      const response = await api.post('/admin/users', userData)
      await fetchUsers() // Refresh the list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create user'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ✅ UPDATED: Now accepts 'newStatus' and sends it to the backend
  async function toggleUserStatus(id, newStatus) {
    loading.value = true
    try {
      await api.patch(`/admin/users/${id}/status`, { is_active: newStatus })
      await fetchUsers() // Refresh the list
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update status'
      console.error('❌ Toggle User Status Error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== DEPARTMENTS ACTIONS ====================
  async function fetchDepartments() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/admin/departments')
      departments.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch departments'
      console.error('❌ Fetch Departments Error:', err)
    } finally {
      loading.value = false
    }
  }

  async function addDepartment(departmentData) {
    loading.value = true
    try {
      const response = await api.post('/admin/departments', departmentData)
      await fetchDepartments() // Refresh the list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to add department'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== COURSES ACTIONS ====================
  async function fetchCourses() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/admin/courses')
      courses.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch courses'
      console.error('❌ Fetch Courses Error:', err)
    } finally {
      loading.value = false
    }
  }

  async function addCourse(courseData) {
    loading.value = true
    try {
      const response = await api.post('/admin/courses', courseData)
      await fetchCourses() // Refresh the list
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to add course'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== MATERIALS ACTIONS (Admin Approval) ====================
  async function fetchMaterials() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/admin/materials')
      materials.value = response.data.data || []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch materials'
      console.error('❌ Fetch Materials Error:', err)
    } finally {
      loading.value = false
    }
  }

  async function approveMaterial(id) {
    loading.value = true
    try {
      await api.patch(`/admin/materials/${id}/approve`)
      await fetchMaterials() // Refresh the list
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to approve material'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function rejectMaterial(id, rejectionReason) {
    loading.value = true
    try {
      await api.patch(`/admin/materials/${id}/reject`, { rejection_reason: rejectionReason })
      await fetchMaterials() // Refresh the list
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to reject material'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== RETURN EVERYTHING ====================
  return {
    users,
    departments,
    courses,
    materials,
    loading,
    error,
    fetchUsers,
    createUser,
    toggleUserStatus,
    fetchDepartments,
    addDepartment,
    fetchCourses,
    addCourse,
    fetchMaterials,
    approveMaterial,
    rejectMaterial
  }
})