<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100"
  >
    <div class="card w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Reset Password</h1>
        <p class="text-gray-600 mt-2">Enter your new password below.</p>
      </div>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            class="form-input"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Confirm Password</label
          >
          <input
            v-model="confirmPassword"
            type="password"
            required
            minlength="6"
            class="form-input"
            placeholder="••••••••"
          />
        </div>
        <p
          v-if="message"
          :class="[
            'text-sm p-3 rounded',
            isError ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50',
          ]"
        >
          {{ message }}
        </p>
        <button
          type="submit"
          :disabled="loading || !token"
          class="btn btn-primary w-full disabled:opacity-50"
        >
          {{ loading ? "Resetting..." : "Reset Password" }}
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-gray-600">
        Back to
        <router-link to="/login" class="text-primary-600 hover:underline font-medium"
          >Login</router-link
        >
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/axios";

const route = useRoute();
const router = useRouter();

const token = ref("");
const password = ref("");
const confirmPassword = ref("");
const message = ref("");
const isError = ref(false);
const loading = ref(false);

onMounted(() => {
  token.value = route.query.token || "";
  if (!token.value) {
    isError.value = true;
    message.value = "Invalid or missing reset token.";
  }
});

async function handleSubmit() {
  message.value = "";
  isError.value = false;

  if (password.value !== confirmPassword.value) {
    isError.value = true;
    message.value = "Passwords do not match.";
    return;
  }

  loading.value = true;
  try {
    const response = await api.post("/auth/reset-password", {
      token: token.value,
      newPassword: password.value,
    });
    message.value = response.data.message || "Password reset successfully!";
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (err) {
    isError.value = true;
    message.value = err.response?.data?.message || "Failed to reset password.";
  } finally {
    loading.value = false;
  }
}
</script>
