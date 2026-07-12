<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <img
          src="/unicross-logo.jpg"
          alt="UNICROSS"
          class="w-16 h-16 mx-auto mb-4 object-contain"
        />
        <h1 class="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p class="text-sm text-gray-500 mt-1">Sign in to UNICROSS Material Sharing</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Email Address</label
          >
          <input
            v-model="form.email"
            type="email"
            required
            class="form-input"
            placeholder="your.email@unicross.edu.ng"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="form-input"
            placeholder="Enter your password"
          />
        </div>

        <div
          v-if="authStore.error"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="btn btn-primary w-full"
        >
          {{ authStore.loading ? "Signing in..." : "Sign In" }}
        </button>
      </form>

      <div class="mt-6 text-center space-y-2">
        <!-- ✅ FIXED: This now correctly routes to /forgot-password -->
        <router-link
          to="/forgot-password"
          class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Forgot your password?
        </router-link>
        <p class="text-sm text-gray-500">
          Don't have an account?
          <router-link
            to="/register"
            class="text-blue-600 hover:text-blue-700 font-medium"
            >Register here</router-link
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const form = ref({
  email: "",
  password: "",
});

onMounted(() => {
  form.value = { email: "", password: "" };
  authStore.error = null;
});

async function handleLogin() {
  await authStore.login(form.value);
}
</script>
