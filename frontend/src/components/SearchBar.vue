<template>
  <div class="min-h-screen bg-gray-50">
    <Sidebar>
      <template #navigation>
        <div class="text-gray-400 text-xs uppercase font-semibold mb-2">Menu</div>
        <button class="w-full text-left px-4 py-2 rounded bg-primary-600 text-white">
          Browse Materials
        </button>
      </template>
    </Sidebar>

    <main class="pt-20 md:pt-0 md:ml-72 p-4 md:p-8 min-h-screen">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Student Dashboard</h1>

      <!-- Search & Filter Card -->
      <div class="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          Search & Filter Materials
        </h3>

        <SearchBar
          v-model="filters.search"
          v-model:course-filter="filters.course_id"
          v-model:semester-filter="filters.semester"
          v-model:date-from="filters.date_from"
          v-model:date-to="filters.date_to"
          @clear-filters="clearFilters"
        />

        <!-- Button now only applies the dropdown filters -->
        <button @click="applyFilters" class="btn btn-primary mt-4 w-full md:w-auto">
          Apply Dropdown Filters
        </button>
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
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"; // ✅ Added 'watch'
import { useMaterialsStore } from "../stores/materials";
import Sidebar from "../components/Sidebar.vue";
import MaterialCard from "../components/MaterialCard.vue";

const materialsStore = useMaterialsStore();

const filters = ref({
  search: "",
  course_id: "",
  semester: "",
  date_from: "",
  date_to: "",
});

function applyFilters() {
  materialsStore.fetchMaterials(filters.value);
}

function clearFilters() {
  filters.value = { search: "", course_id: "", semester: "", date_from: "", date_to: "" };
  materialsStore.fetchMaterials();
}

// ✅ NEW: Watch the search input and trigger search automatically as you type
watch(
  () => filters.value.search,
  () => {
    applyFilters();
  }
);

onMounted(() => {
  materialsStore.fetchMaterials();
});
</script>
