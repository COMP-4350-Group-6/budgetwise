import type { CategoriesRepo } from "@budget/ports";
import type { CategoryDTO } from "@budget/schemas";
import { toCategoryDTOList } from "../presenters";

export function makeListCategories(deps: {
  categoriesRepo: CategoriesRepo;
}) {
  return async (userId: string, activeOnly: boolean = false): Promise<CategoryDTO[]> => {
    if (activeOnly) {
      const categories = await deps.categoriesRepo.listActiveByUser(userId);
      return toCategoryDTOList(categories);
    }
    const categories = await deps.categoriesRepo.listByUser(userId);
    return toCategoryDTOList(categories);
  };
}