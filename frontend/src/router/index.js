import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// ✅ Import all views including ForgotPasswordView
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
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPasswordView, meta: { requiresGuest: true } }, // ✅ Added
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

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.user?.role

  if (to.meta.requiresAuth) {
    if (!isAuthenticated || !userRole) {
      next('/login')
    } else if (to.meta.role && to.meta.role !== userRole) {
      if (userRole === 'student') next('/student-dashboard')
      else if (userRole === 'lecturer') next('/lecturer-dashboard')
      else if (userRole === 'admin') next('/admin')
      else next('/login')
    } else {
      next()
    }
  } 
  else if (to.meta.requiresGuest) {
    if (isAuthenticated && userRole) {
      if (userRole === 'student') next('/student-dashboard')
      else if (userRole === 'lecturer') next('/lecturer-dashboard')
      else if (userRole === 'admin') next('/admin')
      else next('/')
    } else {
      next()
    }
  } 
  else {
    next()
  }
})

export default router