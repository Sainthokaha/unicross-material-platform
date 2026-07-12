<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <main class="pt-20 md:pt-16 md:ml-72 p-4 md:p-8 min-h-screen">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
      >
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Lecturer Dashboard</h1>
        <button
          @click="showUpload = !showUpload"
          class="btn btn-primary w-full sm:w-auto"
        >
          {{ showUpload ? "Hide Upload Form" : "+ Upload Material" }}
        </button>
      </div>

      <!-- Upload Form (Toggleable) -->
      <div
        v-if="showUpload"
        class="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100"
      >
        <h3 class="text-xl font-semibold mb-4">Upload New Material</h3>
        <form @submit.prevent="handleUpload" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input v-model="uploadForm.title" type="text" required class="form-input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Description</label
            >
            <textarea
              v-model="uploadForm.description"
              rows="3"
              class="form-input"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select v-model="uploadForm.course_id" required class="form-input">
              <option value="">Select a Course</option>
              <option
                v-for="course in availableCourses"
                :key="course.id"
                :value="course.id"
              >
                {{ course.code }} - {{ course.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select v-model="uploadForm.semester" required class="form-input">
              <option value="">Select Semester</option>
              <option value="1">First Semester (Harmattan)</option>
              <option value="2">Second Semester (Rain)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input type="file" @change="handleFileChange" required class="form-input" />
            <p class="text-xs text-gray-500 mt-1">
              ️ Max file size: 50MB. Only the latest version will be kept.
            </p>
          </div>
          <p v-if="uploadError" class="text-red-600 text-sm">{{ uploadError }}</p>
          <button
            type="submit"
            :disabled="uploading"
            class="btn btn-primary w-full sm:w-auto"
          >
            {{ uploading ? "Uploading..." : "Upload" }}
          </button>
        </form>
      </div>

      <!-- My Materials List -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-800">My Uploaded Materials</h3>
        <MaterialCard
          v-for="material in materialsStore.materials"
          :key="material.id"
          :material="material"
        />

        <p
          v-if="!materialsStore.loading && materialsStore.materials.length === 0"
          class="text-center text-gray-500 py-8 bg-white rounded-lg"
        >
          You haven't uploaded any materials yet.
        </p>

        <p v-if="materialsStore.loading" class="text-center text-gray-500 py-8">
          Loading materials...
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useMaterialsStore } from "../stores/materials";
import { useAuthStore } from "../stores/auth";
import Sidebar from "../components/Sidebar.vue";
import MaterialCard from "../components/MaterialCard.vue";
import api from "../api/axios";

const materialsStore = useMaterialsStore();
const authStore = useAuthStore();

const showUpload = ref(false);
const availableCourses = ref([]);
const uploadForm = ref({
  title: "",
  description: "",
  course_id: "",
  semester: "",
  file: null,
});
const uploading = ref(false);
const uploadError = ref("");

function handleFileChange(e) {
  uploadForm.value.file = e.target.files[0];
}

async function handleUpload() {
  uploadError.value = "";
  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append("file", uploadForm.value.file);
    formData.append("title", uploadForm.value.title);
    formData.append("description", uploadForm.value.description);
    formData.append("course_id", uploadForm.value.course_id);
    formData.append("semester", uploadForm.value.semester);

    await materialsStore.uploadMaterial(formData);
    showUpload.value = false;
    uploadForm.value = {
      title: "",
      description: "",
      course_id: "",
      semester: "",
      file: null,
    };
  } catch (err) {
    uploadError.value = err.response?.data?.message || "Upload failed";
  } finally {
    uploading.value = false;
  }
}

onMounted(async () => {
  await materialsStore.fetchMaterials();

  try {
    const res = await api.get("/materials/categories");
    const userDeptId = authStore.user?.department_id;
    availableCourses.value = res.data.courses.filter(
      (c) => c.department_id == userDeptId
    );
  } catch (err) {
    console.error("Failed to load courses", err);
  }
});
</script>
