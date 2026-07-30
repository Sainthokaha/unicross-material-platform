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
      materials.value = response.data.materials || []
    } catch (err) {
      console.error(' Fetch Materials Error:', err)
    } finally {
      loading.value = false
    }
  }

  async function uploadMaterial(formData) {
    loading.value = true
    try {
      await api.post('/materials', formData)
      await fetchMaterials()
    } catch (err) {
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
      throw err
    } finally {
      loading.value = false
    }
  }

  return { materials, loading, fetchMaterials, uploadMaterial, approveMaterial, rejectMaterial }
})