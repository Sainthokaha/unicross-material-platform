import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export const useMaterialsStore = defineStore('materials', () => {
  const materials = ref([])
  const loading = ref(false)

  async function fetchMaterials() {
    loading.value = true
    try {
      const response = await api.get('/materials')
      materials.value = response.data.materials || response.data || []
    } catch (err) {
      console.error('Fetch materials error:', err)
    } finally {
      loading.value = false
    }
  }

  // ✅ CRITICAL: Accept FormData and pass it directly to axios without modifying headers
  async function uploadMaterial(formData) {
    loading.value = true
    try {
      // Do NOT add headers here. Axios will automatically set the correct multipart/form-data boundary
      await api.post('/materials', formData)
      await fetchMaterials()
    } catch (err) {
      console.error('Upload error:', err)
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
      console.error('Approve error:', err)
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
      console.error('Reject error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return { materials, loading, fetchMaterials, uploadMaterial, approveMaterial, rejectMaterial }
})