import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export const useMaterialsStore = defineStore('materials', () => {
  const materials = ref([])
  const loading = ref(false)
  
  // ✅ NEW: Pagination State
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const limit = ref(10)

  async function fetchMaterials(filters = {}, page = 1) {
    loading.value = true
    currentPage.value = page
    
    try {
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('limit', limit.value)
      
      if (filters.search) params.append('search', filters.search)
      if (filters.course_id) params.append('course_id', filters.course_id)
      if (filters.semester) params.append('semester', filters.semester)
      if (filters.date_from) params.append('date_from', filters.date_from)
      if (filters.date_to) params.append('date_to', filters.date_to) // ✅ Added this
      
      const query = params.toString()
      const response = await api.get(`/materials${query ? '?' + query : ''}`)
      
      // ✅ UPDATED: Extract data from the new response format
      materials.value = response.data.materials
      totalPages.value = response.data.pagination.totalPages
      totalItems.value = response.data.pagination.totalItems
      
    } finally { 
      loading.value = false 
    }
  }

  async function uploadMaterial(formData) {
    await api.post('/materials/upload', formData)
    await fetchMaterials()
  }

  async function approveMaterial(id) {
    await api.patch(`/materials/${id}/approve`)
    await fetchMaterials()
  }

  async function rejectMaterial(id, reason) {
    await api.patch(`/materials/${id}/reject`, { reason })
    await fetchMaterials()
  }

  async function downloadMaterial(id) {
    try {
      const material = materials.value.find(m => m.id === id)
      const response = await api.get(`/materials/${id}/download`, { responseType: 'blob' })
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', material ? material.original_name : 'download')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      await fetchMaterials()
    } catch (error) { 
      console.error('Download error:', error)
      throw error 
    }
  }

  return { 
    materials, 
    loading, 
    currentPage, 
    totalPages, 
    totalItems, 
    fetchMaterials, 
    uploadMaterial, 
    approveMaterial, 
    rejectMaterial, 
    downloadMaterial 
  }
})