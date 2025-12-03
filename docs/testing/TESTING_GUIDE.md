# BudgetWise Testing Guide

> **Complete guide to testing in BudgetWise** - Unit, Integration, E2E, and CI/CD

## Table of Contents

- [Quick Start](#quick-start)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Coverage](#coverage)
- [CI/CD Testing](#cicd-testing)
- [Smoke Tests](#smoke-tests)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

---

## Quick Start

### Run All Tests

```bash
# All tests (unit + integration)
pnpm test

# Just unit tests
pnpm test:unit

# Just integration tests
pnpm test:int

# With coverage
pnpm test:coverage
```

### Run Tests for Specific Package

```bash
# Frontend tests
pnpm --filter frontend test

# API tests
pnpm --filter api test

# Domain tests
pnpm --filter @budget/domain test

# Use cases tests
pnpm --filter @budget/usecases test

# Specific adapter
pnpm --filter @budget/adapters-auth-supabase test
```

### View Coverage

```bash
# Generate and open HTML coverage report
pnpm coverage:report
```

---

## Test Types

### 1. Unit Tests

**Purpose**: Test individual functions/classes in isolation

**Location**: `packages/*/src/*.test.ts`, `apps/*/src/*.test.ts`

**Characteristics**:
- Fast (milliseconds)
- No external dependencies
- Mock/stub dependencies
- Test pure logic

**Example**:
```typescript
// packages/domain/src/entities/budget.test.ts
import { describe, it, expect } from 'vitest';
import { Budget } from './budget';

describe('Budget', () => {
  it('should create a valid budget', () => {
    const budget = Budget.create({
      name: 'Groceries',
      amount: 50000, // $500.00 in cents
    });
    
    expect(budget.name).toBe('Groceries');
    expect(budget.amount).toBe(50000);
  });
});
```

**Current Status**: 525 tests across 47 files

### 2. Integration Tests

**Purpose**: Test how components work together

**Location**: `packages/*/tests/integration/*.int.test.ts`

**Characteristics**:
- Medium speed (seconds)
- Real adapters (databases, APIs)
- Test boundaries between layers
- Verify contracts

**Example**:
```typescript
// packages/adapters/persistence/tests/integration/supabase-auth.int.test.ts
import { describe, it, expect } from 'vitest';
import { SupabaseAuthAdapter } from '../../src/supabase-auth';

describe('SupabaseAuthAdapter Integration', () => {
  it('should authenticate user with valid credentials', async () => {
    const auth = new SupabaseAuthAdapter(supabaseClient);
    
    const result = await auth.signIn({
      email: 'test@example.com',
      password: 'password123',
    });
    
    expect(result).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
  });
});
```

**What we test**:
- Supabase database operations
- Authentication flows
- Repository implementations
- Service integrations

### 3. Smoke Tests (E2E)

**Purpose**: Validate production deployment is working

**Location**: `e2e-tests/smoke-tests/`

**Characteristics**:
- Slow (minutes)
- Test against real production
- Playwright browser tests
- Critical user journeys

**Example**:
```typescript
// e2e-tests/smoke-tests/production-health.test.ts
import { test, expect } from '@playwright/test';

test('should load homepage successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/BudgetWise/);
});
```

**Coverage**:
- Frontend health (4 tests)
- API health (4 tests)
- Critical user flows (2 tests)
- Performance (2 tests)
- Error handling (2 tests)
- Security (3 tests)

**Total**: 17 smoke tests × 5 browsers = 85 tests (Chromium-only by default)

---

## Running Tests

### Local Development

```bash
# Watch mode (re-run on file changes)
pnpm test:unit --watch

# Run specific test file
pnpm test packages/domain/src/entities/budget.test.ts

# Run tests matching pattern
pnpm test --testNamePattern="Budget"

# Debug mode
pnpm test --inspect-brk
```

### Coverage Reports

```bash
# Generate coverage
pnpm test:coverage

# View HTML report
pnpm coverage:report

# Generate just HTML (if coverage exists)
pnpm coverage:html

# View in browser
pnpm coverage:view
```

### Smoke Tests

```bash
# Local smoke tests (Chromium only - fast)
pnpm test:smoke

# Production smoke tests (Chromium only)
pnpm test:smoke:production

# All browsers (comprehensive)
pnpm test:smoke:production:all

# Debug mode
cd e2e-tests && pnpm test:ui
```

**See**: [`e2e-tests/QUICK_START.md`](./e2e-tests/QUICK_START.md) for details

### CI/CD

Tests run automatically on:
- Every push (type check + lint)
- Pull requests (changed packages only)
- Merge to main/dev (all tests)
- Daily (smoke tests)

**See**: [CI/CD Testing](#cicd-testing) section below

---

## Writing Tests

### Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Component/Feature Name', () => {
  // Setup before each test
  beforeEach(() => {
    // Reset state, create mocks, etc.
  });
  
  // Cleanup after each test
  afterEach(() => {
    // Clear mocks, close connections, etc.
  });
  
  // Organize tests in groups
  describe('when condition', () => {
    it('should do expected behavior', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = myFunction(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
  
  it('should handle edge cases', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

### Best Practices

**✅ DO**:
- Test behavior, not implementation
- Use clear, descriptive test names
- Follow Arrange-Act-Assert pattern
- Test edge cases and errors
- Keep tests independent
- Use meaningful assertions

**❌ DON'T**:
- Test private methods directly
- Create test interdependencies
- Mock everything (test real integrations when possible)
- Write tests that depend on execution order
- Ignore warnings/deprecations

### Testing Clean Architecture

**Domain Entities** (Pure Unit Tests):
```typescript
// No mocks needed - pure functions
describe('Budget Entity', () => {
  it('should validate amount is positive', () => {
    expect(() => 
      Budget.create({ name: 'Test', amount: -100 })
    ).toThrow('Amount must be positive');
  });
});
```

**Use Cases** (Use In-Memory Adapters):
```typescript
// Test with real implementations, not mocks
describe('CreateBudget UseCase', () => {
  let useCase: CreateBudgetUseCase;
  let budgetRepo: InMemoryBudgetRepository;
  
  beforeEach(() => {
    budgetRepo = new InMemoryBudgetRepository();
    useCase = new CreateBudgetUseCase(budgetRepo);
  });
  
  it('should create budget', async () => {
    const budget = await useCase.execute({
      name: 'Groceries',
      amount: 500,
    });
    
    expect(budget.name).toBe('Groceries');
    expect(budgetRepo.data.size).toBe(1);
  });
});
```

**Adapters** (Integration Tests):
```typescript
// Test against real services
describe('SupabaseBudgetRepository', () => {
  let repo: SupabaseBudgetRepository;
  let supabase: SupabaseClient;
  
  beforeEach(async () => {
    supabase = createTestSupabaseClient();
    repo = new SupabaseBudgetRepository(supabase);
    await cleanupDatabase();
  });
  
  it('should persist budget to database', async () => {
    const budget = await repo.create({
      name: 'Groceries',
      amount: 500,
    });
    
    const fetched = await repo.findById(budget.id);
    expect(fetched).toEqual(budget);
  });
});
```

### Common Patterns

**Mocking**:
```typescript
import { vi } from 'vitest';

// Mock a function
const mockFn = vi.fn().mockReturnValue('result');

// Mock a module
vi.mock('./my-module', () => ({
  myFunction: vi.fn(),
}));

// Spy on existing function
const spy = vi.spyOn(obj, 'method');
```

**Async Testing**:
```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

it('should handle promises', () => {
  return expect(promiseFunction()).resolves.toBe('value');
});

it('should handle rejections', () => {
  return expect(promiseFunction()).rejects.toThrow('error');
});
```

**Database Testing**:
```typescript
describe('Repository', () => {
  beforeEach(async () => {
    // Clean database
    await db.delete(budgets).execute();
  });
  
  afterAll(async () => {
    // Close connections
    await db.close();
  });
});
```

---

## Coverage

### Current Coverage

```
Overall: 55.3% lines | 74.5% functions

By Package:
├─ domain:         100%  (all entities)
├─ use-cases:    50-100% (core flows covered)
├─ adapters:     23-100% (varies by adapter)
├─ frontend:     83-100% (critical utilities)
└─ api:          28-70%  (business logic in use cases)
```

**Total**: 525 tests across 47 test files

### Coverage Commands

```bash
# Generate coverage for all packages
pnpm test:coverage

# Generate HTML report
pnpm coverage:html

# View in browser
pnpm coverage:view

# Full workflow
pnpm coverage:report  # test + generate + open
```

### Coverage Files

```
coverage/
├─ lcov.info          # Merged coverage (all packages)
├─ html/              # HTML report
│  └─ index.html      # Open in browser
└─ [package-name]/    # Individual package coverage
```

### Understanding Coverage

**Lines Coverage**: Percentage of code lines executed
**Functions Coverage**: Percentage of functions called  
**Branches Coverage**: Percentage of conditional branches taken
**Statements Coverage**: Percentage of statements executed

**Example**:
```typescript
// This function has:
// - 3 lines
// - 2 branches (if/else)
// - 3 statements
function divide(a: number, b: number) {
  if (b === 0) {        // Branch 1
    throw new Error();
  } else {              // Branch 2
    return a / b;
  }
}

// 100% coverage requires testing both branches
it('should divide numbers', () => {
  expect(divide(10, 2)).toBe(5);      // Covers branch 2
});

it('should throw on division by zero', () => {
  expect(() => divide(10, 0)).toThrow();  // Covers branch 1
});
```

### Coverage Best Practices

**✅ DO**:
- Aim for 80%+ on critical code
- Focus on business logic
- Test edge cases
- Ignore generated/trivial code

**❌ DON'T**:
- Obsess over 100% coverage
- Write tests just for coverage
- Test framework code
- Test type definitions

---

## CI/CD Testing

### Testing Strategy

We use **smart test selection** to balance speed and quality:

| Event | Type Check | Lint | Unit Tests | Integration | Coverage | Time |
|-------|:----------:|:----:|:----------:|:-----------:|:--------:|------|
| **Feature Branch** | ✅ | ✅ | ❌ | ❌ | ❌ | ~2 min |
| **Pull Request** | ✅ | ✅ | Changed only | Changed only | ✅ | ~5-8 min |
| **Main/Dev** | ✅ | ✅ | All (525) | All | ✅ | ~20-30 min |
| **Post-Deploy** | ❌ | ❌ | ❌ | ❌ | Smoke (17) | ~30s |

### How It Works

**1. Change Detection**:
```yaml
# .github/workflows/test.yml
uses: dorny/paths-filter@v3
with:
  filters: |
    frontend: 'apps/frontend/**'
    api: 'apps/api/**'
    packages: 'packages/**'
```

**2. Smart Filtering** (PRs only):
```bash
# Run tests only for changed packages
pnpm turbo run test:unit --filter="...[origin/main]"
```

**3. Full Tests** (main/dev):
```bash
# Run all 525 tests
pnpm test:unit
pnpm test:int
```

### Workflows

**`.github/workflows/test.yml`**: Main testing workflow
- Quick checks (type + lint)
- Unit tests (smart selection)
- Integration tests (smart selection)
- Coverage reports

**`.github/workflows/smoke-tests.yml`**: Production validation
- Runs after deployment
- 17 tests on Chromium
- Daily at 9 AM UTC
- Manual trigger available

**`.github/workflows/linter.yml`**: Code quality
- ESLint
- TypeScript
- Prettier (if configured)

### Benefits

**Speed**: 
- PRs: 5-8 minutes (was 30 min) - **75% faster**
- Production: Full coverage where it matters

**Quality**:
- All 525 tests maintained
- No tests removed
- Smart selection doesn't sacrifice quality

**Cost**:
- GitHub Actions: 75% reduction in minutes
- Developer time: Faster feedback loop

---

## Smoke Tests

### What Are Smoke Tests?

**Smoke tests** validate that production deployment is working by testing critical functionality against the live site.

**Coverage**:
- ✅ Frontend loads correctly
- ✅ API responds to requests
- ✅ Authentication redirects work
- ✅ Performance is acceptable
- ✅ Security headers present
- ✅ Error handling works

### Running Smoke Tests

**Production** (Recommended):
```bash
pnpm test:smoke:production  # Chromium only - fast (~30s)
```

**All Browsers** (Comprehensive):
```bash
pnpm test:smoke:production:all  # All 5 browsers (~2-3min)
```

**Local** (Requires dev servers):
```bash
# Terminal 1: Start frontend
cd apps/frontend && pnpm dev

# Terminal 2: Start API
cd apps/api && pnpm dev

# Terminal 3: Run tests
pnpm test:smoke
```

**Debug Mode**:
```bash
cd e2e-tests

pnpm test:headed    # Watch tests run in browser
pnpm test:ui        # Interactive UI mode
pnpm test:debug     # Step-by-step debugger
pnpm report         # View last test report
```

### Smoke Test Details

| Category | Tests | What It Checks |
|----------|:-----:|----------------|
| **Frontend Health** | 4 | Homepage, login, signup, static assets |
| **API Health** | 4 | Health check, CORS, 404s, auth |
| **User Flows** | 2 | Redirects, error messages |
| **Performance** | 2 | Page load speed, API response time |
| **Error Handling** | 2 | Network errors, error format |
| **Security** | 3 | HTTPS, headers, no info leaks |
| **Total** | **17** | **All critical functionality** |

### CI Smoke Tests

Smoke tests run automatically:
- **After deployment**: Validates production
- **Daily at 9 AM UTC**: Catches regressions
- **Manual trigger**: Test anytime

**GitHub Actions**:
```
1. Actions → Smoke Tests → Run workflow
2. Select branch: main
3. (Optional) Custom URLs
4. Run workflow
5. Wait ~30 seconds
```

**See**: 
- [`.github/workflows/smoke-tests.yml`](./.github/workflows/smoke-tests.yml) - Workflow configuration
- [`.github/CI_SMOKE_TESTS.md`](./.github/CI_SMOKE_TESTS.md) - CI reliability guide

### Troubleshooting Smoke Tests

**"Executable doesn't exist"**:
```bash
# Install browsers
pnpm --filter @budgetwise/e2e-tests run install:browsers
```

**Tests failing locally**:
```bash
# Make sure dev servers are running
pnpm dev  # in apps/frontend
pnpm dev  # in apps/api
```

**Flaky tests**:
```bash
# Run with UI to debug
cd e2e-tests && pnpm test:ui
```

**Full Guide**: [`e2e-tests/README.md`](./e2e-tests/README.md)

---

## Troubleshooting

### Common Issues

**Tests not finding modules**:
```bash
# Reinstall dependencies
pnpm install

# Clear cache
rm -rf node_modules/.cache
pnpm test --clearCache
```

**Coverage not merging**:
```bash
# Regenerate coverage
pnpm test:coverage

# Check coverage files exist
ls -la packages/*/coverage/lcov.info
```

**Integration tests failing**:
```bash
# Check Supabase connection
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Verify database is accessible
pnpm --filter @budget/adapters-persistence test:int --verbose
```

**Vitest not watching files**:
```bash
# Add to vitest.config.ts
export default defineConfig({
  test: {
    watch: true,
    watchExclude: ['**/node_modules/**', '**/dist/**'],
  },
});
```

### Debug Tips

**1. Use `--verbose` flag**:
```bash
pnpm test --verbose
```

**2. Use `console.log` in tests**:
```typescript
it('should work', () => {
  console.log('Debug:', myVar);
  expect(myVar).toBe('expected');
});
```

**3. Use debugger**:
```typescript
it('should work', () => {
  debugger;  // Breakpoint in VS Code
  expect(result).toBe('expected');
});
```

**4. Isolate the test**:
```typescript
it.only('should work', () => {  // Run only this test
  // ...
});
```

**5. Check test output**:
```bash
# Run single test with full output
pnpm test -- packages/domain/src/entities/budget.test.ts
```

---

## Resources

### Documentation

**Test Guides**:
- [`e2e-tests/README.md`](./e2e-tests/README.md) - Complete smoke test guide
- [`e2e-tests/QUICK_START.md`](./e2e-tests/QUICK_START.md) - Quick reference
- [`course-work/TESTING_PLAN.md`](./course-work/TESTING_PLAN.md) - Original test plan

**CI/CD**:
- [`.github/workflows/test.yml`](./.github/workflows/test.yml) - Main test workflow
- [`.github/workflows/smoke-tests.yml`](./.github/workflows/smoke-tests.yml) - Smoke tests
- [`course-work/CI_TESTING_STRATEGY.md`](./course-work/CI_TESTING_STRATEGY.md) - Full CI strategy

**Architecture**:
- [`DESIGN.md`](./DESIGN.md) - Clean architecture overview
- [`TESTING-RATIONALE.md`](./TESTING-RATIONALE.md) - Why we test this way

### External Resources

**Vitest**:
- [Vitest Documentation](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Vitest Config](https://vitest.dev/config/)

**Playwright**:
- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test](https://playwright.dev/docs/test-intro)
- [Playwright CI](https://playwright.dev/docs/ci)

**Testing Best Practices**:
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles/)
- [Kent C. Dodds - Testing](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Martin Fowler - Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

### Quick Links

| Task | Command |
|------|---------|
| Run all tests | `pnpm test` |
| Run unit tests | `pnpm test:unit` |
| Run integration tests | `pnpm test:int` |
| Run with coverage | `pnpm test:coverage` |
| View coverage report | `pnpm coverage:report` |
| Run smoke tests (prod) | `pnpm test:smoke:production` |
| Debug smoke tests | `cd e2e-tests && pnpm test:ui` |
| Watch mode | `pnpm test --watch` |
| Run specific test | `pnpm test <file-path>` |
| Install browsers | `pnpm --filter @budgetwise/e2e-tests run install:browsers` |

---

## Summary

BudgetWise uses a comprehensive testing strategy:

**525 tests** across 47 files covering:
- ✅ Domain entities (100% coverage)
- ✅ Use cases (50-100% coverage)
- ✅ Adapters (23-100% coverage)
- ✅ Frontend utilities (83-100% coverage)

**17 smoke tests** validating production:
- ✅ Frontend health
- ✅ API health
- ✅ Critical user flows
- ✅ Performance
- ✅ Security

**Smart CI/CD** optimized for speed:
- ✅ Fast feedback on PRs (5-8 min)
- ✅ Comprehensive testing on main (20-30 min)
- ✅ Daily production validation
- ✅ 75% reduction in CI time

**Clean architecture** enables:
- ✅ Testable code by design
- ✅ No mocks needed for use cases
- ✅ Fast unit tests (milliseconds)
- ✅ Reliable integration tests

---

**Need help?** Check the [Troubleshooting](#troubleshooting) section or see specific guides in [`e2e-tests/`](./e2e-tests/) and [`course-work/`](./course-work/).
