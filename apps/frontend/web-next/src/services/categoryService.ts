import type { ApiFetchFn } from "@/hooks/useApi";
import { withCache, invalidateCache } from "@/lib/cache";
import type {
  CategoryDTO,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@budget/schemas";

// Cache keys
const CACHE_KEYS = {
  list: 'category:list',
} as const;

// ============================================================================
// Category Service Interface
// ============================================================================

export interface CategoryService {
  listCategories(activeOnly?: boolean): Promise<CategoryDTO[]>;
  seedDefaultCategories(): Promise<CategoryDTO[]>;
  createCategory(input: CreateCategoryInput): Promise<CategoryDTO>;
  updateCategory(id: string, updates: UpdateCategoryInput): Promise<CategoryDTO>;
  deleteCategory(id: string): Promise<void>;
}

// ============================================================================
// Category Service Factory
// ============================================================================

export function createCategoryService(apiFetch: ApiFetchFn): CategoryService {
  return {
    async listCategories(activeOnly = false) {
      const cacheKey = activeOnly ? `${CACHE_KEYS.list}:active` : CACHE_KEYS.list;
      
      return withCache(cacheKey, async () => {
        const query = activeOnly ? '?active=true' : '';
        const response = await apiFetch<{ categories: CategoryDTO[] }>(
          `/categories${query}`,
          {},
          true
        );
        return response.categories;
      });
    },

    async seedDefaultCategories() {
      const response = await apiFetch<{ categories: CategoryDTO[]; message: string }>(
        '/categories/seed',
        { method: 'POST' },
        true
      );
      // Invalidate cache after mutation
      invalidateCache('category:');
      return response.categories;
    },

    async createCategory(input) {
      const response = await apiFetch<{ category: CategoryDTO }>(
        '/categories',
        { method: 'POST', body: JSON.stringify(input) },
        true
      );
      // Invalidate cache after mutation
      invalidateCache('category:');
      return response.category;
    },

    async updateCategory(id, updates) {
      const response = await apiFetch<{ category: CategoryDTO }>(
        `/categories/${id}`,
        { method: 'PUT', body: JSON.stringify(updates) },
        true
      );
      // Invalidate cache after mutation
      invalidateCache('category:');
      return response.category;
    },

    async deleteCategory(id) {
      await apiFetch<{ message: string }>(
        `/categories/${id}`,
        { method: 'DELETE' },
        true
      );
      // Invalidate cache after mutation
      invalidateCache('category:');
    },
  };
}

// Re-export types
export type {
  CategoryDTO,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@budget/schemas";
