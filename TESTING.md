# Testing Guide

This monorepo uses a consistent testing structure to separate unit, integration, and E2E tests.

## Test Types

- **Unit Tests**: Test individual functions, classes, or components in isolation. No external dependencies, network calls, or file I/O. Use mocks/stubs for dependencies.
- **Integration Tests**: Test interactions between multiple modules or with external systems (e.g., databases, APIs). May use in-memory adapters or test environments.
- **E2E Tests**: Full end-to-end tests that simulate user interactions with the deployed application. Use Playwright for browser-based testing.
- **Critical Regression Tests**: Fast, lightweight subset of tests covering high-impact, high-risk core functionality (auth, budgets CRUD, categories, transaction flow). Tagged with `@critical` and suitable for smoke testing after deployments.

## File Locations

- **Unit Tests**: Co-located with source code in `src/**/*.{test,spec}.{ts,tsx}`
- **Integration Tests**: In `tests/integration/**/*.int.test.{ts,tsx}` per app/package
- **E2E Tests**: At repo root in `e2e/**/*.e2e.spec.ts`

## Running Tests

### All Tests
- `pnpm test` - Run all tests in the monorepo
- `pnpm test:unit` - Run only unit tests
- `pnpm test:int` - Run only integration tests
- `pnpm test:critical` - Run critical regression tests (fast smoke checks for core functionality)
- `pnpm test:e2e` - Run E2E tests

### Per Package/App
- `pnpm test --filter <package>` - Run all tests for a specific package
- `pnpm test:unit --filter <package>` - Run unit tests for a package
- `pnpm test:int --filter <package>` - Run integration tests for a package
- `pnpm test:critical --filter <package>` - Run critical regression tests for a package

## Examples

### API (Workers/Miniflare)
- **Unit**: `apps/api/src/routes/budgets.test.ts` - Test route handlers with mocked dependencies
- **Integration**: `apps/api/tests/integration/transactions.int.test.ts` - Test full request flow with Miniflare runtime

### Frontend (MSW)
- **Unit**: `apps/frontend/src/hooks/useAuth.test.tsx` - Test hook logic with mocked API
- **Integration**: `apps/frontend/tests/integration/auth/login.int.test.tsx` - Test login page with MSW for API mocking

### Usecases (In-Memory Ports)
- **Unit**: `packages/usecases/src/budgets/create-budget.test.ts` - Test usecase with mocked ports
- **Integration**: `packages/usecases/tests/integration/category-budget-transaction.integration.test.ts` - Test multiple usecases with in-memory adapters

### Adapters (Contract Tests)
- **Unit**: `packages/adapters/auth-supabase/src/index.test.ts` - Test adapter methods with mocked Supabase
- **Integration**: `packages/adapters/auth-supabase/tests/integration/index.int.test.ts` - Test against real Supabase emulator or test DB

## Configuration

- Vitest configs include the appropriate globs for each test type
- Frontend uses `jsdom` environment and loads `tests/setup/setupTests.ts`
- API/Workers use `node` environment
- Coverage is collected per package
    - [`get-budget-status.ts`](budgetwise/packages/usecases/src/budgets/get-budget-status.ts:1)
    - [`get-budget-dashboard.ts`](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.ts:1)

- API (HTTP integration via Hono)
  - Endpoints and DTOs.
  - Tests:
    - [`budgets.test.ts`](budgetwise/apps/api/src/routes/budgets.test.ts:1)
    - [`categories.test.ts`](budgetwise/apps/api/src/routes/categories.test.ts:1)
    - [`transactions.int.test.ts`](budgetwise/apps/api/src/routes/transactions.int.test.ts:1)

---

## How-To

- Add a new domain rule? Write/extend a unit test near the entity:
  - e.g., add an invariant → update [`budget.test.ts`](budgetwise/packages/domain/src/budget.test.ts:48).
- Add/edit a usecase? Cover happy-path + negative cases:
  - e.g., listing filters → [`list-budgets.test.ts`](budgetwise/packages/usecases/src/budgets/list-budgets.test.ts:1).
