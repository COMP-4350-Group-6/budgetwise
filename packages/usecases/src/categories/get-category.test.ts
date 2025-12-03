import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeGetCategory } from "./get-category";
import { Category } from "@budget/domain";
import type { CategoriesRepo } from "@budget/ports";

describe("Get Category Usecase", () => {
  let mockCategoriesRepo: vi.MockedObject<CategoriesRepo>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCategoriesRepo = {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      listActiveByUser: vi.fn(),
      seedDefaults: vi.fn(),
    };
  });

  const createUsecase = () => makeGetCategory({
    categoriesRepo: mockCategoriesRepo,
  });

  it("should return category when found", async () => {
    const category = new Category({
      id: "cat-123",
      userId: "user-456",
      name: "Food Dining",
      icon: "🍽️",
      isDefault: false,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date("2024-01-10T15:30:00Z"),
      updatedAt: new Date("2024-01-10T15:30:00Z"),
    });

    mockCategoriesRepo.getById.mockResolvedValue(category);

    const usecase = createUsecase();
    const result = await usecase("cat-123");

    expect(result).toEqual({
      id: "cat-123",
      userId: "user-456",
      name: "Food Dining",
      description: null,
      icon: "🍽️",
      color: null,
      isDefault: false,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date("2024-01-10T15:30:00Z"),
      updatedAt: new Date("2024-01-10T15:30:00Z"),
    });

    expect(mockCategoriesRepo.getById).toHaveBeenCalledWith("cat-123");
  });

  it("should return null when category not found", async () => {
    mockCategoriesRepo.getById.mockResolvedValue(null);

    const usecase = createUsecase();
    const result = await usecase("cat-nonexistent");

    expect(result).toBeNull();
    expect(mockCategoriesRepo.getById).toHaveBeenCalledWith("cat-nonexistent");
  });

  it("should handle repository errors", async () => {
    mockCategoriesRepo.getById.mockRejectedValue(new Error("Database connection failed"));

    const usecase = createUsecase();

    await expect(usecase("cat-123")).rejects.toThrow("Database connection failed");
  });
});