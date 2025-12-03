import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from '../App.vue'
import LoginView from '../views/LoginView.vue'

// Mock the useAuth composable
vi.mock('../composables/useAuth', () => ({
  useAuth: () => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    isAuthenticated: false,
    user: null,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    redirectToMainApp: vi.fn(),
  }),
}))

describe('App', () => {
  it('renders login view when not loading', async () => {
    // Create router
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: LoginView },
      ],
    })

    // Create pinia store
    const pinia = createPinia()

    const wrapper = mount(App, {
      global: {
        plugins: [router, pinia],
      },
    })

    // Wait for router to be ready
    await router.isReady()

    // Should not show loading screen
    expect(wrapper.text()).not.toContain('Loading...')

    // Should contain login form elements
    expect(wrapper.text()).toContain('Sign in to BudgetWise Or create a new accountEmail addressPassword Forgot your password? Sign in')
  })
})
