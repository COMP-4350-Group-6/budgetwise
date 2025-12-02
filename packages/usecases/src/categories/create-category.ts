import { Category } from "@budget/domain";
import type { CategoriesRepo } from "@budget/ports";
import type { ClockPort, IdPort } from "@budget/ports";
import type { CategoryDTO } from "@budget/schemas";
import { toCategoryDTO } from "../presenters";

export interface CreateCategoryInput {
  userId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

export function makeCreateCategory(deps: {
  categoriesRepo: CategoriesRepo;
  clock: ClockPort;
  id: IdPort;
}) {
  return async (input: CreateCategoryInput): Promise<CategoryDTO> => {
    const now = deps.clock.now();
    
    const existing = await deps.categoriesRepo.listByUser(input.userId);
    if (existing.some(c => c.props.name.toLowerCase() === input.name.toLowerCase())) {
      throw new Error("Category with this name already exists");
    }
    
    const category = new Category({
      id: deps.id.ulid(),
      userId: input.userId,
      name: input.name.trim(),
      description: input.description,
      icon: input.icon,
      color: input.color,
      isDefault: false,
      isActive: input.isActive ?? true,
      sortOrder: existing.length,
      createdAt: now,
      updatedAt: now,
    });
    
    await deps.categoriesRepo.create(category);
    return toCategoryDTO(category);
  };
}