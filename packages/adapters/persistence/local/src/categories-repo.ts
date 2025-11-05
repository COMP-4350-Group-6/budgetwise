import type { Category } from "@budget/domain/category";
import type { CategoriesRepo } from "@budget/ports";

export function makeInMemCategoriesRepo(): CategoriesRepo {
  const categories = new Map<string, Category>();

  return {
    async getById(id: string): Promise<Category | null> {
      return categories.get(id) || null;
    },

    async listByUser(userId: string): Promise<Category[]> {
      return Array.from(categories.values())
        .filter(c => c.props.userId === userId)
        .sort((a, b) => a.props.sortOrder - b.props.sortOrder);
    },

    async listActiveByUser(userId: string): Promise<Category[]> {
      return Array.from(categories.values())
        .filter(c => c.props.userId === userId && c.props.isActive)
        .sort((a, b) => a.props.sortOrder - b.props.sortOrder);
    },

    async create(category: Category): Promise<void> {
      categories.set(category.id, category);
    },

    async update(category: Category): Promise<void> {
      categories.set(category.id, category);
    },

    async delete(id: string): Promise<void> {
      categories.delete(id);
    },

    // For testing
    clear() {
      categories.clear();
    },
  };
}