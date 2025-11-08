# E2E & Smoke Tests

> **📚 Part of [TESTING_GUIDE.md](../TESTING_GUIDE.md) - See complete testing documentation**

End-to-end and smoke tests for BudgetWise using Playwright.

## Quick Start

### 1. Install Browsers (One-Time Setup)

```bash
# From root directory
pnpm --filter @budgetwise/e2e-tests run install:browsers

# Or from e2e-tests directory
pnpm install:browsers
```

This downloads Chromium, Firefox, WebKit, and mobile browsers (~500MB).

### 2. Run Tests

#### Smoke Tests (Recommended - Fast & Reliable)

```bash
# From root - runs on Chromium only (17 tests, ~30s)
pnpm test:smoke:production

# Local testing (localhost:3000)
pnpm test:smoke
```

#### All Browsers (Comprehensive)

```bash
# From root - runs on all 5 browsers (85 tests, ~2-3min)
pnpm test:smoke:production:all

# Local testing on all browsers
pnpm test:smoke:all
```

## Available Commands

### From Root Directory

| Command | Description | Browsers | Tests | Time |
|---------|-------------|----------|-------|------|
| `pnpm test:smoke:production` | Production smoke tests | Chromium only | 17 | ~30s |
| `pnpm test:smoke:production:all` | Production all browsers | All 5 browsers | 85 | ~2-3min |
| `pnpm test:smoke` | Local smoke tests | Chromium only | 17 | ~30s |
| `pnpm test:smoke:all` | Local all browsers | All 5 browsers | 85 | ~2-3min |
| `pnpm test:e2e` | E2E tests | All configured | Varies | Varies |

### From e2e-tests Directory

```bash
cd e2e-tests

# Quick smoke tests (Chromium only)
pnpm test:smoke
pnpm test:smoke:production

# All browsers
pnpm test:smoke:all
pnpm test:smoke:production:all

# Debugging
pnpm test:headed              # Watch tests run
pnpm test:ui                  # Interactive UI mode
pnpm test:debug               # Step-by-step debugger

# View results
pnpm report                   # Open HTML report
```

## Environment Variables

### Production URLs

```bash
# Automatically set by test:smoke:production commands
PRODUCTION_URL=https://budgetwise.ca
API_URL=https://api.budgetwise.ca
```

### Local/Preview URLs

```bash
# Default (used by test:smoke)
PRODUCTION_URL=http://localhost:3000
API_URL=http://localhost:8787

# Custom preview
PRODUCTION_URL=https://preview-abc123.pages.dev pnpm test:smoke
```

## Browser Configuration

Tests run on these browsers (configurable in `playwright.config.ts`):

1. **Chromium** (Desktop Chrome) - Default for quick tests
2. **Firefox** (Desktop Firefox)
3. **WebKit** (Desktop Safari)
4. **Mobile Chrome** (Pixel 5)
5. **Mobile Safari** (iPhone 12)

### Why Chromium-Only by Default?

- ✅ **Fast**: 17 tests in ~30 seconds
- ✅ **Reliable**: Most common browser, best Playwright support
- ✅ **CI-Friendly**: Doesn't require all browsers installed
- ✅ **Covers 65%**: Chromium covers most real-world usage

Use `*:all` commands for comprehensive cross-browser testing before major releases.

## Test Structure

```
e2e-tests/
├── smoke-tests/
│   └── production-health.test.ts    # 17 production validation tests
├── tests/
│   └── (future e2e tests)
├── playwright.config.ts              # Playwright configuration
└── README.md                         # This file
```

## Smoke Tests Coverage

17 tests across 6 categories:

1. **Frontend Health** (4 tests)
   - Homepage loads
   - Login page accessible
   - Signup page accessible
   - Static assets served

2. **API Health** (4 tests)
   - Health endpoint responds
   - CORS configured
   - 404 for invalid routes
   - Auth required for protected routes

3. **Critical User Flows** (2 tests)
   - Unauthenticated redirect to login
   - Invalid login shows error

4. **Performance** (2 tests)
   - Homepage loads quickly
   - API responds quickly

5. **Error Handling** (2 tests)
   - Network errors handled gracefully
   - Proper error format from API

6. **Security** (3 tests)
   - HTTPS enforced
   - Security headers present
   - No sensitive info in errors

## Troubleshooting

### "Executable doesn't exist" Error

**Problem**: Firefox/WebKit/Mobile Safari browsers not installed

**Solution**:
```bash
pnpm --filter @budgetwise/e2e-tests run install:browsers
```

Or use Chromium-only commands:
```bash
pnpm test:smoke:production  # Instead of test:smoke:production:all
```

### Tests Timing Out

**Problem**: Production site slow or unreachable

**Solutions**:
1. Check if site is up: `curl -I https://budgetwise.ca`
2. Increase timeout in `playwright.config.ts`
3. Run with retries: `playwright test --retries=2`

### Can't Connect to localhost

**Problem**: Local dev server not running

**Solution**:
```bash
# Terminal 1: Start frontend
cd apps/frontend && pnpm dev

# Terminal 2: Start API
cd apps/api && pnpm dev

# Terminal 3: Run tests
pnpm test:smoke
```

### Flaky Tests

**Problem**: Tests pass/fail randomly

**Solutions**:
1. Run with UI mode: `pnpm --filter @budgetwise/e2e-tests run test:ui`
2. Check screenshots: `playwright-report/` after failure
3. Add explicit waits in test code
4. Use `--headed` to watch: `pnpm --filter @budgetwise/e2e-tests run test:headed`

## CI/CD Integration

### GitHub Actions

Smoke tests run automatically:

```yaml
# .github/workflows/smoke-tests.yml
- name: Install browsers
  run: pnpm --filter @budgetwise/e2e-tests exec playwright install --with-deps chromium

- name: Run smoke tests
  run: pnpm test:smoke:production
```

Uses Chromium-only for speed and reliability.

### Manual Trigger

```bash
# From GitHub Actions UI
Workflow: Smoke Tests → Run workflow → main
```

### Scheduled

Runs daily at 9 AM UTC to catch production issues.

## Best Practices

### Local Development

1. **Use Chromium-only** for quick feedback
   ```bash
   pnpm test:smoke
   ```

2. **Run all browsers** before pushing major changes
   ```bash
   pnpm test:smoke:all
   ```

3. **Use UI mode** for debugging
   ```bash
   cd e2e-tests && pnpm test:ui
   ```

### CI/CD

1. **PRs**: Chromium-only (fast feedback)
2. **Main branch**: Chromium-only (reliable)
3. **Pre-release**: All browsers (comprehensive)
4. **Post-deploy**: Chromium-only production smoke tests

### Writing Tests

1. **Be specific**: Use data-testid attributes
2. **Wait explicitly**: Use `waitForLoadState()`, `waitForSelector()`
3. **Test real scenarios**: Don't just check HTTP status codes
4. **Keep it fast**: Smoke tests should run in < 1 minute per browser
5. **Make it reliable**: Avoid timing-dependent assertions

## Related Documentation

- [CI/CD Testing Strategy](../.github/CI_CD_TESTING_STRATEGY.md)
- [Smoke Tests Workflow](../.github/workflows/smoke-tests.yml)
- [Playwright Docs](https://playwright.dev)
