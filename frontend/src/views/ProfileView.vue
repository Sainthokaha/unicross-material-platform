<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar>
      <template #navigation>
        <router-link
          :to="dashboardPath"
          class="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-gray-300 hover:bg-gray-800"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            ></path>
          </svg>
          Dashboard
        </router-link>
      </template>
    </Sidebar>

    <!-- Main Content -->
    <main class="pt-20 md:pt-16 md:ml-72 p-4 md:p-8 min-h-screen">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Profile Picture & Basic Info -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Profile Card -->
          <div
            class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center"
          >
            <img
              v-if="authStore.user?.profile_image"
              :src="getProfileImageUrl(authStore.user.profile_image)"
              class="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary-100 shadow-md"
              alt="Profile"
            />
            <div
              v-else
              class="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mx-auto flex items-center justify-center text-white font-bold text-4xl shadow-md"
            >
              {{ userInitials }}
            </div>

            <h2 class="mt-4 text-xl font-bold text-gray-900">
              {{ authStore.user?.full_name || authStore.user?.name || "User" }}
            </h2>
            <p class="text-sm text-gray-500 capitalize">{{ authStore.user?.role }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ authStore.user?.email }}</p>

            <!-- Upload Image Form -->
            <form @submit.prevent="handleImageUpload" class="mt-6">
              <input
                type="file"
                @change="handleFileChange"
                accept="image/*"
                class="hidden"
                ref="fileInput"
              />
              <button
                type="button"
                @click="$refs.fileInput.click()"
                class="btn btn-primary w-full text-sm"
              >
                Change Profile Picture
              </button>
              <p
                v-if="imageMessage"
                :class="['text-xs mt-2', imageError ? 'text-red-500' : 'text-green-500']"
              >
                {{ imageMessage }}
              </p>
            </form>
          </div>
        </div>

        <!-- Right Column: Details & Password -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Academic Details -->
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                class="w-5 h-5 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 14l9-5-9-5-9 5 9 5z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                ></path>
              </svg>
              Academic Details
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Matric Number (Only for Students) -->
              <div
                v-if="authStore.user?.role === 'student'"
                class="bg-gray-50 p-4 rounded-lg border border-gray-100"
              >
                <p class="text-xs font-bold text-gray-500 uppercase mb-1">
                  Matriculation No.
                </p>
                <p class="text-sm font-semibold text-gray-900">
                  {{ authStore.user?.matric_number || "Not Assigned" }}
                </p>
              </div>

              <!-- Staff ID (Only for Lecturers/Admins) -->
              <div
                v-if="authStore.user?.role !== 'student'"
                class="bg-gray-50 p-4 rounded-lg border border-gray-100"
              >
                <p class="text-xs font-bold text-gray-500 uppercase mb-1">Staff ID</p>
                <p class="text-sm font-semibold text-gray-900">
                  {{ authStore.user?.staff_id || "Not Assigned" }}
                </p>
              </div>

              <!-- Department -->
              <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p class="text-xs font-bold text-gray-500 uppercase mb-1">Department</p>
                <p class="text-sm font-semibold text-gray-900">
                  {{ authStore.user?.department_name || "Unassigned" }}
                </p>
              </div>
            </div>
          </div>

          <!-- Change Password Form -->
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                class="w-5 h-5 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
              Change Password
            </h3>
            <form @submit.prevent="handleChangePassword" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Current Password</label
                >
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  required
                  class="form-input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >New Password</label
                >
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  required
                  minlength="6"
                  class="form-input"
                />
              </div>
              <p
                v-if="passwordMessage"
                :class="['text-sm', passwordError ? 'text-red-600' : 'text-green-600']"
              >
                {{ passwordMessage }}
              </p>
              <button
                type="submit"
                :disabled="changingPassword"
                class="btn btn-primary w-full sm:w-auto"
              >
                {{ changingPassword ? "Updating..." : "Update Password" }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "../stores/auth";
import Sidebar from "../components/Sidebar.vue";
import api from "../api/axios";

const authStore = useAuthStore();

const fileInput = ref(null);
const imageMessage = ref("");
const imageError = ref(false);

const passwordForm = ref({ currentPassword: "", newPassword: "" });
const passwordMessage = ref("");
const passwordError = ref(false);
const changingPassword = ref(false);

// Dashboard path based on role
const dashboardPath = computed(() => {
  const role = authStore.user?.role;
  if (role === "student") return "/student-dashboard";
  if (role === "lecturer") return "/lecturer-dashboard";
  if (role === "admin") return "/admin";
  return "/";
});

const userInitials = computed(() => {
  const name = authStore.user?.full_name || authStore.user?.name || "User";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

// ✅ DYNAMIC IMAGE URL HELPER
const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath; // Already a full URL

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const baseUrl = apiUrl.replace("/api", ""); // Removes '/api' to get base server URL
  return `${baseUrl}${imagePath}?t=${Date.now()}`; // Adds cache-busting timestamp
};

function handleFileChange(e) {
  const file = e.target.files[0];
  if (file) handleImageUpload(file);
}

async function handleImageUpload(file) {
  imageMessage.value = "";
  imageError.value = false;

  const formData = new FormData();
  formData.append("profile_image", file);

  try {
    const res = await api.post("/auth/profile-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // ✅ Update auth store with new profile image path
    authStore.user.profile_image = res.data.profileImage;

    // ✅ Force reactivity by creating a new object
    authStore.user = { ...authStore.user };

    imageMessage.value = "Profile picture updated successfully!";

    // Clear message after 3 seconds
    setTimeout(() => {
      imageMessage.value = "";
    }, 3000);
  } catch (err) {
    imageError.value = true;
    imageMessage.value = err.response?.data?.message || "Failed to upload image";
  }
}

async function handleChangePassword() {
  passwordMessage.value = "";
  passwordError.value = false;
  changingPassword.value = true;

  try {
    await api.post("/auth/change-password", passwordForm.value);
    passwordMessage.value = "Password changed successfully!";
    passwordForm.value = { currentPassword: "", newPassword: "" };
  } catch (err) {
    passwordError.value = true;
    passwordMessage.value = err.response?.data?.message || "Failed to change password";
  } finally {
    changingPassword.value = false;
  }
}
</script>
