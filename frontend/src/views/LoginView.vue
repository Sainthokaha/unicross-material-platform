<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100"
  >
    <div class="card w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Material Sharing Platform</h1>
        <p class="text-gray-600 mt-2">Sign in to your account</p>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="form-input"
            placeholder="admin@platform.edu"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="form-input"
            placeholder="••••••••"
          />
        </div>

        <!-- ✅ NEW: Forgot Password Link -->
        <div class="flex items-center justify-end">
          <router-link
            to="/forgot-password"
            class="text-sm text-primary-600 hover:underline font-medium"
            >Forgot password?</router-link
          >
        </div>

        <p v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? "Logging in..." : "Login" }}
        </button>
      </form>
      <div class="mt-6 text-center text-sm text-gray-600">
        <p>Admin credentials:</p>
        <p class="font-mono text-xs mt-1">admin@platform.edu / Admin@1234</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleLogin() {
  error.value = "";
  loading.value = true;
  try {
    await authStore.login({ email: email.value, password: password.value });
  } catch (err) {
    error.value = err.response?.data?.message || "Login failed. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>
