/// <reference types="vite/client" />
import { supabase } from '@/lib/supabase';

// Type-safe environment variable access
type Env = {
  VITE_API_URL?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

const getEnv = (): Env => {
  // Type assertion to access import.meta.env
  return (import.meta as unknown as { env: Env }).env;
};

const API_BASE_URL = getEnv().VITE_API_URL || 'http://localhost:8787';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  defaultCurrency: string;
  createdAt?: string;
}

export interface BudgetDashboard {
  totalBudgetCents: number;
  totalSpentCents: number;
  overBudgetCount: number;
  alertCount: number;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    totalBudgetCents: number;
    totalSpentCents: number;
    totalRemainingCents: number;
    overallPercentageUsed: number;
    hasOverBudget: boolean;
  }>;
}

export interface Transaction {
  id: string;
  amountCents: number;
  occurredAt: string;
  categoryId: string;
  budgetId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ErrorResponse {
  error?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async login(credentials: LoginRequest): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async getSessionToken(): Promise<string | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    if (!data.session) {
      return null;
    }
    return data.session.access_token;
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  async getCurrentUser(): Promise<User> {
    const token = await this.getSessionToken();
    if (!token) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as ErrorResponse;
      throw new Error(error?.error || `Failed to get user with status ${response.status}`);
    }

    return (await response.json()) as User;
  }

  async getBudgetDashboard(): Promise<BudgetDashboard> {
    const token = await this.getSessionToken();
    if (!token) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/budgets/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as ErrorResponse;
      throw new Error(error?.error || `Failed to get budget dashboard with status ${response.status}`);
    }

    const data = (await response.json()) as { dashboard: BudgetDashboard };
    return data.dashboard;
  }

  async getTransactions(startDate?: string, endDate?: string): Promise<Transaction[]> {
    const token = await this.getSessionToken();
    if (!token) {
      throw new Error('No active session');
    }

    let url = `${this.baseUrl}/transactions`;
    const params = new URLSearchParams();
    
    if (startDate && endDate) {
      params.append('start', startDate);
      params.append('end', endDate);
    } else {
      // Default to last 30 days if no dates provided
      params.append('days', '30');
    }
    params.append('limit', '1000'); // Get enough transactions for the month
    
    url += `?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as ErrorResponse;
      throw new Error(error?.error || `Failed to get transactions with status ${response.status}`);
    }

    const data = (await response.json()) as { transactions: Transaction[] };
    return data.transactions;
  }
}

export const apiClient = new ApiClient();

