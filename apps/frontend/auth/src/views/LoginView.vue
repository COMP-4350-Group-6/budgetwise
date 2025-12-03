<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { LoginInputSchema } from '@budget/schemas';

const route = useRoute();
const { login, isAuthenticated, isLoading, redirectToMainApp } = useAuth();

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const isSubmitting = ref(false);

// Redirect if already authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    const redirect = (route.query.redirect as string) || '/home';
    redirectToMainApp(redirect);
  }
});

async function handleSubmit() {
  error.value = null;
  
  // Validate input
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
      const redirect = (route.query.redirect as string) || '/home';
      redirectToMainApp(redirect);
    } else {
      error.value = result.error?.message || 'Login failed';
    }
  } catch (e) {
    error.value = 'An unexpected error occurred';
    console.error('Login error:', e);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h2 class="auth-title">Sign in to BudgetWise</h2>
        <p class="auth-subtitle">
          Or
          <router-link to="/signup" class="link">create a new account</router-link>
        </p>
      </div>
      
      <form class="auth-form" @submit.prevent="handleSubmit">
        <!-- Error message -->
        <div v-if="error" class="error-box">
          <div class="error-text">{{ error }}</div>
        </div>
        
        <div class="input-stack">
          <div class="form-group">
            <label for="email" class="form-label-sr">Email address</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="form-input"
              placeholder="Email address"
              :disabled="isSubmitting"
            />
          </div>
          <div class="form-group">
            <label for="password" class="form-label-sr">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="form-input"
              placeholder="Password"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="flex justify-center">
          <div class="text-sm">
            <router-link to="/forgot-password" class="link">
              Forgot your password?
            </router-link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isSubmitting || isLoading"
            class="btn btn-primary"
          >
            <span v-if="isSubmitting">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
