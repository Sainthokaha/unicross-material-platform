<template>
  <div class="min-h-screen bg-white">
    <!-- ✅ Mobile-Responsive Navigation Bar -->
    <nav
      class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <img
              src="/unicross-logo.jpg"
              alt="UNICROSS"
              class="w-10 h-10 object-contain"
            />
            <span class="text-xl font-bold text-gray-900 hidden sm:block">UNICROSS</span>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-4">
            <router-link
              to="/login"
              class="text-gray-600 hover:text-primary-600 font-medium transition"
            >
              Login
            </router-link>
            <router-link to="/register" class="btn btn-primary shadow-md">
              Get Started
            </router-link>
          </div>

          <!-- ✅ Mobile Menu Button -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            <svg
              v-if="!isMobileMenuOpen"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
            <svg
              v-else
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- ✅ Mobile Menu Dropdown -->
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden bg-white border-t border-gray-100 shadow-lg"
      >
        <div class="px-4 py-3 space-y-2">
          <router-link
            to="/login"
            @click="isMobileMenuOpen = false"
            class="block w-full text-left px-4 py-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg font-medium transition"
          >
            Login
          </router-link>
          <router-link
            to="/register"
            @click="isMobileMenuOpen = false"
            class="block w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-center"
          >
            Get Started
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section
      class="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-blue-50 pt-20 pb-32"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          class="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 shadow-sm"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 4.539a1.066 1.066 0 00-1.51-1.51l-4.5 4.5a1.066 1.066 0 000 1.51l.5.5a1.066 1.066 0 001.51 0l4-4z"
              clip-rule="false"
            ></path>
          </svg>
          Official University Platform
        </div>

        <h1
          class="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight"
        >
          The Smartest Way to Share <br />
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600"
            >Academic Materials at UNICROSS</span
          >
        </h1>

        <p
          class="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed"
        >
          A centralized, secure, and organized platform for lecturers to upload course
          materials and students to access them instantly. Built specifically for the
          University of Cross River State community.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/register"
            class="btn btn-primary text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
          >
            Create Student/Lecturer Account
          </router-link>
          <router-link
            to="/login"
            class="btn bg-white text-gray-700 border border-gray-200 text-lg px-8 py-4 shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-200"
          >
            Sign In to Portal
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900">
            Why Choose Our Platform?
          </h2>
          <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            We provide everything UNICROSS students and staff need to manage, share, and
            access academic resources securely.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div
            class="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div
              class="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6"
            >
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Seamless Uploads</h3>
            <p class="text-gray-600">
              Lecturers can easily upload PDFs, slides, and documents, tagging them by
              course code and semester for perfect organization.
            </p>
          </div>

          <!-- Feature 2 -->
          <div
            class="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div
              class="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6"
            >
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Advanced Search</h3>
            <p class="text-gray-600">
              Students can instantly find exactly what they need using powerful filters by
              course, semester, lecturer, or keywords.
            </p>
          </div>

          <!-- Feature 3 -->
          <div
            class="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div
              class="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6"
            >
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Secure & Audited</h3>
            <p class="text-gray-600">
              Role-based access control and comprehensive audit logs ensure that all
              materials are moderated and every action is tracked.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="flex items-center justify-center gap-3 mb-4">
          <img
            src="/unicross-logo.jpg"
            alt="UNICROSS"
            class="w-8 h-8 object-contain bg-white rounded-full p-0.5"
          />
          <span class="text-lg font-bold text-white"
            >UNICROSS Material Sharing Platform</span
          >
        </div>
        <p class="text-sm">
          &copy; {{ new Date().getFullYear() }} University of Cross River State. All
          rights reserved.
        </p>
        <p class="text-xs mt-2 text-gray-500">Built for academic excellence.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";

const isMobileMenuOpen = ref(false);
</script>
