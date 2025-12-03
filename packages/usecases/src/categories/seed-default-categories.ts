import { Category, DEFAULT_CATEGORIES } from "@budget/domain";
import type { CategoriesRepo } from "@budget/ports";
import type { ClockPort, IdPort } from "@budget/ports";
import type { CategoryDTO } from "@budget/schemas";
import { toCategoryDTOList } from "../presenters";

export interface SeedCategoriesResult {
  categories: CategoryDTO[];
  created: number;
  message: string;
}

export function makeSeedDefaultCategories(deps: {
  categoriesRepo: CategoriesRepo;
  clock: ClockPort;
  id: IdPort;
}) {
  return async (userId: string): Promise<SeedCategoriesResult> => {
    // Check if user already has categories
    const existing = await deps.categoriesRepo.listByUser(userId);
    if (existing.length > 0) {
      return {
        categories: [],
        created: 0,
        message: "Categories already seeded",
      };
    }

    const now = deps.clock.now();
    const categories: Category[] = [];

    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      const config = DEFAULT_CATEGORIES[i];
      if (!config) continue;
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

    const dtos = toCategoryDTOList(categories);
    return {
      categories: dtos,
      created: dtos.length,
      message: `Seeded ${dtos.length} default categories`,
    };
  };
}