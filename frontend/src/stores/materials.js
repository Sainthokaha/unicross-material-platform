import { defineStore } from 'pinia';
import api from '../api/axios';

export const useMaterialsStore = defineStore('materials', {
  state: () => ({
    materials: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      limit: 10
    }
  }),

  getters: {
    approvedMaterials: (state) => state.materials.filter(m => m.status === 'approved'),
    pendingMaterials: (state) => state.materials.filter(m => m.status === 'pending'),
    rejectedMaterials: (state) => state.materials.filter(m => m.status === 'rejected'),
  },

  actions: {
    // 1. Fetch materials with filters and pagination
    async fetchMaterials(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/materials', { params });
        
        // Handle different backend response structures gracefully
        if (response.data.data) {
          this.materials = response.data.data;
        } else {
          this.materials = response.data;
        }

        if (response.data.pagination) {
          this.pagination = response.data.pagination;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch materials';
        console.error('❌ Fetch materials error:', err);
      } finally {
        this.loading = false;
      }
    },

    // 2. Upload a new material (Lecturer)
    async uploadMaterial(formData) {
      this.loading = true;
      this.error = null;
      try {
        // ⚠️ CRITICAL: Do NOT manually set 'Content-Type' here. 
        // When you pass a FormData object, Axios automatically sets 'multipart/form-data' 
        // and generates the correct boundary. Manually setting it breaks Multer.
        const response = await api.post('/materials', formData);
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Upload failed';
        console.error('❌ Upload material error:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 3. Approve a material (Admin)
    async approveMaterial(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.patch(`/materials/${id}/approve`);
        
        // Update local state immediately for a smooth UI
        const index = this.materials.findIndex(m => m.id === id);
        if (index !== -1) {
          this.materials[index].status = 'approved';
        }
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to approve material';
        console.error('❌ Approve material error:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 4. Reject a material (Admin)
    async rejectMaterial(id, rejectionReason) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.patch(`/materials/${id}/reject`, { rejectionReason });
        
        const index = this.materials.findIndex(m => m.id === id);
        if (index !== -1) {
          this.materials[index].status = 'rejected';
          this.materials[index].rejection_reason = rejectionReason;
        }
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to reject material';
        console.error('❌ Reject material error:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 5. Delete a material (Admin/Lecturer)
    async deleteMaterial(id) {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/materials/${id}`);
        // Remove from local state
        this.materials = this.materials.filter(m => m.id !== id);
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to delete material';
        console.error('❌ Delete material error:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    // 6. Download a material (Student/Lecturer)
    async downloadMaterial(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get(`/materials/${id}/download`, {
          responseType: 'blob' // Important for file downloads
        });
        
        // Create a temporary link to trigger the browser download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `material-${id}.pdf`); // Fallback name
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to download material';
        console.error('❌ Download material error:', err);
      } finally {
        this.loading = false;
      }
    },

    // 7. Clear error state
    clearError() {
      this.error = null;
    }
  }
});