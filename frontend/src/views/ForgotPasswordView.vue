<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100"
  >
    <div class="card w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Forgot Password?</h1>
        <p class="text-gray-600 mt-2">Enter your email to receive a reset link.</p>
      </div>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Email Address</label
          >
          <input
            v-model="email"
            type="email"
            required
            class="form-input"
            placeholder="you@example.com"
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
          :disabled="loading"
          class="btn btn-primary w-full disabled:opacity-50"
        >
          {{ loading ? "Sending..." : "Send Reset Link" }}
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-gray-600">
        Remember your password?
        <router-link to="/login" class="text-primary-600 hover:underline font-medium"
          >Login</router-link
        >
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "../api/axios";

const email = ref("");
const message = ref("");
const isError = ref(false);
const loading = ref(false);

async function handleSubmit() {
  message.value = "";
  isError.value = false;
  loading.value = true;
  try {
    const response = await api.post("/auth/forgot-password", { email: email.value });
    message.value =
      response.data.message || "If that email exists, a reset link has been sent.";
  } catch (err) {
    isError.value = true;
    message.value = err.response?.data?.message || "Failed to send reset link.";
  } finally {
    loading.value = false;
  }
}
</script>
