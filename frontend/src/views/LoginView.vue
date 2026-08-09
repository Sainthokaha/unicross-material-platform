<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4"
  >
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <img
          src="/unicross-logo.jpg"
          alt="UNICROSS"
          class="w-16 h-16 mx-auto mb-4 object-contain"
        />
        <h1 class="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p class="text-sm text-gray-500 mt-1">Sign in to UNICROSS Material Sharing</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Email Address</label
          >
          <input
            v-model="email"
            type="email"
            required
            class="form-input"
            placeholder="name@gmail.com"
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
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ error }}
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? "Signing in..." : "Sign In" }}
        </button>
      </form>

      <!-- ✅ LINKS: Forgot Password + Register -->
      <div class="mt-6 text-center space-y-2">
        <router-link
          to="/forgot-password"
          class="text-sm text-primary-600 hover:underline font-medium"
        >
          Forgot your password?
        </router-link>
        <p class="text-sm text-gray-500">
          Don't have an account?
          <router-link
            to="/register"
            class="text-primary-600 hover:underline font-medium"
          >
            Register here
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleLogin() {
  error.value = "";
  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
  } catch (err) {
    error.value =
      err.response?.data?.message || "Invalid email or password. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>
