<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { SignupInputSchema } from '@budget/schemas';

const router = useRouter();
const route = useRoute();
const { signup, isAuthenticated, isLoading, redirectToMainApp } = useAuth();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref<string | null>(null);
const isSubmitting = ref(false);

// Redirect if already authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    redirectToMainApp('/home');
  }
});

async function handleSubmit() {
  error.value = null;
  
  // Check password confirmation
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }
  
  // Validate input
  const validation = SignupInputSchema.safeParse({
    name: name.value,
    email: email.value,
    password: password.value,
  });
  
  if (!validation.success) {
    error.value = validation.error.issues[0]?.message || 'Invalid input';
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const result = await signup(validation.data);
    
    if (result.success) {
      redirectToMainApp('/home');
    } else {
      error.value = result.error?.message || 'Signup failed';
    }
  } catch (e) {
    error.value = 'An unexpected error occurred';
    console.error('Signup error:', e);
  } finally {
    isSubmitting.value = false;
  }
}

// Password strength indicator
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
  const isLong = pwd.length >= 12;
  
  const score = [hasLower, hasUpper, hasNumber, hasSpecial, isLong].filter(Boolean).length;
  
  if (score <= 2) passwordStrength.value = 'weak';
  else if (score <= 4) passwordStrength.value = 'medium';
  else passwordStrength.value = 'strong';
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h2 class="auth-title">Create your account</h2>
        <p class="auth-subtitle">
          Already have an account?
          <router-link to="/login" class="link">Sign in</router-link>
        </p>
      </div>
      
      <form class="auth-form" @submit.prevent="handleSubmit">
        <!-- Error message -->
        <div v-if="error" class="error-box">
          <div class="error-text">{{ error }}</div>
        </div>
        
        <div class="form-group">
          <label for="name" class="form-label">Full name</label>
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
        
        <div class="form-group">
          <label for="email" class="form-label">Email address</label>
          <input
            id="email"
            v-model="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="form-input"
            placeholder="you@example.com"
            :disabled="isSubmitting"
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            autocomplete="new-password"
            required
            class="form-input"
            placeholder="Minimum 8 characters"
            :disabled="isSubmitting"
            @input="checkPasswordStrength(password)"
          />
          <!-- Password strength indicator -->
          <div v-if="passwordStrength" class="password-strength">
            <div class="strength-bars">
              <div 
                class="strength-bar"
                :class="passwordStrength"
              />
              <div 
                class="strength-bar"
                :class="passwordStrength !== 'weak' ? passwordStrength : ''"
              />
              <div 
                class="strength-bar"
                :class="passwordStrength === 'strong' ? 'strong' : ''"
              />
            </div>
            <p class="strength-text" :class="passwordStrength">
              {{ passwordStrength === 'weak' ? 'Weak password' : passwordStrength === 'medium' ? 'Medium strength' : 'Strong password' }}
            </p>
          </div>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            name="confirmPassword"
            type="password"
            autocomplete="new-password"
            required
            class="form-input"
            placeholder="Confirm your password"
            :disabled="isSubmitting"
          />
        </div>

        <div>
          <button
            type="submit"
            :disabled="isSubmitting || isLoading"
            class="btn btn-primary"
          >
            <span v-if="isSubmitting">Creating account...</span>
            <span v-else>Create account</span>
          </button>
        </div>
        
        <p class="text-xs text-center text-muted">
          By creating an account, you agree to our
          <a href="#" class="link">Terms of Service</a>
          and
          <a href="#" class="link">Privacy Policy</a>.
        </p>
      </form>
    </div>
  </div>
</template>
