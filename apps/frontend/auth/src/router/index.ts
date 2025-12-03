import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import LogoutView from '@/views/LogoutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: 'Sign In - BudgetWise' },
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
      meta: { title: 'Create Account - BudgetWise' },
    },
    {
      path: '/logout',
      name: 'logout',
      component: LogoutView,
      meta: { title: 'Log Out - BudgetWise' },
    },
    // Catch-all redirect to login
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

// Update page title
router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || 'BudgetWise Auth'
  next()
})

export default router
