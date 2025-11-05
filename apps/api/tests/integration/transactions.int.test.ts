import { describe, it, expect, beforeAll, vi } from 'vitest';

// Hoist a mock for 'jose' so auth middleware sees a valid user
vi.mock('jose', () => {
  return {
    createRemoteJWKSet: vi.fn(() => ({})),
    jwtVerify: vi.fn(async (token: string) => {
      let sub = token;
      if (token.includes('user-1')) sub = 'user-1';
      else if (token.includes('user-2')) sub = 'user-2';
      else if (token.includes('test-token')) sub = 'test-user-123';
      return { payload: { sub } } as any;
    }),
  };
});

import { app } from '../../src/app';
import { container } from '../../src/container';

interface CategoryCreateResponse {
  category: {
    id: string;
    name: string;
    isActive: boolean;
    isDefault: boolean;
  };
}

interface BudgetCreateResponse {
  budget: {
    id: string;
    categoryId: string;
    name: string;
    amountCents: number;
    currency: string;
    period: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
  };
}

interface DashboardResponse {
  dashboard: {
    categories: Array<{
      categoryId: string;
      totalBudgetCents: number;
      totalSpentCents: number;
      totalRemainingCents: number;
      budgets: Array<{
        budget: { id: string; amountCents: number };
        spentCents: number;
      }>;
    }>;
    totalBudgetCents: number;
    totalSpentCents: number;
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

describe('Integration: Category + Budget + Transaction -> Dashboard', () => {
  // Ensure SUPABASE_JWT_SECRET is available to the app in tests
  beforeAll(() => {
    // Reset database for test isolation
    (container as any).reset();
    
    const originalFetch = app.fetch.bind(app);
    (app as any).fetch = (req: Request, env?: any, event?: any) =>
      originalFetch(req, { ...(env || {}), SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET }, event);
  });
  const authToken = 'test-token';        // matches existing tests
  const userId = 'test-user-123';        // body-provided for /transactions (no auth middleware there)

  it('should reflect added transaction in dashboard totals', async () => {
    // 1) Create category
    const catRes = await app.request('/categories', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Groceries', isActive: true }),
    });
    expect(catRes.status).toBe(201);
    const catData = await parseJson<CategoryCreateResponse>(catRes);
    const categoryId = catData.category.id;

    // 2) Create budget for category
    const budgetRes = await app.request('/budgets', {
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
        startDate: '2000-01-01',
      }),
    });
    expect(budgetRes.status).toBe(201);
    const budgetData = await parseJson<BudgetCreateResponse>(budgetRes);
    const budgetId = budgetData.budget.id;

    // 3) Add transaction against this budget
    const txRes = await app.request('/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        budgetId,
        amountCents: 42500,
        categoryId,
        note: 'Grocery spend',
        occurredAt: new Date().toISOString(),
      }),
    });
    expect(txRes.status).toBe(201);

    // 4) Read dashboard and assert category totals decreased by transaction amount
    const dashRes = await app.request('/budgets/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    expect(dashRes.status).toBe(200);
    const dash = await parseJson<DashboardResponse>(dashRes);

    // Find our category summary
    const catSummary = dash.dashboard.categories.find(c => c.categoryId === categoryId);
    expect(catSummary).toBeDefined();
    expect(catSummary!.totalBudgetCents).toBe(50000);
    expect(catSummary!.totalSpentCents).toBe(42500);
    expect(catSummary!.totalRemainingCents).toBe(50000 - 42500);

    // Budget-level status should reflect spend too
    const budgetStatus = catSummary!.budgets.find(b => b.budget.id === budgetId);
    expect(budgetStatus).toBeDefined();
    expect(budgetStatus!.spentCents).toBe(42500);

    // Dashboard aggregate totals
    expect(dash.dashboard.totalBudgetCents).toBeGreaterThan(0);
    expect(dash.dashboard.totalSpentCents).toBeGreaterThan(0);
  });
});