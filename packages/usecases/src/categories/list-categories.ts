import type { Category } from "@budget/domain";
import type { CategoriesRepo } from "@budget/ports";

export function makeListCategories(deps: {
  categoriesRepo: CategoriesRepo;
}) {
  return async (userId: string, activeOnly: boolean = false): Promise<Category[]> => {
    if (activeOnly) {
      return deps.categoriesRepo.listActiveByUser(userId);
    }
    return deps.categoriesRepo.listByUser(userId);
  };
}