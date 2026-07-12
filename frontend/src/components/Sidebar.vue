<template>
  <div>
    <nav
      class="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm z-40 flex items-center justify-between px-4"
    >
      <button
        @click="isMobileMenuOpen = true"
        class="p-2 -ml-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>
      <div class="flex items-center gap-2">
        <img
          v-if="authStore.user?.profile_image"
          :src="`http://localhost:5000/uploads/${authStore.user.profile_image}`"
          class="w-9 h-9 rounded-full object-cover border-2 border-primary-500 shadow-md"
          alt="Profile"
        />
        <div
          v-else
          class="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
        >
          {{ userInitials }}
        </div>
      </div>
    </nav>

    <aside
      :class="[
        'fixed inset-y-0 left-0 w-72 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out',
        '-translate-x-full',
        isMobileMenuOpen ? 'translate-x-0' : '',
        'md:translate-x-0 md:flex',
      ]"
    >
      <div class="flex flex-col h-full">
        <div
          class="flex items-center justify-between gap-3 px-6 h-20 border-b border-gray-800 flex-shrink-0"
        >
          <div class="flex items-center gap-3">
            <img
              src="/unicross-logo.jpg"
              alt="UNICROSS"
              class="w-10 h-10 object-contain bg-white rounded-full p-1 shadow-lg"
            />
            <div>
              <h1 class="text-xl font-bold tracking-tight text-white">UNICROSS</h1>
              <p class="text-xs text-gray-400">Material Sharing</p>
            </div>
          </div>
          <button
            @click="isMobileMenuOpen = false"
            class="md:hidden w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <slot name="navigation" />
        </nav>

        <div
          class="px-4 py-4 border-t border-gray-800 space-y-2 bg-gray-900/50 flex-shrink-0"
        >
          <div class="flex items-center gap-3 px-2 py-2 mb-2">
            <img
              v-if="authStore.user?.profile_image"
              :src="`http://localhost:5000/uploads/${authStore.user.profile_image}`"
              class="w-10 h-10 rounded-full object-cover border-2 border-primary-500 shadow-md"
              alt="Profile"
            />
            <div
              v-else
              class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
            >
              {{ userInitials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-white truncate">
                {{ authStore.user?.name }}
              </p>
              <p class="text-xs text-gray-400 capitalize truncate">
                {{ authStore.user?.role }}
              </p>
            </div>
          </div>
          <router-link
            to="/profile"
            @click="isMobileMenuOpen = false"
            class="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
            My Profile
          </router-link>
          <button
            @click="handleLogout"
            class="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);

const userInitials = computed(() => {
  const name = authStore.user?.name || "User";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

function handleLogout() {
  isMobileMenuOpen.value = false;
  authStore.logout(); // This now routes to '/'
}
</script>
