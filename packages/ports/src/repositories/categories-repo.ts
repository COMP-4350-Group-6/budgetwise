import type { Category } from "@budget/domain/category";

export interface CategoriesRepo {
  getById(id: string): Promise<Category | null>;
  listByUser(userId: string): Promise<Category[]>;
  listActiveByUser(userId: string): Promise<Category[]>;
  create(category: Category): Promise<void>;
  update(category: Category): Promise<void>;
  delete(id: string): Promise<void>;
}