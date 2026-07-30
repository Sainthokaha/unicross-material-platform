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
      auditLogs.value = response.data.data || []
    } catch (err) { console.error('❌ Fetch Audit Logs Error:', err) } finally { loading.value = false }
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

  return { 
    users, departments, courses, auditLogs, loading,
    fetchUsers, fetchDepartments, fetchCourses, fetchAuditLogs,
    toggleUserStatus, updateUserDepartment
  }
})