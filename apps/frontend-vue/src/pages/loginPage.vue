<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">BudgetWise</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="label">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="john.doe@example.com"
            class="input"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password" class="label">Password</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="input password-input"
              required
              :disabled="isLoading"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="toggle-password"
              :disabled="isLoading"
              aria-label="Toggle password visibility"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <a href="#" class="forgot-password">Forgot password?</a>
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="isLoading || !email || !password"
        >
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="footer">
        <p class="footer-text">
          Don't have an account?
          <a href="#" class="signup-link">Sign up here</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiClient } from '@/services/apiClient';

const router = useRouter();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    await apiClient.login({
      email: email.value,
      password: password.value,
    });

    // Get user info from Supabase
    const user = await apiClient.getCurrentUser();
    localStorage.setItem('user', JSON.stringify(user));

    // Navigate to success page
    router.push('/success');
  } catch (err) {
    console.error('Login failed:', err);
    error.value = err instanceof Error 
      ? err.message 
      : 'Invalid credentials or server error. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 32px;
}

.error-message {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 24px;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.password-wrapper {
  position: relative;
}

.password-input {
  padding-right: 48px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  color: #666;
  transition: color 0.2s;
}

.toggle-password:hover:not(:disabled) {
  color: #333;
}

.toggle-password:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.forgot-password {
  font-size: 14px;
  color: #667eea;
  text-decoration: none;
  text-align: center;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #5568d3;
}

.submit-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 48px;
}

.submit-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.footer {
  margin-top: 24px;
  text-align: center;
}

.footer-text {
  font-size: 14px;
  color: #666;
}

.signup-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.2s;
}

.signup-link:hover {
  color: #5568d3;
}
</style>

