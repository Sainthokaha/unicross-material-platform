<template>
  <div class="min-h-screen bg-gray-50">
    <Sidebar>
      <template #navigation>
        <button
          @click="activeTab = 'materials'"
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3',
            activeTab === 'materials'
              ? 'bg-primary-600 text-white'
              : 'text-gray-300 hover:bg-gray-800',
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          My Materials
        </button>
      </template>
    </Sidebar>

    <main class="pt-20 md:pt-16 md:ml-72 p-4 md:p-8 min-h-screen">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {{ authStore.user?.full_name || "Lecturer" }}!
        </h1>
        <p class="text-gray-500 mt-1">
          Manage your course materials and track their approval status.
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div class="p-3 bg-yellow-100 rounded-lg">
            <svg
              class="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Pending Approval</p>
            <p class="text-2xl font-bold text-gray-900">{{ pendingCount }}</p>
          </div>
        </div>
        <div
          class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div class="p-3 bg-green-100 rounded-lg">
            <svg
              class="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Approved</p>
            <p class="text-2xl font-bold text-gray-900">{{ approvedCount }}</p>
          </div>
        </div>
        <div
          class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div class="p-3 bg-blue-100 rounded-lg">
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Uploads</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ materialsStore.materials.length }}
            </p>
          </div>
        </div>
      </div>

      <!-- ================= MY MATERIALS TAB ================= -->
      <div v-if="activeTab === 'materials'">
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
        >
          <h2 class="text-xl font-bold text-gray-900">My Uploaded Materials</h2>
          <button
            @click="showUpload = !showUpload"
            class="btn btn-primary w-full sm:w-auto"
          >
            {{ showUpload ? "Hide Form" : "+ Upload Material" }}
          </button>
        </div>

        <!-- Upload Form -->
        <div
          v-if="showUpload"
          class="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100"
        >
          <h3 class="text-xl font-semibold mb-4">Upload New Material</h3>
          <form @submit.prevent="handleUpload" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  v-model="uploadForm.title"
                  type="text"
                  required
                  class="form-input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Semester</label
                >
                <select v-model="uploadForm.semester" required class="form-input">
                  <option value="">Select Semester</option>
                  <option value="1">First Semester (Harmattan)</option>
                  <option value="2">Second Semester (Rain)</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Description</label
              >
              <textarea
                v-model="uploadForm.description"
                rows="2"
                class="form-input"
              ></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Department</label
                >
                <select
                  v-model="uploadForm.department_id"
                  @change="uploadForm.course_id = ''"
                  class="form-input"
                  required
                >
                  <option value="" disabled>Choose Department</option>
                  <option
                    v-for="dept in usersStore.departments"
                    :key="dept.id"
                    :value="dept.id"
                  >
                    {{ dept.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  v-model="uploadForm.course_id"
                  :disabled="!uploadForm.department_id"
                  required
                  class="form-input disabled:bg-gray-100"
                >
                  <option value="">
                    {{
                      uploadForm.department_id
                        ? "Select a Course"
                        : "Select a department first"
                    }}
                  </option>
                  <option
                    v-for="course in filteredCourses"
                    :key="course.id"
                    :value="course.id"
                  >
                    {{ course.code }} - {{ course.name }}
                  </option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">File</label>
              <input type="file" @change="handleFileChange" required class="form-input" />
              <p class="text-xs text-gray-500 mt-1">Max file size: 50MB.</p>
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

        <!-- Materials Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div v-if="materialsStore.loading" class="p-8 text-center text-gray-500">
            Loading your materials...
          </div>
          <div
            v-else-if="materialsStore.materials.length === 0"
            class="p-8 text-center text-gray-500"
          >
            You haven't uploaded any materials yet.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th class="px-6 py-3">Title</th>
                  <th class="px-6 py-3">Course</th>
                  <th class="px-6 py-3">Semester</th>
                  <th class="px-6 py-3">Status</th>
                  <th class="px-6 py-3">Uploaded</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="m in materialsStore.materials"
                  :key="m.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 font-medium text-gray-900">{{ m.title }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ m.course_name }}</td>
                  <td class="px-6 py-4 text-gray-600">
                    {{ m.semester === "1" ? "Harmattan" : "Rain" }}
                  </td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs font-bold',
                        m.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : m.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800',
                      ]"
                    >
                      {{ m.status.toUpperCase() }}
                    </span>
                    <p
                      v-if="m.status === 'rejected' && m.rejection_reason"
                      class="text-xs text-red-500 mt-1"
                      :title="m.rejection_reason"
                    >
                      Reason: {{ m.rejection_reason }}
                    </p>
                  </td>
                  <td class="px-6 py-4 text-xs text-gray-500">
                    {{ new Date(m.created_at).toLocaleDateString() }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useMaterialsStore } from "../stores/materials";
import { useUsersStore } from "../stores/users";
import { useAuthStore } from "../stores/auth";
import Sidebar from "../components/Sidebar.vue";

const materialsStore = useMaterialsStore();
const usersStore = useUsersStore();
const authStore = useAuthStore();

const activeTab = ref("materials");
const showUpload = ref(false);
const uploading = ref(false);
const uploadError = ref("");

const uploadForm = ref({
  title: "",
  description: "",
  department_id: "",
  course_id: "",
  semester: "",
  file: null,
});

// Computed Stats
const pendingCount = computed(
  () => materialsStore.materials.filter((m) => m.status === "pending").length
);
const approvedCount = computed(
  () => materialsStore.materials.filter((m) => m.status === "approved").length
);

// Filter courses based on selected department
const filteredCourses = computed(() => {
  if (!uploadForm.value.department_id) return [];
  return usersStore.courses.filter(
    (c) => c.department_id == uploadForm.value.department_id
  );
});

// Initialize data on load
onMounted(async () => {
  await Promise.all([
    materialsStore.fetchMaterials(), // Backend automatically filters by lecturer's ID
    usersStore.fetchDepartments(),
    usersStore.fetchCourses(),
  ]);
});

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
    formData.append("description", uploadForm.value.description || "");
    formData.append("course_id", uploadForm.value.course_id);
    formData.append("semester", uploadForm.value.semester);

    await materialsStore.uploadMaterial(formData);

    showUpload.value = false;
    uploadForm.value = {
      title: "",
      description: "",
      department_id: "",
      course_id: "",
      semester: "",
      file: null,
    };
  } catch (err) {
    uploadError.value = err.response?.data?.message || "Upload failed.";
  } finally {
    uploading.value = false;
  }
}
</script>
