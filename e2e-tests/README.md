# Smoke Tests

Production smoke tests for BudgetWise that run after deployment to verify critical functionality.

## What Are Smoke Tests?

Smoke tests are a subset of tests that verify the most critical functionality of an application after deployment. They're designed to:

- **Run quickly** (< 5 minutes) to provide fast feedback
- **Test critical paths** that would cause major user impact if broken
- **Validate deployment** to ensure the app is accessible and functional
- **Catch deployment issues** like broken assets, API errors, or routing problems

## Test Coverage

Our smoke tests cover:

### Frontend Health
- ✅ Homepage loads successfully
- ✅ Login/Signup pages are accessible
- ✅ Static assets (CSS/JS) load correctly
- ✅ Pages are interactive and render properly

### API Health
- ✅ Health check endpoint responds
- ✅ CORS configuration works
- ✅ Invalid routes return 404
- ✅ Protected routes require authentication

### Critical User Flows
- ✅ Unauthenticated users redirect to login
- ✅ Invalid credentials show error messages
- ✅ Navigation works correctly

### Performance
- ✅ Homepage loads in < 5 seconds
- ✅ API responds in < 1 second
- ✅ Cloudflare edge performance

### Error Handling
- ✅ Network failures handled gracefully
- ✅ API returns proper error formats
- ✅ No crashes or white screens

### Security
- ✅ HTTPS enforced
- ✅ Security headers present
- ✅ No sensitive information exposed

## Running Smoke Tests

### Prerequisites

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
npx playwright install chromium
```

### Local Testing

```bash
# Test against localhost (default)
cd e2e-tests
pnpm test:smoke

# Test against specific URLs
PRODUCTION_URL=https://budgetwise.pages.dev API_URL=https://budgetwise-api.workers.dev pnpm test:smoke

# Run in headed mode (see browser)
pnpm test:headed smoke-tests/

# Run with UI mode (interactive)
pnpm test:ui
```

### Production Testing

```bash
# Test production deployment
pnpm test:smoke:production

# Test PR preview deployment
PRODUCTION_URL=https://pr-123-budgetwise.pages.dev API_URL=https://pr-123-api.workers.dev pnpm test:smoke:preview
```

### CI/CD Integration

Smoke tests run automatically after successful deployment via GitHub Actions:

```yaml
# .github/workflows/smoke-tests.yml
on:
  workflow_run:
    workflows: ["Deploy to Production"]
    types: [completed]
```

You can also trigger manually:
1. Go to Actions tab
2. Select "Smoke Tests" workflow
3. Click "Run workflow"
4. Optionally specify custom URLs

## Test Reports

After running tests, view the HTML report:

```bash
pnpm report
```

Reports include:
- ✅ Pass/fail status for each test
- 📸 Screenshots on failure
- 🎥 Videos of failed tests
- ⏱️ Performance metrics
- 🔍 Detailed error messages

## Adding New Smoke Tests

Smoke tests should be **fast** and **reliable**. Follow these guidelines:

### ✅ Good Smoke Tests

```typescript
test('should load homepage', async ({ page }) => {
  const response = await page.goto(PRODUCTION_URL);
  expect(response?.status()).toBe(200);
});

test('should respond to health check', async ({ request }) => {
  const response = await request.get(`${API_URL}/health`);
  expect(response.status()).toBe(200);
});
```

### ❌ Bad Smoke Tests

```typescript
// Too slow - requires full user flow
test('should complete full budget creation flow', async ({ page }) => {
  // This belongs in E2E tests, not smoke tests
});

// Too flaky - depends on specific data
test('should show exactly 5 budgets', async ({ page }) => {
  // Production data changes, use E2E tests instead
});

// Too detailed - testing implementation
test('should call getBudgets API with correct parameters', async ({ page }) => {
  // This is a unit test, not a smoke test
});
```

### Guidelines

1. **Keep tests independent** - Each test should run in isolation
2. **Avoid authentication** - Test public endpoints and redirects
3. **Test responses, not content** - Check status codes, not specific text
4. **Make it fast** - Aim for < 30 seconds per test
5. **Focus on critical paths** - Test what would break the app

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PRODUCTION_URL` | Frontend URL to test | `http://localhost:3000` |
| `API_URL` | API URL to test | `http://localhost:8787` |
| `CI` | CI environment flag | `false` |

## Troubleshooting

### Tests fail locally but pass in CI

- **Cause**: Different environment or URLs
- **Fix**: Set `PRODUCTION_URL` and `API_URL` correctly

### Tests timeout

- **Cause**: Network latency or slow server
- **Fix**: Increase timeout in `playwright.config.ts`

### Browser not installed

- **Cause**: Missing Playwright browsers
- **Fix**: Run `npx playwright install chromium`

### CORS errors

- **Cause**: API not configured for test origin
- **Fix**: Check API CORS configuration

## Best Practices

1. **Run after every deployment** - Catch issues immediately
2. **Monitor trends** - Track test duration over time
3. **Keep tests green** - Fix failures quickly
4. **Review artifacts** - Check videos/screenshots on failure
5. **Update regularly** - Add tests for new critical features

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Smoke Testing Guide](https://www.browserstack.com/guide/smoke-testing)
- [BudgetWise Testing Guide](../TESTING.md)
