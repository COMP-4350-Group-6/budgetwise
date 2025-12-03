<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { config } from '@/config';

const { logout } = useAuth();

const isLoggingOut = ref(false);
const logoutComplete = ref(false);
const error = ref<string | null>(null);

async function handleLogout() {
  isLoggingOut.value = true;
  error.value = null;
  
  try {
    await logout();
    logoutComplete.value = true;
    
    // Redirect to login after short delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  } catch (e) {
    error.value = 'Failed to logout. Please try again.';
    console.error('Logout error:', e);
  } finally {
    isLoggingOut.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div v-if="logoutComplete">
        <h2 class="text-2xl font-bold text-gray-900">You've been logged out</h2>
        <p class="mt-2 text-gray-600">Redirecting to login...</p>
      </div>
      
      <div v-else>
        <h2 class="text-2xl font-bold text-gray-900">Log out of BudgetWise?</h2>
        <p class="mt-2 text-gray-600">You'll need to sign in again to access your account.</p>
        
        <div v-if="error" class="mt-4 rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">{{ error }}</div>
        </div>
        
        <div class="mt-6 flex gap-4 justify-center">
          <button
            @click="handleLogout"
            :disabled="isLoggingOut"
            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <span v-if="isLoggingOut">Logging out...</span>
            <span v-else>Log out</span>
          </button>
          
          <a
            :href="config.mainAppUrl"
            class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
