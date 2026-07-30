import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const departments = ref([])
  const courses = ref([])
  const auditLogs = ref([])
  const loading = ref(false)

  async function fetchUsers() {
    loading.value = true
    try {
      const response = await api.get('/admin/users')
      users.value = response.data.data || []
    } catch (err) { console.error('❌ Fetch Users Error:', err) } finally { loading.value = false }
  }

  async function fetchDepartments() {
    try {
      const response = await api.get('/admin/departments')
      departments.value = response.data.data || []
    } catch (err) { console.error('❌ Fetch Departments Error:', err) }
  }

  async function fetchCourses() {
    try {
      const response = await api.get('/admin/courses')
      courses.value = response.data.data || []
    } catch (err) { console.error('❌ Fetch Courses Error:', err) }
  }

  async function fetchAuditLogs() {
    loading.value = true
    try {
      const response = await api.get('/admin/audit-logs')
      // Handle both { data: [...] } and direct array responses
      auditLogs.value = response.data.data || response.data || []
    } catch (err) { 
      console.error('❌ Fetch Audit Logs Error:', err) 
    } finally { 
      loading.value = false 
    }
  }

  // ✅ ADDED: Create User Function
  async function createUser(userData) {
    loading.value = true
    try {
      await api.post('/admin/users', userData)
      await fetchUsers() // Refresh the list
    } catch (err) {
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleUserStatus(id, newStatus) {
    loading.value = true
    try {
      await api.patch(`/admin/users/${id}/status`, { is_active: newStatus ? 1 : 0 })
      const user = users.value.find(u => u.id === id)
      if (user) user.is_active = newStatus ? 1 : 0
    } catch (err) { throw err } finally { loading.value = false }
  }

  async function updateUserDepartment(userId, deptId) {
    loading.value = true
    try {
      const response = await api.patch(`/admin/users/${userId}/department`, { department_id: deptId ? parseInt(deptId, 10) : null })
      const user = users.value.find(u => u.id === userId)
      if (user) {
        user.department_id = deptId ? parseInt(deptId, 10) : null
        const dept = departments.value.find(d => d.id === user.department_id)
        user.department_name = dept ? dept.name : 'Unassigned'
        if (response.data.newMatric) user.matric_number = response.data.newMatric
      }
    } catch (err) { throw err } finally { loading.value = false }
  }

  async function addDepartment(data) {
    await api.post('/admin/departments', data)
    await fetchDepartments()
  }

  async function deleteDepartment(id) {
    await api.delete(`/admin/departments/${id}`)
    await fetchDepartments()
  }

  async function addCourse(data) {
    await api.post('/admin/courses', data)
    await fetchCourses()
  }

  async function deleteCourse(id) {
    await api.delete(`/admin/courses/${id}`)
    await fetchCourses()
  }

  async function updateUserRole(userId, newRole, extraIdentifiers = {}) {
    loading.value = true
    try {
      await api.patch(`/admin/users/${userId}/role`, { 
        role: newRole,
        matric_number: extraIdentifiers.matric_number || null,
        staff_id: extraIdentifiers.staff_id || null
      })
      
      // Optimistic UI update
      const user = users.value.find(u => u.id === userId)
      if (user) {
        user.role = newRole
        user.matric_number = extraIdentifiers.matric_number || null
        user.staff_id = extraIdentifiers.staff_id || null
      }
    } catch (err) { 
      console.error('❌ Update Role Error:', err)
      throw err 
    } finally { 
      loading.value = false 
    }
  }

  return { 
    users, departments, courses, auditLogs, loading,
    fetchUsers, fetchDepartments, fetchCourses, fetchAuditLogs,
    createUser, toggleUserStatus, updateUserDepartment,
    addDepartment, deleteDepartment, addCourse, deleteCourse, updateUserRole
  }
})