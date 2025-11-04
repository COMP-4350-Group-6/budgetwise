import { describe, it, expect, beforeEach } from 'vitest';
import { makeCreateCategory } from './create-category';
import { makeInMemCategoriesRepo } from '@budget/adapters-persistence-local';
import { makeSystemClock, makeUuid } from '@budget/adapters-system';
import { Category } from '@budget/domain';

describe('createCategory', () => {
  let categoriesRepo: ReturnType<typeof makeInMemCategoriesRepo>;
  let createCategory: ReturnType<typeof makeCreateCategory>;
  let clock: ReturnType<typeof makeSystemClock>;
  let id: ReturnType<typeof makeUuid>;

  beforeEach(() => {
    categoriesRepo = makeInMemCategoriesRepo();
    clock = makeSystemClock();
    id = makeUuid();
    createCategory = makeCreateCategory({ categoriesRepo, clock, id });
  });

  it('should create a new category with required fields', async () => {
    const input = {
      userId: 'user-123',
      name: 'Groceries',
    };

    const category = await createCategory(input);

    expect(category).toBeInstanceOf(Category);
    expect(category.props.userId).toBe(input.userId);
    expect(category.props.name).toBe(input.name);
    expect(category.props.isDefault).toBe(false);
    expect(category.props.isActive).toBe(true);
    expect(category.props.id).toBeDefined();
    expect(category.props.createdAt).toBeInstanceOf(Date);
    expect(category.props.updatedAt).toBeInstanceOf(Date);
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

    expect(category.props.description).toBe(input.description);
    expect(category.props.icon).toBe(input.icon);
    expect(category.props.color).toBe(input.color);
    expect(category.props.isActive).toBe(input.isActive);
  });

  it('should persist the category to the repository', async () => {
    const input = {
      userId: 'user-123',
      name: 'Groceries',
      icon: '🛒',
    };

    const category = await createCategory(input);
    const retrieved = await categoriesRepo.getById(category.props.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.props.id).toBe(category.props.id);
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

    expect(category1.props.id).not.toBe(category2.props.id);
    expect(category1.props.userId).toBe('user-1');
    expect(category2.props.userId).toBe('user-2');
  });

  it('should set default sortOrder', async () => {
    const category = await createCategory({
      userId: 'user-123',
      name: 'Test',
    });

    expect(category.props.sortOrder).toBe(0);
  });

  it('should create inactive category when specified', async () => {
    const category = await createCategory({
      userId: 'user-123',
      name: 'Old Category',
      isActive: false,
    });

    expect(category.props.isActive).toBe(false);
  });
});