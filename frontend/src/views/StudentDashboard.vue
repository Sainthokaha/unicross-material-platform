<template>
  <div class="min-h-screen bg-gray-50">
    <Sidebar>
      <template #navigation>
        <button
          @click="activeTab = 'browse'"
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3',
            activeTab === 'browse'
              ? 'bg-primary-600 text-white'
              : 'text-gray-300 hover:bg-gray-800',
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            ></path>
          </svg>
          Browse Materials
        </button>
      </template>
    </Sidebar>

    <main class="pt-20 md:pt-16 md:ml-72 p-4 md:p-8 min-h-screen">
      <!-- Header & Student Info -->
      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {{ authStore.user?.full_name || "Student" }}!
        </h1>
        <div class="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
          <span
            class="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100"
          >
            <svg
              class="w-4 h-4 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
              ></path>
            </svg>
            {{ authStore.user?.matric_number || "Matric Not Assigned" }}
          </span>
          <span
            class="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100"
          >
            <svg
              class="w-4 h-4 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              ></path>
            </svg>
            {{ authStore.user?.department_name || "Unassigned Department" }}
          </span>
        </div>
      </div>

      <!-- ================= BROWSE MATERIALS TAB ================= -->
      <div v-if="activeTab === 'browse'">
        <!-- Search Bar -->
        <div class="mb-6 relative">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by title, course, or uploader..."
            class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm shadow-sm transition duration-150 ease-in-out"
          />
        </div>

        <!-- Materials Grid -->
        <div v-if="materialsStore.loading" class="text-center py-12 text-gray-500">
          <svg
            class="animate-spin h-8 w-8 mx-auto text-primary-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading library materials...
        </div>

        <div
          v-else-if="filteredMaterials.length === 0"
          class="bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center"
        >
          <svg
            class="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900">No materials found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{
              searchQuery
                ? "Try adjusting your search terms."
                : "There are no approved materials available for your department yet."
            }}
          </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="m in filteredMaterials"
            :key="m.id"
            class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col"
          >
            <!-- Card Header -->
            <div class="p-6 flex-1">
              <div class="flex items-start justify-between mb-4">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ m.course_name }}
                </span>
                <span class="text-xs text-gray-400">{{
                  m.semester === "1" ? "Harmattan" : "Rain"
                }}</span>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {{ m.title }}
              </h3>
              <p class="text-sm text-gray-500 line-clamp-3 mb-4">
                {{ m.description || "No description provided." }}
              </p>

              <div class="flex items-center gap-2 text-xs text-gray-400 mt-auto">
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                <span>Uploaded by {{ m.uploader_name }}</span>
              </div>
            </div>

            <!-- Card Footer / Download -->
            <div class="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <a
                :href="m.file_url"
                target="_blank"
                class="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
                Download Material
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useMaterialsStore } from "../stores/materials";
import { useAuthStore } from "../stores/auth";
import Sidebar from "../components/Sidebar.vue";

const materialsStore = useMaterialsStore();
const authStore = useAuthStore();

const activeTab = ref("browse");
const searchQuery = ref("");

// Smart search filtering
const filteredMaterials = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return materialsStore.materials;

  return materialsStore.materials.filter(
    (m) =>
      m.title.toLowerCase().includes(query) ||
      m.course_name.toLowerCase().includes(query) ||
      m.uploader_name.toLowerCase().includes(query)
  );
});

onMounted(async () => {
  // The backend automatically filters by student's department and 'approved' status
  await materialsStore.fetchMaterials();
});
</script>
