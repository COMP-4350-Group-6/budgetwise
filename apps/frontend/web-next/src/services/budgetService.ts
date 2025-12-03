import type { ApiFetchFn } from "@/hooks/useApi";
import { withCache, invalidateCache } from "@/lib/cache";
import type {
  BudgetDTO,
  BudgetStatus,
  BudgetDashboard,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "@budget/schemas";

// Cache keys
const CACHE_KEYS = {
  dashboard: 'budget:dashboard',
  list: 'budget:list',
  status: (id: string) => `budget:status:${id}`,
} as const;

// ============================================================================
// Budget Service Interface
// ============================================================================

export interface BudgetService {
  getDashboard(): Promise<BudgetDashboard>;
  getBudgetStatus(id: string): Promise<BudgetStatus>;
  listBudgets(activeOnly?: boolean): Promise<BudgetDTO[]>;
  createBudget(input: CreateBudgetInput): Promise<BudgetDTO>;
  updateBudget(id: string, updates: UpdateBudgetInput): Promise<BudgetDTO>;
  deleteBudget(id: string): Promise<void>;
}

// ============================================================================
// Budget Service Factory
// ============================================================================

export function createBudgetService(apiFetch: ApiFetchFn): BudgetService {
  return {
    async getDashboard() {
      return withCache(CACHE_KEYS.dashboard, async () => {
        const response = await apiFetch<{ dashboard: BudgetDashboard }>(
          '/budgets/dashboard',
          {},
          true
        );
        return response.dashboard;
      });
    },

    async getBudgetStatus(id) {
      return withCache(CACHE_KEYS.status(id), async () => {
        const response = await apiFetch<{ status: BudgetStatus }>(
          `/budgets/${id}/status`,
          {},
          true
        );
        return response.status;
      });
    },

    async listBudgets(activeOnly = false) {
      const cacheKey = activeOnly ? `${CACHE_KEYS.list}:active` : CACHE_KEYS.list;
      return withCache(cacheKey, async () => {
        const query = activeOnly ? '?active=true' : '';
        const response = await apiFetch<{ budgets: BudgetDTO[] }>(
          `/budgets${query}`,
          {},
          true
        );
        return response.budgets;
      });
    },

    async createBudget(input) {
      const response = await apiFetch<{ budget: BudgetDTO }>(
        '/budgets',
        { method: 'POST', body: JSON.stringify(input) },
        true
      );
      // Invalidate cache after mutation
      invalidateCache('budget:');
      return response.budget;
    },

    async updateBudget(id, updates) {
      const response = await apiFetch<{ budget: BudgetDTO }>(
        `/budgets/${id}`,
        { method: 'PUT', body: JSON.stringify(updates) },
        true
      );
      // Invalidate cache after mutation
      invalidateCache('budget:');
      return response.budget;
    },

    async deleteBudget(id) {
      await apiFetch<{ message: string }>(
        `/budgets/${id}`,
        { method: 'DELETE' },
        true
      );
      // Invalidate cache after mutation
      invalidateCache('budget:');
    },
  };
}

// Re-export types
export type {
  BudgetDTO,
  BudgetStatus,
  BudgetDashboard,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "@budget/schemas";
