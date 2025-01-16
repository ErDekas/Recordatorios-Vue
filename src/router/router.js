import { createRouter, createWebHistory } from 'vue-router'
import AuthForm from '../components/AuthForm.vue'
import Dashboard from '../components/DashboardComponent.vue'
import Landing from '../components/LandingPage.vue'

const routes = [
  {
    path: '/',
    redirect: 'landing',
  },
  {
    path: '/landing',
    name: 'Landing',
    component: Landing,
  },
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: AuthForm,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Protección de rutas
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user')) // O usa otra forma de obtener el usuario autenticado.

  if (to.matched.some((record) => record.meta.requiresAuth) && !user) {
    next('/login')
  } else if (to.path === '/login' && user) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
