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
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Already have an account?
          <router-link to="/login" class="font-medium text-green-600 hover:text-green-500">
            Sign in
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
        
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Full name</label>
            <input
              id="name"
              v-model="name"
              name="name"
              type="text"
              autocomplete="name"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="John Doe"
              :disabled="isSubmitting"
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="you@example.com"
              :disabled="isSubmitting"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Minimum 8 characters"
              :disabled="isSubmitting"
              @input="checkPasswordStrength(password)"
            />
            <!-- Password strength indicator -->
            <div v-if="passwordStrength" class="mt-1">
              <div class="flex gap-1">
                <div 
                  class="h-1 flex-1 rounded"
                  :class="{
                    'bg-red-500': passwordStrength === 'weak',
                    'bg-yellow-500': passwordStrength === 'medium',
                    'bg-green-500': passwordStrength === 'strong',
                  }"
                />
                <div 
                  class="h-1 flex-1 rounded"
                  :class="{
                    'bg-gray-200': passwordStrength === 'weak',
                    'bg-yellow-500': passwordStrength === 'medium',
                    'bg-green-500': passwordStrength === 'strong',
                  }"
                />
                <div 
                  class="h-1 flex-1 rounded"
                  :class="{
                    'bg-gray-200': passwordStrength !== 'strong',
                    'bg-green-500': passwordStrength === 'strong',
                  }"
                />
              </div>
              <p class="text-xs mt-1" :class="{
                'text-red-600': passwordStrength === 'weak',
                'text-yellow-600': passwordStrength === 'medium',
                'text-green-600': passwordStrength === 'strong',
              }">
                {{ passwordStrength === 'weak' ? 'Weak password' : passwordStrength === 'medium' ? 'Medium strength' : 'Strong password' }}
              </p>
            </div>
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm password</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Confirm your password"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isSubmitting || isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">Creating account...</span>
            <span v-else>Create account</span>
          </button>
        </div>
        
        <p class="text-xs text-center text-gray-500">
          By creating an account, you agree to our
          <a href="#" class="text-green-600 hover:text-green-500">Terms of Service</a>
          and
          <a href="#" class="text-green-600 hover:text-green-500">Privacy Policy</a>.
        </p>
      </form>
    </div>
  </div>
</template>