- Add/edit an API route? Assert status codes + response DTOs:
  - e.g., POST/GET/PUT/DELETE coverage → [`budgets.test.ts`](budgetwise/apps/api/src/routes/budgets.test.ts:76).

---

## Rationale

- Domain-first invariants:
  - Catch invalid state at the source (constructors/methods), e.g. [`Category`](budgetwise/packages/domain/src/category.ts:16), [`Budget`](budgetwise/packages/domain/src/budget.ts:22).
- Usecases as acceptance criteria:
  - Validate business behaviors (CRUD, guards, aggregation) using in-memory adapters and deterministic time, e.g. [`get-budget-status.ts`](budgetwise/packages/usecases/src/budgets/get-budget-status.ts:1), [`get-budget-dashboard.ts`](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.ts:1).
- Integration proves the flow:
  - Category → Budget → Transaction → Dashboard, e.g. [`category-budget-transaction.integration.test.ts`](budgetwise/packages/usecases/src/integration/category-budget-transaction.integration.test.ts:1).
- Deterministic and fast:
  - In-memory repos: [`budgets-repo.ts`](budgetwise/packages/adapters/persistence/local/src/budgets-repo.ts:1), [`categories-repo.ts`](budgetwise/packages/adapters/persistence/local/src/categories-repo.ts:1), [`transactions-repo.ts`](budgetwise/packages/adapters/persistence/local/src/transactions-repo.ts:4)
  - Fixed clock: [`clock.ts`](budgetwise/packages/adapters/system/src/clock.ts:1)
  - ULIDs: [`id.ts`](budgetwise/packages/adapters/system/src/id.ts:1)

---

## Example Scenarios

- Category aggregation:
  - Create Category → Create Budget → Add Transaction → Get Dashboard
  - See [`integration test`](budgetwise/packages/usecases/src/integration/category-budget-transaction.integration.test.ts:1)
- Alert thresholds:
  - `alertThreshold = 0` alerts for any spend > 0 (not on 0)
  - `>=` boundary semantics
  - See [`Budget.shouldAlert()`](budgetwise/packages/domain/src/budget.ts:71) and [`budget-edge-cases.test.ts`](budgetwise/packages/usecases/src/budgets/budget-edge-cases.test.ts:83)

---

## Critical Regression Tests

Critical regression tests are a prioritized subset of tests tagged with `@critical` that cover:
- **High Impact**: Core business functionality (authentication, budget CRUD, categories, transactions)
- **High Risk**: Features prone to breaking with changes (auth middleware, dashboard aggregation, transaction flow)

### Usage

**Suggested times to run critical tests:**
- After every deployment (smoke testing)
- On every PR (fast feedback loop, <5 minutes)
- Before releases as a gate check
- When time-constrained and full suite is expensive

**Suggested times to run full suite:**
- Nightly builds
- Pre-release validation
- When making architectural changes

**Current critical tests:**
- `@critical allows request when token is valid` - Auth middleware validation
- `@critical should create a budget with valid data` - Budget creation
- `@critical should list all budgets for user` - Budget listing
- `@critical should return dashboard data` - Dashboard aggregation
- `@critical should update budget amount` - Budget updates
- `@critical should create a category with minimal data` - Category creation
- `@critical should list all categories` - Category listing
- `@critical should reflect added transaction in dashboard totals` - Full transaction flow

**Adding new critical tests:**
Tag any test with `@critical` in its description:
```typescript
it('@critical should handle core feature', async () => {
  // test implementation
});
```

---

## Commands (Cheat Sheet)

```bash
# Run all tests
pnpm test

# Run critical regression tests (fast smoke checks)
pnpm test:critical

# Focus a package
pnpm test --filter @budget/domain
pnpm test --filter @budget/usecases
pnpm test --filter api

# Coverage
pnpm test --filter @budget/domain -- --coverage
pnpm test --filter @budget/usecases -- --coverage

# Typecheck
pnpm typecheck
```
