import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export const useMaterialsStore = defineStore('materials', () => {
  const materials = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchMaterials() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/materials')
      // Handle both { materials: [...] } and { data: { materials: [...] } }
      const data = response.data.materials || response.data.data?.materials || []
      materials.value = data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch materials'
      console.error('❌ Fetch Materials Error:', err)
    } finally {
      loading.value = false
    }
  }

  async function uploadMaterial(formData) {
    loading.value = true
    try {
      // ✅ CRITICAL: Do NOT set Content-Type header here. 
      // Axios automatically detects FormData and sets the correct multipart boundary.
      const response = await api.post('/materials', formData)
      await fetchMaterials() // Refresh list immediately
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to upload material'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function approveMaterial(id) {
    loading.value = true
    try {
      await api.patch(`/materials/${id}/approve`)
      await fetchMaterials()
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to approve'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function rejectMaterial(id, reason) {
    loading.value = true
    try {
      await api.patch(`/materials/${id}/reject`, { reason })
      await fetchMaterials()
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to reject'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { materials, loading, error, fetchMaterials, uploadMaterial, approveMaterial, rejectMaterial }
})