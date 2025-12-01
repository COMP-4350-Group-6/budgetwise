import { describe, it, expect, beforeEach } from 'vitest';
import { makeCreateCategory } from './create-category';
import { makeInMemCategoriesRepo } from '@budget/adapters-persistence-local';
import { makeSystemClock, makeUlid } from '@budget/adapters-system';

describe('createCategory', () => {
  let categoriesRepo: ReturnType<typeof makeInMemCategoriesRepo>;
  let createCategory: ReturnType<typeof makeCreateCategory>;
  let clock: ReturnType<typeof makeSystemClock>;
  let id: ReturnType<typeof makeUlid>;

  beforeEach(() => {
    categoriesRepo = makeInMemCategoriesRepo();
    clock = makeSystemClock();
    id = makeUlid();
    createCategory = makeCreateCategory({ categoriesRepo, clock, id });
  });

  it('should create a new category with required fields', async () => {
    const input = {
      userId: 'user-123',
      name: 'Groceries',
    };

    const category = await createCategory(input);

    expect(category).toHaveProperty("id");
    expect(category.userId).toBe(input.userId);
    expect(category.name).toBe(input.name);
    expect(category.isDefault).toBe(false);
    expect(category.isActive).toBe(true);
    expect(category.id).toBeDefined();
    expect(category.createdAt).toBeInstanceOf(Date);
    expect(category.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a category with all optional fields', async () => {
    const input = {
      userId: 'user-123',
      name: 'Entertainment',
      description: 'Movies, games, and fun activities',
      icon: '🎬',
      color: '#FF5733',
      isActive: true,
    };

    const category = await createCategory(input);

    expect(category.description).toBe(input.description);
    expect(category.icon).toBe(input.icon);
    expect(category.color).toBe(input.color);
    expect(category.isActive).toBe(input.isActive);
  });

  it('should persist the category to the repository', async () => {
    const input = {
      userId: 'user-123',
      name: 'Groceries',
      icon: '🛒',
    };

    const category = await createCategory(input);
    // Repo returns domain entity with .props, usecase returns DTO
    const retrieved = await categoriesRepo.getById(category.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.props.id).toBe(category.id);
    expect(retrieved?.props.name).toBe(input.name);
    expect(retrieved?.props.icon).toBe(input.icon);
  });

  it('should allow creating categories with same name for different users', async () => {
    const category1 = await createCategory({
      userId: 'user-1',
      name: 'Food',
    });

    const category2 = await createCategory({
      userId: 'user-2',
      name: 'Food',
    });

    expect(category1.id).not.toBe(category2.id);
    expect(category1.userId).toBe('user-1');
    expect(category2.userId).toBe('user-2');
  });

  it('should set default sortOrder', async () => {
    const category = await createCategory({
      userId: 'user-123',
      name: 'Test',
    });

    expect(category.sortOrder).toBe(0);
  });

  it('should create inactive category when specified', async () => {
    const category = await createCategory({
      userId: 'user-123',
      name: 'Old Category',
      isActive: false,
    });

    expect(category.isActive).toBe(false);
  });
});