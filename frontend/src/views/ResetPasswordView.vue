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
        <h1 class="text-2xl font-bold text-gray-900">Reset Password</h1>
        <p class="text-sm text-gray-500 mt-1">Enter your new password below</p>
      </div>

      <!-- Show warning if no token -->
      <div
        v-if="!form.token"
        class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm mb-4"
      >
        <p class="font-semibold">⚠️ No reset token found</p>
        <p class="text-xs mt-1">
          Please check your email and click the reset link, or request a new one below.
        </p>
      </div>

      <form @submit.prevent="handleReset" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            v-model="form.newPassword"
            type="password"
            required
            minlength="6"
            class="form-input"
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Confirm Password</label
          >
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            minlength="6"
            class="form-input"
            placeholder="Confirm new password"
          />
        </div>

        <div
          v-if="message"
          :class="[
            'px-4 py-3 rounded-lg text-sm border',
            isError
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-green-50 text-green-700 border-green-200',
          ]"
        >
          {{ message }}
        </div>

        <button
          type="submit"
          :disabled="loading || !form.token"
          class="btn btn-primary w-full"
          :class="{ 'opacity-50 cursor-not-allowed': !form.token }"
        >
          {{ loading ? "Resetting..." : "Reset Password" }}
        </button>

        <div class="text-center space-y-2">
          <p class="text-sm text-gray-600">Didn't receive an email?</p>
          <router-link
            to="/forgot-password"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Request Password Reset
          </router-link>
          <br />
          <router-link to="/login" class="text-sm text-gray-600 hover:text-gray-700">
            ← Back to Login
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/axios";

const route = useRoute();
const router = useRouter();

const form = ref({
  token: "",
  newPassword: "",
  confirmPassword: "",
});
const loading = ref(false);
const message = ref("");
const isError = ref(false);

onMounted(() => {
  // ✅ Grab the token from the URL (?token=...)
  const urlParams = new URLSearchParams(window.location.search);
  form.value.token = urlParams.get("token") || route.query.token || "";

  console.log("Reset token from URL:", form.value.token);

  if (!form.value.token) {
    // Don't show error immediately, just inform the user
    message.value =
      "Please click the link from your email to reset your password, or request a new reset link.";
    isError.value = false;
  }
});

async function handleReset() {
  if (form.value.newPassword !== form.value.confirmPassword) {
    isError.value = true;
    message.value = "Passwords do not match.";
    return;
  }

  if (!form.value.token) {
    isError.value = true;
    message.value =
      "No reset token found. Please request a new password reset link from your email.";
    return;
  }

  loading.value = true;
  message.value = "";
  isError.value = false;

  try {
    await api.post("/auth/reset-password", {
      token: form.value.token,
      newPassword: form.value.newPassword,
    });

    message.value = "✅ Password reset successfully! Redirecting to login...";
    isError.value = false;

    setTimeout(() => {
      router.push("/login");
    }, 2500);
  } catch (err) {
    isError.value = true;
    message.value =
      err.response?.data?.message ||
      "Failed to reset password. The link may have expired. Please request a new one.";
  } finally {
    loading.value = false;
  }
}
</script>
