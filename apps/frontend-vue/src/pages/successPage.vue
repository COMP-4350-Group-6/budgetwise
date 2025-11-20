<template>
  <div class="success-container">
    <div class="success-card">
      <div class="success-icon">✓</div>
      <h1 class="success-title">Login Successful!</h1>
      <p class="success-message">You have successfully logged in to BudgetWise.</p>
      
      <div v-if="user" class="user-info">
        <div class="info-item">
          <span class="info-label">Name:</span>
          <span class="info-value">{{ user.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email:</span>
          <span class="info-value">{{ user.email }}</span>
        </div>
      </div>

      <div v-if="budgetLoading" class="budget-info">
        <h3 class="budget-title">Budget Overview</h3>
        <p class="loading-text">Loading budget data...</p>
      </div>
      <div v-else-if="budgetError" class="budget-info">
        <h3 class="budget-title">Budget Overview</h3>
        <p class="error-text">{{ budgetError }}</p>
      </div>
      <div v-else-if="budget" class="budget-info">
        <h3 class="budget-title">Budget Overview</h3>
        <div class="budget-item">
          <span class="budget-label">Current Budget:</span>
          <span class="budget-value">${{ formatCurrency(budget.totalBudgetCents) }}</span>
        </div>
        <div class="budget-item">
          <span class="budget-label">Used:</span>
          <span class="budget-value used">${{ formatCurrency(budget.totalSpentCents) }}</span>
        </div>
        <div class="budget-item">
          <span class="budget-label">Remaining:</span>
          <span class="budget-value remaining">${{ formatCurrency(budget.totalBudgetCents - budget.totalSpentCents) }}</span>
        </div>
        <div class="budget-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${budgetPercentage}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ budgetPercentage.toFixed(1) }}% used</span>
        </div>
      </div>

      <div class="actions">
        <button @click="handleLogout" class="logout-button">
          Logout
        </button>
        <button @click="goToLogin" class="back-button">
          Back to Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiClient, type User } from '@/services/apiClient';

const router = useRouter();

const user = ref<User | null>(null);
const budget = ref<BudgetDashboard | null>(null);
const budgetLoading = ref(false);
const budgetError = ref<string | null>(null);

const budgetPercentage = computed(() => {
  if (!budget.value || budget.value.totalBudgetCents === 0) return 0;
  return (budget.value.totalSpentCents / budget.value.totalBudgetCents) * 100;
});

const formatCurrency = (cents: number): string => {
  return (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const fetchBudgetData = async () => {
  budgetLoading.value = true;
  budgetError.value = null;

  try {
    const dashboard = await apiClient.getBudgetDashboard();
    budget.value = dashboard;
  } catch (err) {
    console.error('Failed to fetch budget data:', err);
    budgetError.value = err instanceof Error 
      ? err.message 
      : 'Failed to load budget data';
  } finally {
    budgetLoading.value = false;
  }
};

onMounted(async () => {
  // Load user from API (Supabase)
  try {
    user.value = await apiClient.getCurrentUser();
    // Also store in localStorage for quick access
    localStorage.setItem('user', JSON.stringify(user.value));
  } catch (e) {
    console.error('Failed to get user:', e);
    // Fallback to localStorage if API fails
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch (parseError) {
        console.error('Failed to parse user from localStorage:', parseError);
      }
    }
  }

  // Fetch budget data from API
  fetchBudgetData();
});

const handleLogout = async () => {
  try {
    await apiClient.logout();
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.removeItem('user');
    router.push('/login');
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.success-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 48px 40px;
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 48px;
  color: white;
  font-weight: bold;
}

.success-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.success-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
}

.user-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #495057;
}

.info-value {
  color: #212529;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 32px;
}

.logout-button,
.back-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button {
  background: #dc3545;
  color: white;
}

.logout-button:hover {
  background: #c82333;
}

.back-button {
  background: #6c757d;
  color: white;
}

.back-button:hover {
  background: #5a6268;
}

.budget-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
}

.budget-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  text-align: center;
}

.budget-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.budget-item:last-of-type {
  border-bottom: none;
}

.budget-label {
  font-weight: 600;
  color: #495057;
  font-size: 16px;
}

.budget-value {
  color: #212529;
  font-size: 18px;
  font-weight: 600;
}

.budget-value.used {
  color: #667eea;
}

.budget-value.remaining {
  color: #28a745;
}

.loading-text,
.error-text {
  text-align: center;
  padding: 16px;
  color: #666;
}

.error-text {
  color: #dc3545;
}

.budget-progress {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background-color: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
  border-radius: 6px;
}

.progress-text {
  font-size: 14px;
  color: #666;
  text-align: center;
  display: block;
}
</style>

