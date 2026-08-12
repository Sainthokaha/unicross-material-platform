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

        <!-- Error Message -->
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ error }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg
            v-if="loading"
            class="animate-spin h-4 w-4 text-white"
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
          {{ loading ? "Signing in..." : "Sign In" }}
        </button>
      </form>

      <!-- Links: Forgot Password + Register -->
      <div class="mt-6 text-center space-y-2">
        <router-link
          to="/forgot-password"
          class="text-sm text-primary-600 hover:underline font-medium block"
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
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

// ✅ FIX: Force Vue to read the actual DOM values (Fixes Android/Mobile Autofill ghosting)
function syncMobileAutofill() {
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');
  if (emailInput && emailInput.value) email.value = emailInput.value;
  if (passwordInput && passwordInput.value) password.value = passwordInput.value;
}

async function handleLogin() {
  // 1. Sync mobile autofill values just in case the browser bypassed Vue's reactivity
  syncMobileAutofill();

  // 2. Frontend Validation
  if (!email.value || !password.value) {
    error.value = "Please enter both email and password.";
    return;
  }

  error.value = "";
  loading.value = true;

  try {
    // ✅ FIX: Explicitly pass a structured object, not separate strings
    await authStore.login({
      email: email.value.trim(),
      password: password.value,
    });

    // Redirect based on role (handled inside store, but we can force it here too for safety)
    const role = authStore.user?.role;
    if (role === "admin") router.push("/admin");
    else if (role === "student") router.push("/student-dashboard");
    else if (role === "lecturer") router.push("/lecturer-dashboard");
    else router.push("/");
  } catch (err) {
    error.value =
      err.response?.data?.message || "Login failed. Please check your credentials.";
  } finally {
    loading.value = false;
  }
}
</script>
