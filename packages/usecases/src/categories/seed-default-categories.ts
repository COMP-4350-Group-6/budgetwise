import { Category, DEFAULT_CATEGORIES } from "@budget/domain";
import type { CategoriesRepo } from "@budget/ports";
import type { ClockPort, IdPort } from "@budget/ports";

export function makeSeedDefaultCategories(deps: {
  categoriesRepo: CategoriesRepo;
  clock: ClockPort;
  id: IdPort;
}) {
  return async (userId: string): Promise<Category[]> => {
    // Check if user already has categories
    const existing = await deps.categoriesRepo.listByUser(userId);
    if (existing.length > 0) {
      return existing; // Already seeded
    }

    const now = deps.clock.now();
    const categories: Category[] = [];

    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      const config = DEFAULT_CATEGORIES[i];
      const category = new Category({
        id: deps.id.ulid(),
        userId,
        name: config.name,
        description: config.description,
        icon: config.icon,
        color: config.color,
        isDefault: true,
        isActive: true,
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
      });
      
      await deps.categoriesRepo.create(category);
      categories.push(category);
    }

    return categories;
  };
}