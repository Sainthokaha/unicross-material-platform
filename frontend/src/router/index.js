import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// ✅ Import all views
import HomePage from '../views/HomePage.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import StudentDashboard from '../views/StudentDashboard.vue'
import LecturerDashboard from '../views/LecturerDashboard.vue'
import AdminPanel from '../views/AdminPanel.vue'
import ProfileView from '../views/ProfileView.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/login', name: 'Login', component: LoginView, meta: { requiresGuest: true } },
  { path: '/register', name: 'Register', component: RegisterView, meta: { requiresGuest: true } },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPasswordView, meta: { requiresGuest: true } },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPasswordView, meta: { requiresGuest: true } },
  { path: '/student-dashboard', name: 'StudentDashboard', component: StudentDashboard, meta: { requiresAuth: true, role: 'student' } },
  { path: '/lecturer-dashboard', name: 'LecturerDashboard', component: LecturerDashboard, meta: { requiresAuth: true, role: 'lecturer' } },
  { path: '/admin', name: 'AdminPanel', component: AdminPanel, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/profile', name: 'Profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ BULLETPROOF NAVIGATION GUARD
router.beforeEach((to, from, next) => {
  // 1. Check localStorage directly (instant and synchronous, survives refresh)
  const token = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')
  const user = savedUser ? JSON.parse(savedUser) : null
  
  const isAuthenticated = !!token
  const userRole = user?.role

  // 2. Routes that require authentication
  if (to.meta.requiresAuth) {
    if (!isAuthenticated || !userRole) {
      next('/login') // Not logged in, go to login
    } else if (to.meta.role && to.meta.role !== userRole) {
      // Logged in, but wrong role. Redirect to their correct dashboard
      if (userRole === 'student') next('/student-dashboard')
      else if (userRole === 'lecturer') next('/lecturer-dashboard')
      else if (userRole === 'admin') next('/admin')
      else next('/login')
    } else {
      next() // All good, let them through
    }
  } 
  // 3. Routes that require being a guest (not logged in)
  else if (to.meta.requiresGuest) {
    if (isAuthenticated && userRole) {
      // Already logged in, redirect to their dashboard
      if (userRole === 'student') next('/student-dashboard')
      else if (userRole === 'lecturer') next('/lecturer-dashboard')
      else if (userRole === 'admin') next('/admin')
      else next('/')
    } else {
      next() // Not logged in, let them see the login/register page
    }
  } 
  // 4. Public routes
  else {
    next()
  }
})

export default router