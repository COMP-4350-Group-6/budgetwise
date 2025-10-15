import { describe, it, expect } from 'vitest';
import { Category, type CategoryProps } from './category';

function makeCategory(overrides: Partial<CategoryProps> = {}): Category {
  const base: CategoryProps = {
    id: 'cat-1',
    userId: 'user-1',
    name: 'Food',
    isDefault: false,
    isActive: true,
    sortOrder: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };
  return new Category({ ...base, ...overrides });
}

describe('Category', () => {
  describe('constructor validation', () => {
    describe('name validation', () => {
      it('should create category with valid name', () => {
        const category = makeCategory({ name: 'Groceries' });
        expect(category.name).toBe('Groceries');
      });

      it('should reject empty name', () => {
        expect(() => makeCategory({ name: '' }))
          .toThrow('Category name cannot be empty');
      });

      it('should reject name with only whitespace', () => {
        expect(() => makeCategory({ name: '   ' }))
          .toThrow('Category name cannot be empty');
      });

      it('should reject name with tabs and newlines', () => {
        expect(() => makeCategory({ name: '\t\n  \t' }))
          .toThrow('Category name cannot be empty');
      });

      it('should accept name at maximum length (50 chars)', () => {
        const longName = 'A'.repeat(50);
        const category = makeCategory({ name: longName });
        expect(category.name).toBe(longName);
        expect(category.name.length).toBe(50);
      });

      it('should reject name over maximum length (51 chars)', () => {
        const tooLong = 'A'.repeat(51);
        expect(() => makeCategory({ name: tooLong }))
          .toThrow('Category name too long');
      });

      it('should accept name at minimum length (1 char)', () => {
        const category = makeCategory({ name: 'A' });
        expect(category.name).toBe('A');
      });

      it('should accept name with spaces', () => {
        const category = makeCategory({ name: 'Dining Out' });
        expect(category.name).toBe('Dining Out');
      });

      it('should accept name with multiple spaces', () => {
        const category = makeCategory({ name: 'Health and Wellness' });
        expect(category.name).toBe('Health and Wellness');
      });

      it('should accept lowercase letters', () => {
        const category = makeCategory({ name: 'groceries' });
        expect(category.name).toBe('groceries');
      });

      it('should accept uppercase letters', () => {
        const category = makeCategory({ name: 'GROCERIES' });
        expect(category.name).toBe('GROCERIES');
      });

      it('should accept mixed case letters', () => {
        const category = makeCategory({ name: 'GrOcErIeS' });
        expect(category.name).toBe('GrOcErIeS');
      });

      it('should reject name with numbers', () => {
        expect(() => makeCategory({ name: 'Food123' }))
          .toThrow('Category name can only contain letters A-Z and spaces');
      });

      it('should reject name with special characters', () => {
        expect(() => makeCategory({ name: 'Food & Drinks' }))
          .toThrow('Category name can only contain letters A-Z and spaces');
      });

      it('should reject name with punctuation', () => {
        expect(() => makeCategory({ name: 'Food, Drinks' }))
          .toThrow('Category name can only contain letters A-Z and spaces');
        
        expect(() => makeCategory({ name: 'Food!' }))
          .toThrow('Category name can only contain letters A-Z and spaces');
        
        expect(() => makeCategory({ name: 'Food?' }))
          .toThrow('Category name can only contain letters A-Z and spaces');
      });

      it('should reject name with parentheses', () => {
        expect(() => makeCategory({ name: 'Food (Groceries)' }))
          .toThrow('Category name can only contain letters A-Z and spaces');
      });

      it('should reject name with hyphens or underscores', () => {
        expect(() => makeCategory({ name: 'Food-Drinks' }))
          .toThrow('Category name can only contain letters A-Z and spaces');
        
        expect(() => makeCategory({ name: 'Food_Drinks' }))
          .toThrow('Category name can only contain letters A-Z and spaces');
      });

      it('should reject name with emoji', () => {
        expect(() => makeCategory({ name: 'Food 🍕' }))
          .toThrow('Category name can only contain letters A-Z and spaces');
      });

      it('should reject name with Unicode characters', () => {
        expect(() => makeCategory({ name: '食料品' }))
          .toThrow('Category name can only contain letters A-Z and spaces');
      });

      it('should accept names with leading/trailing spaces', () => {
        // The validation checks trim().length for emptiness
        // but allows names with spaces if they have content
        const category = makeCategory({ name: '   Trimmed   ' });
        expect(category.name).toBe('   Trimmed   ');
      });
    });

    describe('optional fields', () => {
      it('should accept category without description', () => {
        const category = makeCategory({ description: undefined });
        expect(category.props.description).toBeUndefined();
      });

      it('should accept category with description', () => {
        const category = makeCategory({ description: 'All food expenses' });
        expect(category.props.description).toBe('All food expenses');
      });

      it('should accept empty description', () => {
        const category = makeCategory({ description: '' });
        expect(category.props.description).toBe('');
      });

      it('should accept category without icon', () => {
        const category = makeCategory({ icon: undefined });
        expect(category.props.icon).toBeUndefined();
      });

      it('should accept category with icon', () => {
        const category = makeCategory({ icon: '🍕' });
        expect(category.props.icon).toBe('🍕');
      });

      it('should accept category without color', () => {
        const category = makeCategory({ color: undefined });
        expect(category.props.color).toBeUndefined();
      });

      it('should accept category with color', () => {
        const category = makeCategory({ color: '#FF0000' });
        expect(category.props.color).toBe('#FF0000');
      });
    });
  });

  describe('getters', () => {
    it('should return id', () => {
      const category = makeCategory({ id: 'test-id' });
      expect(category.id).toBe('test-id');
    });

    it('should return name', () => {
      const category = makeCategory({ name: 'Entertainment' });
      expect(category.name).toBe('Entertainment');
    });

    it('should return isActive', () => {
      const activeCategory = makeCategory({ isActive: true });
      expect(activeCategory.isActive).toBe(true);

      const inactiveCategory = makeCategory({ isActive: false });
      expect(inactiveCategory.isActive).toBe(false);
    });

    it('should return isDefault', () => {
      const defaultCategory = makeCategory({ isDefault: true });
      expect(defaultCategory.isDefault).toBe(true);

      const customCategory = makeCategory({ isDefault: false });
      expect(customCategory.isDefault).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should have readonly props', () => {
      const category = makeCategory({ name: 'Food' });
      expect(category.props).toBeDefined();
      expect(category.props.name).toBe('Food');
      // TypeScript enforces readonly at compile time
      // Runtime JavaScript doesn't throw, so we just verify structure
    });
  });

  describe('edge cases', () => {
    it('should handle all boolean combinations of isDefault and isActive', () => {
      const combinations = [
        { isDefault: true, isActive: true },
        { isDefault: true, isActive: false },
        { isDefault: false, isActive: true },
        { isDefault: false, isActive: false },
      ];

      combinations.forEach(({ isDefault, isActive }) => {
        const category = makeCategory({ isDefault, isActive });
        expect(category.isDefault).toBe(isDefault);
        expect(category.isActive).toBe(isActive);
      });
    });

    it('should handle various sortOrder values', () => {
      const values = [-999, -1, 0, 1, 999, 999999];
      
      values.forEach(sortOrder => {
        const category = makeCategory({ sortOrder });
        expect(category.props.sortOrder).toBe(sortOrder);
      });
    });

    it('should preserve timestamps', () => {
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-06-15T15:30:00Z');
      
      const category = makeCategory({ createdAt, updatedAt });
      expect(category.props.createdAt).toEqual(createdAt);
      expect(category.props.updatedAt).toEqual(updatedAt);
    });
  });
});