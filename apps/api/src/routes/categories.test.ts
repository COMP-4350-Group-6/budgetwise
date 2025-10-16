import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../app';

interface CategoryDTO {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  isDefault: boolean;
}

interface CategoryCreateResponse {
  category: CategoryDTO;
}

interface CategoryUpdateResponse {
  category: CategoryDTO;
}

interface CategoriesListResponse {
  categories: CategoryDTO[];
  message?: string;
}

interface DeleteResponse {
  message?: string;
  error?: string;
}

interface SeedResponse {
  categories: CategoryDTO[];
  message: string;
}

async function parseJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

describe('Categories API Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeEach(() => {
    // Note: In a real scenario, you'd set up test authentication
    authToken = 'test-token';
    userId = 'test-user-123';
  });

  describe('POST /categories - Create Category', () => {
    it('should create a category with minimal data', async () => {
      const res = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Groceries',
        }),
      });

      expect(res.status).toBe(201);
      const data = await parseJson<CategoryCreateResponse>(res);
      expect(data.category).toBeDefined();
      expect(data.category.name).toBe('Groceries');
      expect(data.category.isActive).toBe(true);
      expect(data.category.isDefault).toBe(false);
    });

    it('should create category with all optional fields', async () => {
      const res = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Entertainment',
          description: 'Movies, games, and fun',
          icon: '🎬',
          color: '#FF5733',
          isActive: true,
        }),
      });

      expect(res.status).toBe(201);
      const data = await parseJson<CategoryCreateResponse>(res);
      expect(data.category.description).toBe('Movies, games, and fun');
      expect(data.category.icon).toBe('🎬');
      expect(data.category.color).toBe('#FF5733');
    });

    it('should reject category without authorization', async () => {
      const res = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Unauthorized Category',
        }),
      });

      expect(res.status).toBe(401);
    });

    it('should reject category without name', async () => {
      const res = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'No name category',
        }),
      });

      expect(res.status).toBe(400);
    });

    it('should create inactive category', async () => {
      const res = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Inactive Category',
          isActive: false,
        }),
      });

      expect(res.status).toBe(201);
      const data = await parseJson<CategoryCreateResponse>(res);
      expect(data.category.isActive).toBe(false);
    });
  });

  describe('GET /categories - List Categories', () => {
    it('should list all categories', async () => {
      // Create some categories first
      await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Category 1' }),
      });

      await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Category 2' }),
      });

      const res = await app.request('/categories', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = await parseJson<CategoriesListResponse>(res);
      expect(data.categories).toHaveLength(2);
    });

    it('should filter active categories only', async () => {
      // Create active and inactive categories
      await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Active 1', isActive: true }),
      });

      await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Inactive 1', isActive: false }),
      });

      const res = await app.request('/categories?active=true', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = await parseJson<CategoriesListResponse>(res);
      expect(data.categories.every((c) => c.isActive)).toBe(true);
    });

    it('should require authentication', async () => {
      const res = await app.request('/categories', {
        method: 'GET',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /categories/seed - Seed Default Categories', () => {
    it('should seed default categories', async () => {
      const res = await app.request('/categories/seed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(res.status).toBe(201);
      const data = await parseJson<CategoriesListResponse>(res);
      expect(data.categories.length).toBeGreaterThan(0);
      expect(data.message).toContain('Seeded');
      expect(data.categories.every((c) => c.isDefault)).toBe(true);
    });

    it('should not seed duplicates on second call', async () => {
      // First seed
      const res1 = await app.request('/categories/seed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data1 = await parseJson<CategoriesListResponse>(res1);
      const firstCount = data1.categories.length;

      // Second seed
      const res2 = await app.request('/categories/seed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data2 = await parseJson<CategoriesListResponse>(res2);
      expect(data2.categories.length).toBe(0); // No new categories

      // Verify total count didn't change
      const listRes = await app.request('/categories', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const listData = await parseJson<CategoriesListResponse>(listRes);
      expect(listData.categories.length).toBe(firstCount);
    });

    it('should require authentication', async () => {
      const res = await app.request('/categories/seed', {
        method: 'POST',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /categories/:id - Update Category', () => {
    it('should update category name', async () => {
      // Create category
      const createRes = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Original Name' }),
      });

      const createData = await parseJson<CategoryCreateResponse>(createRes);
      const categoryId = createData.category.id;

      // Update it
      const updateRes = await app.request(`/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Updated Name' }),
      });

      expect(updateRes.status).toBe(200);
      const updateData = await parseJson<CategoryUpdateResponse>(updateRes);
      expect(updateData.category.name).toBe('Updated Name');
    });

    it('should partially update category fields', async () => {
      // Create category with all fields
      const createRes = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test',
          description: 'Original',
          icon: '🏠',
          color: '#FF0000',
        }),
      });

      const createData = await parseJson<CategoryCreateResponse>(createRes);
      const categoryId = createData.category.id;

      // Update only description
      const updateRes = await app.request(`/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: 'Updated' }),
      });

      const updateData = await parseJson<CategoryUpdateResponse>(updateRes);
      expect(updateData.category.description).toBe('Updated');
      expect(updateData.category.name).toBe('Test'); // Unchanged
      expect(updateData.category.icon).toBe('🏠'); // Unchanged
    });

    it('should toggle category active status', async () => {
      // Create active category
      const createRes = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Toggle Test', isActive: true }),
      });

      const createData = await parseJson<CategoryCreateResponse>(createRes);
      const categoryId = createData.category.id;

      // Deactivate
      const updateRes = await app.request(`/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      });

      const updateData = await parseJson<CategoryUpdateResponse>(updateRes);
      expect(updateData.category.isActive).toBe(false);
    });

    it('should reject update from different user', async () => {
      // Create category
      const createRes = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Security Test' }),
      });

      const createData = await parseJson<CategoryCreateResponse>(createRes);
      const categoryId = createData.category.id;

      // Try to update as different user
      const updateRes = await app.request(`/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer different-user-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Hacked' }),
      });

      expect(updateRes.status).toBe(404); // Not found for different user
    });

    it('should reject updating non-existent category', async () => {
      const res = await app.request('/categories/non-existent-id', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Update' }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /categories/:id - Delete Category', () => {
    it('should delete category without budgets', async () => {
      // Create category
      const createRes = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Delete Test' }),
      });

      const createData = await parseJson<CategoryCreateResponse>(createRes);
      const categoryId = createData.category.id;

      // Delete it
      const deleteRes = await app.request(`/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(deleteRes.status).toBe(200);
      const deleteData = await parseJson<DeleteResponse>(deleteRes);
      expect(deleteData.message).toContain('deleted');
    });

    it('should prevent deleting category with budgets', async () => {
      // Create category
      const catRes = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Has Budgets' }),
      });

      const catData = await parseJson<CategoryCreateResponse>(catRes);
      const categoryId = catData.category.id;

      // Create budget for this category
      await app.request('/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          name: 'Test Budget',
          amountCents: 50000,
          currency: 'CAD',
          period: 'MONTHLY',
          startDate: '2025-01-01',
        }),
      });

      // Try to delete category
      const deleteRes = await app.request(`/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(deleteRes.status).toBe(400);
      const deleteData = await parseJson<DeleteResponse>(deleteRes);
      expect(deleteData.error).toContain('budgets');
    });

    it('should reject deleting non-existent category', async () => {
      const res = await app.request('/categories/non-existent-id', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(res.status).toBe(400);
    });

    it('should reject deletion from different user', async () => {
      // Create category
      const createRes = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Security Test' }),
      });

      const createData = await parseJson<CategoryCreateResponse>(createRes);
      const categoryId = createData.category.id;

      // Try to delete as different user
      const deleteRes = await app.request(`/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer different-user-token',
        },
      });

      expect(deleteRes.status).toBe(400);
    });
  });

  describe('Boundary Tests - Category Creation', () => {
    it('should handle single character name', async () => {
      const res = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'A' }),
      });

      expect(res.status).toBe(201);
      const data = await parseJson<CategoryCreateResponse>(res);
      expect(data.category.name).toBe('A');
    });

    it('should handle maximum length name', async () => {
      const longName = 'A'.repeat(50);
      const res = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: longName }),
      });

      expect(res.status).toBe(201);
      const data = await parseJson<CategoryCreateResponse>(res);
      expect(data.category.name.length).toBe(50);
    });

    it('should reject Unicode characters in name but allow Unicode icon', async () => {
      // Invalid name with Unicode should be rejected per domain rules
      const res1 = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '日本語 🇯🇵',
          icon: '🍱',
        }),
      });
      expect(res1.status).toBe(400);

      // Valid name with Unicode in icon should be accepted
      const res2 = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Japanese',
          icon: '🍱',
        }),
      });
      expect(res2.status).toBe(201);
      const data = await parseJson<CategoryCreateResponse>(res2);
      expect(data.category.icon).toBe('🍱');
    });

    it('should reject special characters in name', async () => {
      const res = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Bills & Utilities (Home) - 2025',
        }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('Edge Cases - Concurrent Operations', () => {
    it('should handle creating multiple categories simultaneously', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        app.request('/categories', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: `Category ${i}` }),
        })
      );

      const results = await Promise.all(promises);
      
      expect(results.every(r => r.status === 201)).toBe(true);
    });

    it('should allow duplicate names for different users', async () => {
      const res1 = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer user-1-token`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Food' }),
      });

      const res2 = await app.request('/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer user-2-token`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Food' }),
      });

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(201);
    });
  });
});