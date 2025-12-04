<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { LoginInputSchema } from '@budget/schemas';

const route = useRoute();
const { login, isAuthenticated, isLoading, redirectToMainApp } = useAuth();

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const isSubmitting = ref(false);
const showSuccess = ref(false);
const userName = ref('');
const showPassword = ref(false);

// Redirect if already authenticated
watch(
  [isAuthenticated, isLoading],
  ([authenticated, loading]) => {
    if (!loading && authenticated && !showSuccess.value) {
      const redirect = (route.query.redirect as string) || '/home';
      redirectToMainApp(redirect);
    }
  },
  { immediate: true }
);

async function handleSubmit() {
  error.value = null;

  const validation = LoginInputSchema.safeParse({
    email: email.value,
    password: password.value,
  });

  if (!validation.success) {
    error.value = validation.error.issues[0]?.message || 'Invalid input';
    return;
  }

  isSubmitting.value = true;

  try {
    const result = await login(validation.data);

    if (result.success) {
      const fallbackName = email.value.split('@')[0] ?? 'User';
      userName.value = result.data?.user?.name ?? fallbackName;
      showSuccess.value = true;

      setTimeout(() => {
        const redirect = (route.query.redirect as string) || '/home';
        redirectToMainApp(redirect);
      }, 3000);
    } else {
      error.value = result.error?.message || 'Invalid email or password';
    }
  } catch (e) {
    error.value = 'An unexpected error occurred. Please try again.';
    console.error('Login error:', e);
  } finally {
    isSubmitting.value = false;
  }
}

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
});

function togglePassword() {
  showPassword.value = !showPassword.value;
}
</script>

<template>
  <!-- Success Overlay -->
  <div v-if="showSuccess" class="success-overlay">
    <div class="success-card">
      <div class="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 class="success-title">{{ greeting }}, {{ userName }}!</h2>
      <p class="success-subtitle">Welcome back to BudgetWise</p>
      <div class="progress-container">
        <div class="progress-bar"></div>
      </div>
      <p class="redirect-text">Redirecting to dashboard...</p>
    </div>
  </div>

  <!-- Login Form -->
  <div v-else class="auth-container">
    <div class="auth-card">
      <!-- Header Section -->
      <div class="header-section">
        <h1 class="brand-name">BudgetWise</h1>
        <div class="welcome-section">
          <h2 class="welcome-title">{{ greeting }}</h2>
          <p class="welcome-subtitle">Please sign in to continue</p>
        </div>
      </div>

      <!-- Form Section -->
      <form class="auth-form" @submit.prevent="handleSubmit">
        <!-- Error Alert -->
        <div v-if="error" class="error-alert">
          <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <span>{{ error }}</span>
        </div>

        <!-- Email Field -->
        <div class="form-field">
          <label for="email" class="field-label">Email address</label>
          <div class="input-wrapper">
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="form-input"
              placeholder="Enter your email"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <!-- Password Field -->
        <div class="form-field">
          <div class="field-header">
            <label for="password" class="field-label">Password</label>
            <router-link to="/forgot-password" class="forgot-link">Forgot password?</router-link>
          </div>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              class="form-input"
              placeholder="Enter your password"
              :disabled="isSubmitting"
            />
            <button
              type="button"
              class="password-toggle"
              @click="togglePassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isSubmitting || isLoading"
          class="submit-button"
        >
          <span v-if="isSubmitting" class="loading-spinner"></span>
          <span>{{ isSubmitting ? 'Signing in...' : 'Sign in' }}</span>
        </button>

        <!-- Divider -->
        <div class="divider">
          <div class="divider-line"></div>
          <span class="divider-text">or continue with</span>
          <div class="divider-line"></div>
        </div>

        <!-- Social Login -->
        <button type="button" class="social-button" disabled>
          <svg class="social-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <!-- Sign up link -->
        <div class="signup-prompt">
          <span class="signup-text">Don't have an account?</span>
          <router-link to="/signup" class="signup-link">Create one</router-link>
        </div>
      </form>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">© 2025 BudgetWise. All rights reserved.</p>
    </div>
  </div>
</template>

<style scoped>
/* Modern Professional Design System */
:root {
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-200: #bae6fd;
  --primary-300: #7dd3fc;
  --primary-400: #38bdf8;
  --primary-500: #0ea5e9;
  --primary-600: #0284c7;
  --primary-700: #0369a1;
  --primary-800: #075985;
  --primary-900: #0c4a6e;

  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --success-600: #16a34a;

  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  --border-radius: 12px;
  --border-radius-lg: 16px;
}

