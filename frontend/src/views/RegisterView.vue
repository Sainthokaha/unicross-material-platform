<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4"
  >
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
      <!-- Header -->
      <div class="text-center">
        <img
          src="/unicross-logo.jpg"
          alt="UNICROSS"
          class="w-16 h-16 mx-auto object-contain mb-4"
        />
        <h1 class="text-3xl font-bold text-gray-900">Join UNICROSS</h1>
        <p class="mt-2 text-sm text-gray-600">Create your University account</p>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
        <!-- Full Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            v-model="form.full_name"
            type="text"
            required
            class="form-input"
            placeholder="John Doe"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Gmail *</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="form-input"
            placeholder="name@gmail.com"
          />
          <p class="mt-1 text-xs text-gray-500">Use your @unicross.edu.ng email</p>
        </div>

        <!-- Role Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">I am a *</label>
          <select v-model="form.role" required class="form-input">
            <option value="">Select your role</option>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
          </select>
        </div>

        <!-- Matric/Staff Number (Conditional) -->
        <div v-if="form.role === 'student'">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Matriculation Number *</label
          >
          <input
            v-model="form.matric_number"
            type="text"
            :required="form.role === 'student'"
            class="form-input"
            placeholder="22/CSC/030"
          />
        </div>

        <div v-if="form.role === 'lecturer'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Staff ID</label>
          <input
            v-model="form.staff_id"
            type="text"
            class="form-input"
            placeholder="UNICROSS/STAFF/001"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="form-input"
            placeholder="••••••••"
          />
          <p class="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Confirm Password *</label
          >
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            minlength="6"
            class="form-input"
            placeholder="••••••••"
          />
        </div>

        <!-- Error/Success Messages -->
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ error }}
        </div>

        <div
          v-if="success"
          class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ success }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? "Creating Account..." : "Register" }}
        </button>

        <!-- Login Link -->
        <div class="text-center text-sm">
          <span class="text-gray-600">Already have an account?</span>
          <router-link
            to="/login"
            class="text-primary-600 hover:underline font-medium ml-1"
          >
            Login here
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";

const router = useRouter();

const form = ref({
  full_name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
  matric_number: "",
  staff_id: "",
});

const error = ref("");
const success = ref("");
const loading = ref(false);

async function handleRegister() {
  error.value = "";
  success.value = "";

  // Validation
  if (form.value.password !== form.value.confirmPassword) {
    error.value = "Passwords do not match";
    return;
  }

  if (form.value.role === "student" && !form.value.matric_number) {
    error.value = "Matriculation number is required for students";
    return;
  }

  // ✅ UPDATED: Standard email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.value.email)) {
    error.value = "Please enter a valid email address (e.g., name@gmail.com)";
    return;
  }

  loading.value = true;

  try {
    const { confirmPassword, ...registrationData } = form.value;

    await api.post("/auth/register", registrationData);

    success.value =
      form.value.role === "lecturer"
        ? "Registration successful! Your account is pending admin approval. You will be notified once activated."
        : "Registration successful! You can now login.";

    // Clear form
    form.value = {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      matric_number: "",
      staff_id: "",
    };

    // Redirect to login after 3 seconds for students
    if (form.value.role === "student") {
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Registration failed. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>
