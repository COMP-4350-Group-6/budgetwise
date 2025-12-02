import { Category } from "@budget/domain";
import type { CategoriesRepo } from "@budget/ports";
import type { ClockPort } from "@budget/ports";
import type { CategoryDTO } from "@budget/schemas";
import { toCategoryDTO } from "../presenters";

export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export function makeUpdateCategory(deps: {
  categoriesRepo: CategoriesRepo;
  clock: ClockPort;
}) {
  return async (id: string, userId: string, updates: UpdateCategoryInput): Promise<CategoryDTO> => {
    const existing = await deps.categoriesRepo.getById(id);
    
    if (!existing) {
      throw new Error("Category not found");
    }
    
    if (existing.props.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    const updated = new Category({
      ...existing.props,
      name: updates.name !== undefined ? updates.name.trim() : existing.props.name,
      description: updates.description !== undefined ? updates.description ?? undefined : existing.props.description,
      icon: updates.icon !== undefined ? updates.icon ?? undefined : existing.props.icon,
      color: updates.color !== undefined ? updates.color ?? undefined : existing.props.color,
      isActive: updates.isActive !== undefined ? updates.isActive : existing.props.isActive,
      sortOrder: updates.sortOrder !== undefined ? updates.sortOrder : existing.props.sortOrder,
      updatedAt: deps.clock.now(),
    });
    
    await deps.categoriesRepo.update(updated);
    return toCategoryDTO(updated);
  };
}