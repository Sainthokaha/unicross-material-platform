<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar>
      <template #navigation>
        <div class="text-gray-400 text-xs uppercase font-semibold mb-2 mt-4">
          Materials
        </div>
      </template>
    </Sidebar>

    <!-- Main Content -->
    <main class="pt-20 md:pt-16 md:ml-72 p-4 md:p-8 min-h-screen">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Student Dashboard</h1>

      <!-- Search & Filter Card -->
      <div class="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-6 border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          Search & Filter Materials
        </h3>
        <div class="space-y-4">
          <!-- Keyword Search -->
          <div class="relative">
            <input
              v-model="filters.search"
              @input="applyFilters"
              type="text"
              placeholder="Search by title, course code, or keywords..."
              class="form-input pl-10 w-full"
            />
            <svg
              class="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
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

          <!-- Filters Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1"
                >Course</label
              >
              <select
                v-model="filters.course_id"
                @change="applyFilters"
                class="form-input w-full"
              >
                <option value="">All Courses in My Department</option>
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
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1"
                >Semester</label
              >
              <select
                v-model="filters.semester"
                @change="applyFilters"
                class="form-input w-full"
              >
                <option value="">All Semesters</option>
                <option value="1">First Semester (Harmattan)</option>
                <option value="2">Second Semester (Rain)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1"
                >From Date</label
              >
              <input
                type="date"
                v-model="filters.date_from"
                @change="applyFilters"
                class="form-input w-full"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1"
                >To Date</label
              >
              <input
                type="date"
                v-model="filters.date_to"
                @change="applyFilters"
                class="form-input w-full"
              />
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button @click="clearFilters" class="btn btn-danger">Clear Filters</button>
          </div>
        </div>
      </div>

      <!-- Materials List -->
      <div class="space-y-4">
        <MaterialCard
          v-for="material in materialsStore.materials"
          :key="material.id"
          :material="material"
        />

        <p
          v-if="!materialsStore.loading && materialsStore.materials.length === 0"
          class="text-center text-gray-500 py-8 bg-white rounded-lg"
        >
          No materials found matching your criteria.
        </p>

        <p v-if="materialsStore.loading" class="text-center text-gray-500 py-8">
          Loading materials...
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="materialsStore.totalPages > 1"
        class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100"
      >
        <p class="text-sm text-gray-600">
          Showing
          <span class="font-semibold">{{ materialsStore.materials.length }}</span> of
          <span class="font-semibold">{{ materialsStore.totalItems }}</span> materials
        </p>

        <div class="flex items-center gap-2">
          <button
            @click="changePage(materialsStore.currentPage - 1)"
            :disabled="materialsStore.currentPage === 1"
            class="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ← Previous
          </button>

          <div class="hidden sm:flex items-center gap-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="changePage(page)"
              :disabled="page === '...'"
              :class="[
                'w-9 h-9 rounded-lg text-sm font-medium transition',
                page === materialsStore.currentPage
                  ? 'bg-primary-600 text-white shadow-md'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-600 hover:bg-gray-100',
              ]"
            >
              {{ page }}
            </button>
          </div>

          <span class="sm:hidden text-sm font-medium text-gray-700 px-2">
            Page {{ materialsStore.currentPage }} of {{ materialsStore.totalPages }}
          </span>

          <button
            @click="changePage(materialsStore.currentPage + 1)"
            :disabled="materialsStore.currentPage === materialsStore.totalPages"
            class="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next →
          </button>
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
import MaterialCard from "../components/MaterialCard.vue";
import api from "../api/axios";

const materialsStore = useMaterialsStore();
const authStore = useAuthStore();

const availableCourses = ref([]);
const filters = ref({
  search: "",
  course_id: "",
  semester: "",
  date_from: "",
  date_to: "",
});

function applyFilters() {
  materialsStore.fetchMaterials(filters.value, 1);
}

function clearFilters() {
  filters.value = { search: "", course_id: "", semester: "", date_from: "", date_to: "" };
  materialsStore.fetchMaterials({}, 1);
}

function changePage(page) {
  if (page >= 1 && page <= materialsStore.totalPages) {
    materialsStore.fetchMaterials(filters.value, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

const visiblePages = computed(() => {
  const total = materialsStore.totalPages;
  const current = materialsStore.currentPage;
  let pages = [];

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 3) {
      pages = [1, 2, 3, 4, "...", total];
    } else if (current >= total - 2) {
      pages = [1, "...", total - 3, total - 2, total - 1, total];
    } else {
      pages = [1, "...", current - 1, current, current + 1, "...", total];
    }
  }
  return pages;
});

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
