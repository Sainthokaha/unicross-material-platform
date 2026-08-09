import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue'), meta: { requiresGuest: true } },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('../views/ForgotPasswordView.vue'), meta: { requiresGuest: true } },
  { path: '/reset-password', name: 'ResetPassword', component: () => import('../views/ResetPasswordView.vue'), meta: { requiresGuest: true } },
  { path: '/register', name: 'Register', component: () => import('../views/RegisterView.vue'), meta: { requiresGuest: true } },
  { path: '/admin', name: 'Admin', component: () => import('../views/AdminPanel.vue'), meta: { requiresAuth: true, role: 'admin' } },
  { path: '/lecturer-dashboard', name: 'Lecturer', component: () => import('../views/LecturerDashboard.vue'), meta: { requiresAuth: true, role: 'lecturer' } },
  { path: '/student-dashboard', name: 'Student', component: () => import('../views/StudentDashboard.vue'), meta: { requiresAuth: true, role: 'student' } },
  { path: '/profile', name: 'Profile', component: () => import('../views/ProfileView.vue'), meta: { requiresAuth: true } },
  { path: '/', redirect: '/login' },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFound.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } 
  else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    const role = authStore.user?.role
    if (role === 'admin') next('/admin')
    else if (role === 'lecturer') next('/lecturer-dashboard')
    else if (role === 'student') next('/student-dashboard')
    else next('/')
  } 
  else if (to.meta.role && authStore.user?.role !== to.meta.role) {
    const role = authStore.user?.role
    if (role === 'admin') next('/admin')
    else if (role === 'lecturer') next('/lecturer-dashboard')
    else if (role === 'student') next('/student-dashboard')
    else next('/login')
  } 
  else {
    next()
  }
})

export default router