/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.auth-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* Auth Card */
.auth-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2.5rem 2rem;
  margin-bottom: 2rem;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(14, 165, 233, 0.1) 20%,
    rgba(14, 165, 233, 0.2) 50%,
    rgba(14, 165, 233, 0.1) 80%,
    transparent 100%);
  pointer-events: none;
}

/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 2.5rem;
}

.brand-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.025em;
  margin-bottom: 1.5rem;
}

.welcome-section {
  margin-bottom: 1rem;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Form Styles */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Error Alert */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--error-50);
  border: 1px solid var(--error-500);
  border-radius: var(--border-radius);
  color: var(--error-600);
  font-size: 0.875rem;
  font-weight: 500;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Form Fields */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
}

.forgot-link {
  font-size: 0.75rem;
  color: var(--primary-600);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: var(--primary-700);
  text-decoration: underline;
}

/* Input Wrapper */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  transition: border-color 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  width: 20px;
  height: 20px;
  color: #6b7280;
  z-index: 1;
  pointer-events: none;
}

.input-wrapper:focus-within .input-icon {
  color: #0ea5e9;
}

.form-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  background: transparent;
  outline: none;
  font-weight: 500;
}

.form-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

/* Password Toggle */
.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #6b7280;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #374151;
  background: #f3f4f6;
}

.password-toggle:focus {
  outline: none;
  color: #22c55e;
  background: #f0fdf4;
}

/* Submit Button */
.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: #16a34a;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading Spinner */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--gray-200);
}

.divider-text {
  font-size: 0.75rem;
  color: var(--gray-500);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Social Button */
.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: white;
  color: var(--gray-700);
  border: 2px solid var(--gray-200);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.social-button:hover:not(:disabled) {
  border-color: var(--gray-300);
  background: var(--gray-50);
  box-shadow: var(--shadow);
}

.social-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.social-icon {
  width: 20px;
  height: 20px;
}

/* Signup Prompt */
.signup-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.signup-link {
  color: var(--primary-600);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.signup-link:hover {
  color: var(--primary-700);
  text-decoration: underline;
}

/* Footer */
.footer {
  text-align: center;
}

.footer-text {
  font-size: 0.75rem;
  color: var(--gray-500);
}

/* Success Overlay */
.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.success-card {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(240, 253, 244, 0.95) 50%,
    rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--border-radius-lg);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  padding: 3rem;
  text-align: center;
  max-width: 400px;
  width: 90%;
  position: relative;
  overflow: hidden;
}

.success-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(34, 197, 94, 0.1) 20%,
    rgba(34, 197, 94, 0.2) 50%,
    rgba(34, 197, 94, 0.1) 80%,
    transparent 100%);
  pointer-events: none;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--success-500), var(--success-600));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  box-shadow: var(--shadow-lg);
  animation: successBounce 0.6s ease-out;
}

.success-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}

.success-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.success-subtitle {
  font-size: 1rem;
  color: var(--gray-600);
  margin-bottom: 2.5rem;
}

/* Progress Bar */
.progress-container {
  width: 240px;
  height: 6px;
  background: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
  margin: 0 auto 1.5rem;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--success-500), var(--success-600));
  border-radius: 3px;
  animation: progress 2.5s ease-out forwards;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
}

.redirect-text {
  font-size: 0.875rem;
  color: var(--gray-500);
  font-weight: 500;
}

/* Animations */
@keyframes successBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes progress {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 640px) {
  .auth-container {
    padding: 1rem;
  }

  .auth-card {
    padding: 2rem 1.5rem;
    margin-bottom: 1rem;
  }

  .header-section {
    margin-bottom: 2rem;
  }

  .logo-section {
    margin-bottom: 1.5rem;
  }

  .logo-icon {
    width: 44px;
    height: 44px;
  }

  .logo-icon svg {
    width: 22px;
    height: 22px;
  }

  .brand-name {
    font-size: 1.5rem;
  }

  .welcome-title {
    font-size: 1.25rem;
  }

  .welcome-subtitle {
    font-size: 0.875rem;
  }

  .form-input {
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .submit-button {
    padding: 0.875rem 1.25rem;
  }

  .success-card {
    padding: 2rem 1.5rem;
  }

  .success-title {
    font-size: 1.25rem;
  }

  .success-subtitle {
    font-size: 0.875rem;
  }
}
</style>
