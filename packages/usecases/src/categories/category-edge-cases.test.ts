import { describe, it, expect, beforeEach } from 'vitest';
import { makeCreateCategory } from './create-category';
import { makeUpdateCategory } from './update-category';
import { makeListCategories } from './list-categories';
import { makeDeleteCategory } from './delete-category';
import { makeSeedDefaultCategories } from './seed-default-categories';
import { makeInMemCategoriesRepo, makeInMemBudgetsRepo } from '@budget/adapters-persistence-local';
import { makeSystemClock, makeUlid } from '@budget/adapters-system';

describe('Category Edge Cases & Boundary Tests', () => {
  let categoriesRepo: ReturnType<typeof makeInMemCategoriesRepo>;
  let budgetsRepo: ReturnType<typeof makeInMemBudgetsRepo>;
  let createCategory: ReturnType<typeof makeCreateCategory>;
  let updateCategory: ReturnType<typeof makeUpdateCategory>;
  let listCategories: ReturnType<typeof makeListCategories>;
  let deleteCategory: ReturnType<typeof makeDeleteCategory>;
  let seedDefaultCategories: ReturnType<typeof makeSeedDefaultCategories>;
  let clock: ReturnType<typeof makeSystemClock>;
  let id: ReturnType<typeof makeUlid>;

  beforeEach(() => {
    categoriesRepo = makeInMemCategoriesRepo();
    budgetsRepo = makeInMemBudgetsRepo();
    clock = makeSystemClock();
    id = makeUlid();
    
    createCategory = makeCreateCategory({ categoriesRepo, clock, id });
    updateCategory = makeUpdateCategory({ categoriesRepo, clock });
    listCategories = makeListCategories({ categoriesRepo });
    deleteCategory = makeDeleteCategory({ categoriesRepo, budgetsRepo });
    seedDefaultCategories = makeSeedDefaultCategories({ categoriesRepo, clock, id });
  });

  describe('Boundary Cases - Name Length', () => {
    it('should handle single character category name', async () => {
      // Reasoning: Minimal valid name, tests lower boundary
      const category = await createCategory({
        userId: 'user-123',
        name: 'A',
      });

      expect(category.props.name).toBe('A');
      expect(category.props.name.length).toBe(1);
    });

    it('should handle maximum length category name (50 chars)', async () => {
      // Reasoning: Test upper boundary for name field
      const longName = 'A'.repeat(50);
      
      const category = await createCategory({
        userId: 'user-123',
        name: longName,
      });

      expect(category.props.name.length).toBe(50);
    });

    it('should reject Unicode and emoji in category names', async () => {
      // Names allow only letters A-Z and spaces; emojis go in icon field
      await expect(createCategory({
        userId: 'user-123',
        name: '食料品 🍎 Groceries',
        icon: '🛒',
      })).rejects.toThrow('Category name can only contain letters A-Z and spaces');

      // Valid alternative: emoji in icon, alpha name
      const ok = await createCategory({
        userId: 'user-123',
        name: 'Groceries',
        icon: '🛒🍎',
      });
      expect(ok.props.icon).toBe('🛒🍎');
    });

    it('should reject special characters in name', async () => {
      // Names allow only letters A-Z and spaces
      await expect(createCategory({
        userId: 'user-123',
        name: 'Bills & Utilities (Home)',
      })).rejects.toThrow('Category name can only contain letters A-Z and spaces');

      const category = await createCategory({
        userId: 'user-123',
        name: 'Bills and Utilities',
      });
      expect(category.props.name).toBe('Bills and Utilities');
    });

    it('should reject name with only spaces', async () => {
      // Validation requires non-empty trimmed name
      await expect(createCategory({
        userId: 'user-123',
        name: '   ',
      })).rejects.toThrow('Category name cannot be empty');
    });
  });

  describe('Boundary Cases - Description', () => {
    it('should handle empty description', async () => {
      // Reasoning: Description is optional
      const category = await createCategory({
        userId: 'user-123',
        name: 'Food',
        description: '',
      });

      expect(category.props.description).toBe('');
    });

    it('should handle very long description', async () => {
      // Reasoning: Users might add detailed notes
      const longDescription = 'A'.repeat(1000);
      
      const category = await createCategory({
        userId: 'user-123',
        name: 'Food',
        description: longDescription,
      });

      expect(category.props.description?.length).toBe(1000);
    });

    it('should handle multiline description', async () => {
      // Reasoning: Users might format descriptions
      const category = await createCategory({
        userId: 'user-123',
        name: 'Food',
        description: 'Line 1\nLine 2\nLine 3',
      });

      expect(category.props.description).toContain('\n');
    });
  });

  describe('Edge Cases - Icons and Colors', () => {
    it('should handle multiple emoji as icon', async () => {
      // Reasoning: Users might use compound emojis
      const category = await createCategory({
        userId: 'user-123',
        name: 'Food',
        icon: '🍕🍔🍟',
      });

      expect(category.props.icon).toBe('🍕🍔🍟');
    });

    it('should handle empty icon', async () => {
      // Reasoning: Icon is optional
      const category = await createCategory({
        userId: 'user-123',
        name: 'Food',
        icon: '',
      });

      expect(category.props.icon).toBe('');
    });

    it('should handle various color formats', async () => {
      // Reasoning: Test different hex color representations
      const colors = ['#FF0000', '#f00', '#FF00FF', '#abc'];
      const names = ['Red', 'Short Red', 'Magenta', 'Abc'];

      for (let i = 0; i < colors.length; i++) {
        const category = await createCategory({
          userId: 'user-123',
          name: `Color ${names[i]}`,
          color: colors[i],
        });

        expect(category.props.color).toBe(colors[i]);
      }
    });

    it('should handle transparent color', async () => {
      // Reasoning: Users might want no background color
      const category = await createCategory({
        userId: 'user-123',
        name: 'Food',
        color: 'transparent',
      });

      expect(category.props.color).toBe('transparent');
    });
  });

  describe('Edge Cases - Active/Inactive States', () => {
    it('should create inactive category', async () => {
      // Reasoning: Pre-creating categories for later use
      const category = await createCategory({
        userId: 'user-123',
        name: 'Future Category',
        isActive: false,
      });

      expect(category.props.isActive).toBe(false);
    });

    it('should toggle category between active and inactive multiple times', async () => {
      // Reasoning: Users might frequently enable/disable categories
      const category = await createCategory({
        userId: 'user-123',
        name: 'Toggle Test',
      });

      // Toggle inactive
      let updated = await updateCategory(category.props.id, 'user-123', {
        isActive: false,
      });
      expect(updated.props.isActive).toBe(false);

      // Toggle active
      updated = await updateCategory(category.props.id, 'user-123', {
        isActive: true,
      });
      expect(updated.props.isActive).toBe(true);

      // Toggle inactive again
      updated = await updateCategory(category.props.id, 'user-123', {
        isActive: false,
      });
      expect(updated.props.isActive).toBe(false);
    });

    it('should list only active categories when filtering', async () => {
      // Reasoning: Most common use case for UI
      await createCategory({ userId: 'user-123', name: 'Active One', isActive: true });
      await createCategory({ userId: 'user-123', name: 'Active Two', isActive: true });
      await createCategory({ userId: 'user-123', name: 'Inactive One', isActive: false });
      await createCategory({ userId: 'user-123', name: 'Inactive Two', isActive: false });

      const activeOnly = await listCategories('user-123', true);
      const all = await listCategories('user-123', false);

      expect(activeOnly).toHaveLength(2);
      expect(all).toHaveLength(4);
    });
  });

  describe('Edge Cases - Sort Order', () => {
    it('should handle negative sort order', async () => {
      // Reasoning: Users might use negative numbers for priority items
      const category = await createCategory({
        userId: 'user-123',
        name: 'High Priority',
      });

      const updated = await updateCategory(category.props.id, 'user-123', {
        sortOrder: -999,
      });

      expect(updated.props.sortOrder).toBe(-999);
    });

    it('should handle very large sort order numbers', async () => {
      // Reasoning: Many categories or automated sorting systems
      const category = await createCategory({
        userId: 'user-123',
        name: 'Low Priority',
      });

      const updated = await updateCategory(category.props.id, 'user-123', {
        sortOrder: 999999,
      });

      expect(updated.props.sortOrder).toBe(999999);
    });

    it('should handle duplicate sort orders', async () => {
      // Reasoning: Multiple categories can have same priority
      const cat1 = await createCategory({
        userId: 'user-123',
        name: 'Category One',
      });

      const cat2 = await createCategory({
        userId: 'user-123',
        name: 'Category Two',
      });

      await updateCategory(cat1.props.id, 'user-123', { sortOrder: 5 });
      await updateCategory(cat2.props.id, 'user-123', { sortOrder: 5 });

      const categories = await listCategories('user-123', false);
      const sameSortOrder = categories.filter(c => c.props.sortOrder === 5);
      
      expect(sameSortOrder).toHaveLength(2);
    });
  });

  describe('Edge Cases - Default Categories', () => {
    it('should seed default categories only once', async () => {
      // Reasoning: Prevent duplicate defaults
      const first = await seedDefaultCategories('user-123');
      const second = await seedDefaultCategories('user-123');

      const all = await listCategories('user-123', false);
      
      expect(first.length).toBeGreaterThan(0);
      expect(second.length).toBe(first.length); // Subsequent call returns existing
      expect(all.length).toBe(first.length);
    });

    it('should seed different defaults for different users', async () => {
      // Reasoning: Each user gets their own defaults
      const user1Defaults = await seedDefaultCategories('user-1');
      const user2Defaults = await seedDefaultCategories('user-2');

      const user1Categories = await listCategories('user-1', false);
      const user2Categories = await listCategories('user-2', false);

      expect(user1Defaults.length).toBeGreaterThan(0);
      expect(user2Defaults.length).toBeGreaterThan(0);
      expect(user1Categories.length).toBe(user1Defaults.length);
      expect(user2Categories.length).toBe(user2Defaults.length);
    });

    it('should mark seeded categories as default', async () => {
      // Reasoning: Track which categories are defaults
      const defaults = await seedDefaultCategories('user-123');

      for (const category of defaults) {
        expect(category.props.isDefault).toBe(true);
      }
    });

    it('should allow creating custom categories alongside defaults', async () => {
      // Reasoning: Users can add their own categories
      await seedDefaultCategories('user-123');
      
      const custom = await createCategory({
        userId: 'user-123',
        name: 'My Custom Category',
      });

      const all = await listCategories('user-123', false);
      const defaultCats = all.filter(c => c.props.isDefault);
      const customCats = all.filter(c => !c.props.isDefault);

      expect(custom.props.isDefault).toBe(false);
      expect(defaultCats.length).toBeGreaterThan(0);
      expect(customCats.length).toBe(1);
    });
  });

  describe('Edge Cases - User Isolation', () => {
    it('should not allow accessing another user\'s category', async () => {
      // Reasoning: Security - users should not see each other's data
      const cat1 = await createCategory({
        userId: 'user-1',
        name: 'User One Category',
      });

      // Try to update as different user
      await expect(
        updateCategory(cat1.props.id, 'user-2', { name: 'Hacked' })
      ).rejects.toThrow();
    });

    it('should handle many users with same category names', async () => {
      // Reasoning: Category names are not globally unique
      const users = Array.from({ length: 100 }, (_, i) => `user-${i}`);
      
      for (const userId of users) {
        await createCategory({
          userId,
          name: 'Food',
        });
      }

      // Each user should have exactly 1 Food category
      for (const userId of users) {
        const categories = await listCategories(userId, false);
        const foodCategories = categories.filter(c => c.props.name === 'Food');
        expect(foodCategories).toHaveLength(1);
        expect(foodCategories[0].props.userId).toBe(userId);
      }
    });

    it('should return empty list for user with no categories', async () => {
      // Reasoning: New users start with no categories
      const categories = await listCategories('brand-new-user', false);
      expect(categories).toEqual([]);
    });
  });

  describe('Edge Cases - Deletion', () => {
    it('should prevent deleting category with active budgets', async () => {
      // Reasoning: Data integrity - don't orphan budgets
      const category = await createCategory({
        userId: 'user-123',
        name: 'Food',
      });

      // Create a budget for this category via usecase
      const { makeCreateBudget } = await import('../budgets/create-budget');
      const createBudget = makeCreateBudget({ budgetsRepo, clock, id });
      await createBudget({
        userId: 'user-123',
        categoryId: category.props.id,
        name: 'Monthly Food',
        amountCents: 50000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date(),
      });

      await expect(
        deleteCategory(category.props.id, 'user-123')
      ).rejects.toThrow();
    });

    it('should allow deleting category with no budgets', async () => {
      // Reasoning: Safe deletion when no dependencies
      const category = await createCategory({
        userId: 'user-123',
        name: 'Unused Category',
      });

      await expect(
        deleteCategory(category.props.id, 'user-123')
      ).resolves.not.toThrow();
    });

    it('should handle deleting non-existent category', async () => {
      // Reasoning: Graceful error handling
      await expect(
        deleteCategory('non-existent-id', 'user-123')
      ).rejects.toThrow();
    });
  });

  describe('Edge Cases - Updates', () => {
    it('should handle partial updates without affecting other fields', async () => {
      // Reasoning: Updates should be selective
      const category = await createCategory({
        userId: 'user-123',
        name: 'Original Name',
        description: 'Original Description',
        icon: '🏠',
        color: '#FF0000',
      });

      const updated = await updateCategory(category.props.id, 'user-123', {
        name: 'New Name',
      });

      expect(updated.props.name).toBe('New Name');
      expect(updated.props.description).toBe('Original Description');
      expect(updated.props.icon).toBe('🏠');
      expect(updated.props.color).toBe('#FF0000');
    });

    it('should update timestamps on modification', async () => {
      // Reasoning: Track when categories change
      const category = await createCategory({
        userId: 'user-123',
        name: 'Test',
      });

      const originalUpdatedAt = category.props.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await updateCategory(category.props.id, 'user-123', {
        name: 'Updated',
      });

      expect(updated.props.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
      expect(updated.props.createdAt).toEqual(category.props.createdAt);
    });

    it('should handle clearing optional fields', async () => {
      // Reasoning: Users might want to remove descriptions/icons
      const category = await createCategory({
        userId: 'user-123',
        name: 'Test',
        description: 'Has description',
        icon: '🏠',
        color: '#FF0000',
      });

      const updated = await updateCategory(category.props.id, 'user-123', {
        description: null,
        icon: null,
        color: null,
      });

      expect(updated.props.description).toBeUndefined();
      expect(updated.props.icon).toBeUndefined();
      expect(updated.props.color).toBeUndefined();
    });
  });

  describe('Extreme Cases - High Volume', () => {
    it('should handle creating many categories quickly', async () => {
      // Reasoning: Bulk import or automated systems
      const promises = Array.from({ length: 1000 }, (_, i) =>
        createCategory({
          userId: 'user-123',
          name: `Category ${String.fromCharCode(65 + (i % 26))}`,
        })
      );

      const categories = await Promise.all(promises);
      expect(categories).toHaveLength(1000);
    });

    it('should efficiently list large number of categories', async () => {
      // Reasoning: Performance with many categories
      // Create 100 categories with unique, letters-only names (valid per domain rules)
      for (let i = 0; i < 100; i++) {
        const first = String.fromCharCode(65 + Math.floor(i / 26)); // A..D
        const second = String.fromCharCode(65 + (i % 26));          // A..Z
        await createCategory({
          userId: 'user-123',
          name: `Category ${first}${second}`,
          isActive: i % 2 === 0, // Half active, half inactive
        });
      }

      const startTime = Date.now();
      const all = await listCategories('user-123', false);
      const activeOnly = await listCategories('user-123', true);
      const endTime = Date.now();

      expect(all).toHaveLength(100);
      expect(activeOnly).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(1000); // Should be fast
    });
  });
});