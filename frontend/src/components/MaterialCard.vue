<template>
  <div class="card flex flex-col md:flex-row justify-between md:items-start gap-4">
    <div class="flex-grow">
      <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ material.title }}</h3>
      <p class="text-gray-600 text-sm mb-3">{{ material.description || 'No description provided.' }}</p>
      
      <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
        <span>Course: <strong>{{ material.course_name }}</strong></span>
        <span>Uploader: <strong>{{ material.uploader_name }}</strong></span>
        <span>Downloads: <strong>{{ material.download_count }}</strong></span>
      </div>
    </div>

    <div class="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto justify-end md:ml-4">
      <span :class="['status-badge', `status-${material.status}`]">
        {{ material.status }}
      </span>
      
      <div v-if="showActions && material.status === 'pending'" class="flex gap-2">
        <button @click="$emit('approve', material.id)" class="btn btn-success text-sm">
          Approve
        </button>
        <button @click="$emit('reject', material.id)" class="btn btn-danger text-sm">
          Reject
        </button>
      </div>
      
      <button 
        v-if="material.status === 'approved'" 
        @click="handleDownload" 
        :disabled="downloading"
        class="btn btn-primary text-sm disabled:opacity-50"
      >
        {{ downloading ? 'Downloading...' : 'Download' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMaterialsStore } from '../stores/materials'

const props = defineProps({
  material: Object,
  showActions: { type: Boolean, default: false }
})

const emit = defineEmits(['approve', 'reject'])
const materialsStore = useMaterialsStore()
const downloading = ref(false)

async function handleDownload() {
  downloading.value = true
  try {
    await materialsStore.downloadMaterial(props.material.id)
  } catch (err) {
    alert('Download failed: ' + (err.response?.data?.message || 'Unknown error'))
  } finally {
    downloading.value = false
  }
}
</script>