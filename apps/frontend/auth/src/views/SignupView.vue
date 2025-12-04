<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { SignupInputSchema } from '@budget/schemas';

const route = useRoute();
const { signup, isAuthenticated, isLoading, redirectToMainApp } = useAuth();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref<string | null>(null);
const isSubmitting = ref(false);
const showSuccess = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

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

  const validation = SignupInputSchema.safeParse({
    name: name.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  });

  if (!validation.success) {
    error.value = validation.error.issues[0]?.message || 'Invalid input';
    return;
  }

  isSubmitting.value = true;

  try {
    const result = await signup(validation.data);

    if (result.success) {
      showSuccess.value = true;
      // Remove automatic redirect - user needs to confirm email first
      // setTimeout(() => {
      //   redirectToMainApp('/home');
      // }, 3000);
    } else {
      error.value = result.error?.message || 'Signup failed. Please try again.';
    }
  } catch (e) {
    error.value = 'An unexpected error occurred. Please try again.';
    console.error('Signup error:', e);
  } finally {
    isSubmitting.value = false;
  }
}

// Password strength
const passwordStrength = ref<'weak' | 'medium' | 'strong' | null>(null);

function checkPasswordStrength(pwd: string) {
  if (!pwd) {
    passwordStrength.value = null;
    return;
  }

  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
  const isLongEnough = pwd.length >= 12;

  const requirements = [hasLower, hasUpper, hasNumber, hasSpecial, isLongEnough];
  const metRequirements = requirements.filter(Boolean).length;

  if (metRequirements < 3) passwordStrength.value = 'weak';
  else if (metRequirements < 5) passwordStrength.value = 'medium';
  else passwordStrength.value = 'strong';
}

const strengthLabel = computed(() => {
  switch (passwordStrength.value) {
    case 'weak': return 'Weak password';
    case 'medium': return 'Good, getting stronger';
    case 'strong': return 'Strong password!';
    default: return '';
  }
});

const firstName = computed(() => name.value.split(' ')[0] || 'there');

function togglePassword() {
  showPassword.value = !showPassword.value;
}

function toggleConfirmPassword() {
  showConfirmPassword.value = !showConfirmPassword.value;
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
      <h2 class="success-title">Welcome to BudgetWise, {{ firstName }}!</h2>
      <p class="success-subtitle">Your account has been created successfully. Please check your email for a confirmation link to complete your registration.</p>
      <div class="progress-container">
        <div class="progress-bar"></div>
      </div>
      <p class="redirect-text">Please check your email and click the confirmation link to continue.</p>
    </div>
  </div>

  <!-- Signup Form -->
  <div v-else class="auth-container">
    <div class="auth-card">
      <!-- Header Section -->
      <div class="header-section">
        <h1 class="brand-name">BudgetWise</h1>
        <div class="welcome-section">
          <h2 class="welcome-title">Create your account</h2>
          <p class="welcome-subtitle">Start your journey to financial freedom</p>
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

        <!-- Name Field -->
        <div class="form-field">
          <label for="name" class="field-label">Full name</label>
          <div class="input-wrapper">
            <input
              id="name"
              v-model="name"
              name="name"
              type="text"
              autocomplete="name"
              required
              class="form-input"
              placeholder="John Doe"
              :disabled="isSubmitting"
            />
          </div>
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
          <label for="password" class="field-label">Password</label>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              class="form-input"
              placeholder="Create a strong password"
              :disabled="isSubmitting"
              @input="checkPasswordStrength(password)"
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
          <div v-if="passwordStrength" class="password-strength">
            <div class="strength-bars">
              <div class="strength-bar" :class="passwordStrength"></div>
              <div class="strength-bar" :class="passwordStrength !== 'weak' ? passwordStrength : ''"></div>
              <div class="strength-bar" :class="passwordStrength === 'strong' ? 'strong' : ''"></div>
            </div>
            <p class="strength-text" :class="passwordStrength">{{ strengthLabel }}</p>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="form-field">
          <label for="confirmPassword" class="field-label">Confirm password</label>
          <div class="input-wrapper">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              name="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              class="form-input"
              placeholder="Confirm your password"
              :disabled="isSubmitting"
            />
            <button
              type="button"
              class="password-toggle"
              @click="toggleConfirmPassword"
              :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
            >
              <svg v-if="!showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <!-- Password match indicator -->
          <div v-if="confirmPassword && password" class="password-match">
            <span v-if="password === confirmPassword" class="match-success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Passwords match
            </span>
            <span v-else class="match-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Passwords don't match
            </span>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isSubmitting || isLoading"
          class="submit-button"
        >
          <span v-if="isSubmitting" class="loading-spinner"></span>
          <span>{{ isSubmitting ? 'Creating account...' : 'Create account' }}</span>
        </button>

        <!-- Sign in link -->
        <div class="signup-prompt">
          <span class="signup-text">Already have an account?</span>
          <router-link to="/login" class="signup-link">Sign in</router-link>
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

  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-600: #d97706;

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

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
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

.form-input {
  width: 100%;
  padding: 0.75rem;
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

/* Password Strength Indicator */
.password-strength {
  margin-top: 0.5rem;
}

.strength-bars {
  display: flex;
  gap: 0.25rem;
}

.strength-bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: var(--gray-200);
  transition: background 0.3s ease;
}

.strength-bar.weak {
  background: var(--error-500);
}

.strength-bar.medium {
  background: var(--warning-500);
}

.strength-bar.strong {
  background: var(--success-500);
}

.strength-text {
  font-size: 0.75rem;
  margin-top: 0.375rem;
  font-weight: 500;
}

.strength-text.weak {
  color: var(--error-600);
}

.strength-text.medium {
  color: var(--warning-600);
}

.strength-text.strong {
  color: var(--success-600);
}

/* Password Match Indicator */
.password-match {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  margin-top: 0.375rem;
}

.match-success {
  color: var(--success-600);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.match-error {
  color: var(--error-600);
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
    padding: 0.75rem;
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
