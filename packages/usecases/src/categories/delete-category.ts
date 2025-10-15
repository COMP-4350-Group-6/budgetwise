import type { CategoriesRepo, BudgetsRepo } from "@budget/ports";

export function makeDeleteCategory(deps: {
  categoriesRepo: CategoriesRepo;
  budgetsRepo: BudgetsRepo;
}) {
  return async (id: string, userId: string): Promise<void> => {
    const category = await deps.categoriesRepo.getById(id);
    
    if (!category) {
      throw new Error("Category not found");
    }
    
    if (category.props.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    // Check if any budgets use this category
    const budgets = await deps.budgetsRepo.listByCategory(userId, id);
    if (budgets.length > 0) {
      throw new Error("Cannot delete category with active budgets");
    }
    
    await deps.categoriesRepo.delete(id);
  };
}