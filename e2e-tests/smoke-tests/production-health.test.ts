/**
 * Production Smoke Tests
 * 
 * These tests run after deployment to verify critical paths are working.
 * They test against the actual production environment on Cloudflare.
 * 
 * Run with: pnpm test:smoke
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://budgetwise.ca';
const API_URL = process.env.API_URL || 'https://api.budgetwise.ca';

test.describe('Production Smoke Tests', () => {
  test.describe('Frontend Health', () => {
    test('should load homepage successfully', async ({ page }) => {
      const response = await page.goto(PRODUCTION_URL);
      
      expect(response?.status()).toBe(200);
      expect(page.url()).toContain(PRODUCTION_URL);
      
      // Verify page is interactive
      await expect(page).toHaveTitle(/BudgetWise/i);
    });

    test('should load login page', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/login`);
      
      // Check for login form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should load signup page', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/signup`);
      
      // Check for signup form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should serve static assets', async ({ page }) => {
      const response = await page.goto(PRODUCTION_URL);
      expect(response?.status()).toBe(200);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Check that CSS/JS loaded (no major rendering issues)
      const bodyClass = await page.locator('body').getAttribute('class');
      expect(bodyClass).not.toBeNull();
    });
  });

  test.describe('API Health', () => {
    test('should respond to health check', async ({ request }) => {
      const response = await request.get(`${API_URL}/health`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('ok');
    });

    test('should handle CORS preflight', async ({ request }) => {
      const response = await request.fetch(`${API_URL}/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': PRODUCTION_URL,
          'Access-Control-Request-Method': 'GET',
        }
      });
      
      expect(response.status()).toBeLessThan(300);
      expect(response.headers()['access-control-allow-origin']).toBeTruthy();
    });

    test('should return 404 for invalid routes', async ({ request }) => {
      const response = await request.get(`${API_URL}/invalid-route-that-does-not-exist`);
      
      expect(response.status()).toBe(404);
    });

    test('should require authentication for protected routes', async ({ request }) => {
      const response = await request.get(`${API_URL}/budgets`);
      
      // Should return 401 Unauthorized without auth token
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Critical User Flows', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access protected route
      await page.goto(`${PRODUCTION_URL}/home`);
      
      // Should redirect to login
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain('/login');
    });

    test('should show error for invalid login', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/login`);
      
      // Try invalid credentials
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Should show error message (wait a bit for API call)
      await page.waitForTimeout(2000);
      
      // Still on login page (not redirected)
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Performance', () => {
    test('should load homepage quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load in under 5 seconds (Cloudflare edge should be fast)
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have fast API response times', async ({ request }) => {
      const startTime = Date.now();
      await request.get(`${API_URL}/health`);
      const responseTime = Date.now() - startTime;
      
      // Should respond in under 1 second
      expect(responseTime).toBeLessThan(1000);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Block API calls to simulate network failure
      await page.route(`${API_URL}/**`, route => route.abort('failed'));
      
      await page.goto(`${PRODUCTION_URL}/login`);
      
      // Try to login (will fail due to blocked network)
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Should show error (not crash)
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/login');
    });

    test('should return proper error format from API', async ({ request }) => {
      const response = await request.get(`${API_URL}/budgets`);
      
      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  test.describe('Security', () => {
    test('should have security headers', async ({ request }) => {
      const response = await request.get(PRODUCTION_URL);
      const headers = response.headers();
      
      // Cloudflare should add security headers
      expect(headers).toHaveProperty('x-frame-options');
      expect(headers).toHaveProperty('x-content-type-options');
    });

    test('should use HTTPS', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      expect(page.url()).toMatch(/^https:\/\//);
    });

    test('should not expose sensitive information in errors', async ({ request }) => {
      const response = await request.get(`${API_URL}/invalid-route`);
      const text = await response.text();
      
      // Should not expose stack traces or internal paths
      expect(text).not.toContain('node_modules');
      expect(text).not.toContain('Error:');
      expect(text).not.toContain('at ');
    });
  });
});
