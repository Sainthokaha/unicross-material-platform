<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <img src="/unicross-logo.jpg" alt="UNICROSS" class="w-16 h-16 mx-auto mb-4 object-contain" />
        <h1 class="text-2xl font-bold text-gray-900">Forgot Password?</h1>
        <p class="text-sm text-gray-500 mt-1">Enter your email to receive a reset link</p>
      </div>

      <form @submit.prevent="handleForgotPassword" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            v-model="form.email" 
            type="email" 
            required 
            class="form-input" 
            placeholder="your.email@unicross.edu.ng"
          />
        </div>

        <div v-if="message" :class="['px-4 py-3 rounded-lg text-sm border', isError ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200']">
          {{ message }}
        </div>

        <button type="submit" :disabled="loading" class="btn btn-primary w-full">
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>

        <div class="text-center">
          <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Login
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api/axios'

const form = ref({ email: '' })
const loading = ref(false)
const message = ref('')
const isError = ref(false)

async function handleForgotPassword() {
  loading.value = true
  message.value = ''
  isError.value = false
  
  try {
    await api.post('/auth/forgot-password', { email: form.value.email })
    message.value = 'If an account exists with that email, a password reset link has been sent. Please check your inbox.'
    form.value.email = ''
  } catch (err) {
    isError.value = true
    message.value = err.response?.data?.message || 'Failed to send reset link. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>