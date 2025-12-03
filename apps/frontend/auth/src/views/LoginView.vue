<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { LoginInputSchema } from '@budget/schemas';

const router = useRouter();
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
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to BudgetWise
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <router-link to="/signup" class="font-medium text-green-600 hover:text-green-500">
            create a new account
          </router-link>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <!-- Error message -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="text-sm text-red-700">{{ error }}</div>
          </div>
        </div>
        
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              :disabled="isSubmitting"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <router-link to="/forgot-password" class="font-medium text-green-600 hover:text-green-500">
              Forgot your password?
            </router-link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isSubmitting || isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
