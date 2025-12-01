import type { CategoriesRepo } from "@budget/ports";
import type { CategoryDTO } from "@budget/schemas";
import { toCategoryDTO } from "../presenters";

export function makeGetCategory(deps: { categoriesRepo: CategoriesRepo }) {
  return async (categoryId: string): Promise<CategoryDTO | null> => {
    const category = await deps.categoriesRepo.getById(categoryId);
    return category ? toCategoryDTO(category) : null;
  };
}
