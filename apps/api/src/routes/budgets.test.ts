import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

// Hoist a mock for 'jose' so auth middleware sees a valid user
vi.mock('jose', () => {
  return {
    createRemoteJWKSet: vi.fn(() => ({})),
    jwtVerify: vi.fn(async (token: string) => {
      let sub = token;
      if (token.includes('user-1')) sub = 'user-1';
      else if (token.includes('user-2')) sub = 'user-2';
      else if (token.includes('different-user')) sub = 'different-user';
      return { payload: { sub } } as any;
    }),
  };
});

import { app } from '../app';
import { container } from '../container';

interface BudgetDTO {
  id: string;
  name: string;
  amountCents: number;
  currency: string;
  period: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  alertThreshold?: number;
}

interface BudgetsListResponse {
  budgets: BudgetDTO[];
}

interface BudgetCreateResponse {
  budget: BudgetDTO;
}

interface BudgetUpdateResponse {
  budget: BudgetDTO;
}

interface BudgetDeleteResponse {
  message: string;
}

interface DashboardResponse {
  dashboard: {
    categories: unknown[];
    totalBudgetCents: number;
    totalSpentCents: number;
  };
}

interface ErrorResponse {
  error: string;
}

async function parseJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

describe('Budgets API Integration Tests', () => {
  let testCounter = 0;
  // Ensure SUPABASE_JWT_SECRET is available to the app in tests
  beforeAll(() => {
    const originalFetch = app.fetch.bind(app);
    (app as any).fetch = (req: Request, env?: any, event?: any) =>
      originalFetch(req, { ...(env || {}), SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET }, event);
  });
  let authToken: string;
  let userId: string;
  let categoryId: string;

  beforeEach(async () => {
    // Reset database for test isolation
    (container as any).reset();
    
    // Note: In a real scenario, you'd set up test authentication
    // For now, we'll mock the auth token
    authToken = `test-token-${++testCounter}`;
    userId = `user-${testCounter}`;
    
    // Create a category for budget tests
    const categoryRes = await app.request('/categories', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Category',
        icon: '🏠',
      }),
    });
    
    const categoryData = await parseJson<{ category: { id: string } }>(categoryRes);
    categoryId = categoryData.category.id;
  });

  describe('POST /budgets - Create Budget', () => {
    it('should create a budget with valid data', async () => {
      const res = await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Monthly Groceries',
          amountCents: 50000,
          currency: 'CAD',
          period: 'MONTHLY',
          startDate: '2025-01-01',
        }),
      });

      expect(res.status).toBe(201);
      const data = await parseJson<BudgetCreateResponse>(res);
      expect(data.budget).toBeDefined();
      expect(data.budget.name).toBe('Monthly Groceries');
      expect(data.budget.amountCents).toBe(50000);
    });

    it('should reject budget without authorization', async () => {
      const res = await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Unauthorized Budget',
          amountCents: 50000,
          currency: 'CAD',
          period: 'MONTHLY',
          startDate: '2025-01-01',
        }),
      });

      expect(res.status).toBe(401);
    });

    it('should reject budget with invalid category', async () => {
      const res = await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: 'non-existent-category',
          name: 'Invalid Budget',
          amountCents: 50000,
          currency: 'CAD',
          period: 'MONTHLY',
          startDate: '2025-01-01',
        }),
      });

      expect(res.status).toBe(400);
      const data = await parseJson<ErrorResponse>(res);
      expect(data.error).toContain('Invalid category');
    });

    it('should reject budget with negative amount', async () => {
      const res = await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Negative Budget',
          amountCents: -1000,
          currency: 'CAD',
          period: 'MONTHLY',
          startDate: '2025-01-01',
        }),
      });

      expect(res.status).toBe(400);
    });

    it('should reject budget with invalid period', async () => {
      const res = await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Invalid Period Budget',
          amountCents: 50000,
          currency: 'CAD',
          period: 'INVALID',
          startDate: '2025-01-01',
        }),
      });

      expect(res.status).toBe(400);
    });

    it('should create budget with alert threshold', async () => {
      const res = await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Alert Budget',
          amountCents: 50000,
          currency: 'CAD',
          period: 'MONTHLY',
          startDate: '2025-01-01',
          alertThreshold: 80,
        }),
      });

      expect(res.status).toBe(201);
      const data = await parseJson<BudgetCreateResponse>(res);
      expect(data.budget.alertThreshold).toBe(80);
    });

    it('should create budget with end date', async () => {
      const res = await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Temporary Budget',
          amountCents: 50000,
          currency: 'CAD',
          period: 'MONTHLY',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        }),
      });

      expect(res.status).toBe(201);
      const data = await parseJson<BudgetCreateResponse>(res);
      expect(data.budget.endDate).toBeDefined();
    });
  });

  describe('GET /budgets - List Budgets', () => {
    it('should list all budgets for user', async () => {
      // Create a few budgets
      await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Budget 1',
          amountCents: 50000,
          currency: 'CAD',
          period: 'MONTHLY',
          startDate: '2025-01-01',
        }),
      });

      await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Budget 2',
          amountCents: 30000,
          currency: 'CAD',
          period: 'WEEKLY',
          startDate: '2025-01-01',
        }),
      });

      const res = await app.request('/budgets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = await parseJson<BudgetsListResponse>(res);
      expect(data.budgets).toHaveLength(2);
    });

    it('should filter active budgets only', async () => {
      // Create active budget
      await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Active Budget',
          amountCents: 50000,
          currency: 'CAD',
          period: 'MONTHLY',
          startDate: '2025-01-01',
        }),
      });

      const res = await app.request('/budgets?active=true', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = await parseJson<BudgetsListResponse>(res);
      expect(data.budgets.length).toBeGreaterThan(0);
      expect(data.budgets.every((b) => b.isActive)).toBe(true);
    });
  });

  describe('GET /budgets/dashboard - Dashboard', () => {
    it('should return dashboard data', async () => {
      const res = await app.request('/budgets/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = await parseJson<DashboardResponse>(res);
      expect(data.dashboard).toBeDefined();
      expect(data.dashboard.categories).toBeDefined();
      expect(data.dashboard.totalBudgetCents).toBeDefined();
      expect(data.dashboard.totalSpentCents).toBeDefined();
    });

    it('should require authentication', async () => {
      const res = await app.request('/budgets/dashboard', {
        method: 'GET',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /budgets/:id - Update Budget', () => {
    it('should update budget amount', async () => {
      // Create budget first
      const createRes = await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Update Test',
          amountCents: 50000,
          currency: 'CAD',
          period: 'MONTHLY',
          startDate: '2025-01-01',
        }),
      });

      const createData = await parseJson<BudgetCreateResponse>(createRes);
      const budgetId = createData.budget.id;

      // Update it
      const updateRes = await app.request(`/budgets/${budgetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amountCents: 75000,
        }),
      });

      expect(updateRes.status).toBe(200);
      const updateData = await parseJson<BudgetUpdateResponse>(updateRes);
      expect(updateData.budget.amountCents).toBe(75000);
    });

    it('should reject update from different user', async () => {
      // Create budget
      const createRes = await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Security Test',
          amountCents: 50000,
          currency: 'CAD',
          period: 'MONTHLY',
          startDate: '2025-01-01',
        }),
      });

      const createData = await parseJson<BudgetCreateResponse>(createRes);
      const budgetId = createData.budget.id;

      // Try to update as different user
      const updateRes = await app.request(`/budgets/${budgetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer different-user-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amountCents: 1,
        }),
      });

      expect(updateRes.status).toBe(404); // Not found for different user
    });
  });

  describe('DELETE /budgets/:id - Delete Budget', () => {
    it('should delete budget', async () => {
      // Create budget
      const createRes = await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Delete Test',
          amountCents: 50000,
          currency: 'CAD',
          period: 'MONTHLY',
          startDate: '2025-01-01',
        }),
      });

      const createData = await parseJson<BudgetCreateResponse>(createRes);
      const budgetId = createData.budget.id;

      // Delete it
      const deleteRes = await app.request(`/budgets/${budgetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(deleteRes.status).toBe(200);
      const deleteData = await parseJson<BudgetDeleteResponse>(deleteRes);
      expect(deleteData.message).toContain('deleted');
    });

    it('should reject deleting non-existent budget', async () => {
      const res = await app.request('/budgets/non-existent-id', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(res.status).toBe(404);
    });
  });

  describe('Boundary Tests - Budget Creation', () => {
    it('should handle zero amount budget', async () => {
      const res = await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Zero Budget',
          amountCents: 0,
          currency: 'CAD',
          period: 'MONTHLY',
          startDate: '2025-01-01',
        }),
      });

      expect(res.status).toBe(201);
      const data = await parseJson<BudgetCreateResponse>(res);
      expect(data.budget.amountCents).toBe(0);
    });

    it('should handle maximum safe integer amount', async () => {
      const res = await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Huge Budget',
          amountCents: Number.MAX_SAFE_INTEGER,
          currency: 'CAD',
          period: 'YEARLY',
          startDate: '2025-01-01',
        }),
      });

      expect(res.status).toBe(201);
    });

    it('should handle all budget periods', async () => {
      const periods = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
      
      for (const period of periods) {
        const res = await app.request('/budgets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            categoryId,
            name: `${period} Budget`,
            amountCents: 50000,
            currency: 'CAD',
            period,
            startDate: '2025-01-01',
          }),
        });

        expect(res.status).toBe(201);
        const data = await parseJson<BudgetCreateResponse>(res);
        expect(data.budget.period).toBe(period);
      }
    });
  });
});