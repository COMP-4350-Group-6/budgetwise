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
  <div class="auth-page">
    <div class="auth-container text-center">
      <div v-if="logoutComplete">
        <h2 class="auth-title">You've been logged out</h2>
        <p class="auth-subtitle mt-2">Redirecting to login...</p>
      </div>
      
      <div v-else>
        <h2 class="auth-title">Log out of BudgetWise?</h2>
        <p class="auth-subtitle mt-2">You'll need to sign in again to access your account.</p>
        
        <div v-if="error" class="error-box mt-4">
          <div class="error-text">{{ error }}</div>
        </div>
        
        <div class="mt-6 flex gap-4 justify-center">
          <button
            @click="handleLogout"
            :disabled="isLoggingOut"
            class="btn btn-danger"
          >
            <span v-if="isLoggingOut">Logging out...</span>
            <span v-else>Log out</span>
          </button>
          
          <a
            :href="config.mainAppUrl"
            class="btn btn-secondary"
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
