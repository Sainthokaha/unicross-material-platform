import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const loading = ref(false)

  async function fetchUsers() {
    loading.value = true
    try {
      // Because server.js mounts adminRoutes at '/api/admin', 
      // and adminRoutes.js has '/users', the full path is '/admin/users'
      const response = await api.get('/admin/users') 
      users.value = response.data
    } catch (error) {
      console.error('Failed to fetch users:', error)
      users.value = [] 
    } finally {
      loading.value = false
    }
  }

  async function createUser(userData) {
    const response = await api.post('/admin/users', userData)
    await fetchUsers() // Refresh the list
    return response.data
  }

  async function toggleUserStatus(id) {
    await api.patch(`/admin/users/${id}/status`)
    await fetchUsers() // Refresh the list
  }

  return { users, loading, fetchUsers, createUser, toggleUserStatus }
})