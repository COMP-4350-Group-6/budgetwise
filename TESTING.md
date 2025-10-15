# Testing Guide: Budgets and Categories

This document describes the testing strategy, coverage, and how to run and extend tests for Categories, Budgets, and their aggregation via Transactions.

## Scope and Goals

- Validate domain invariants and business rules for Category, Budget, and Transaction.
- Verify usecase behaviors: create/update/list/delete for categories and budgets, status/dashboards, and transaction effects.
- Confirm end-to-end behavior (category → budget → transaction → dashboard aggregation) at usecases and API layers.

## Architecture Surfaces Under Test

- Domain
  - [`category.ts`](budgetwise/packages/domain/src/category.ts): validation and invariants for Category
  - [`budget.ts`](budgetwise/packages/domain/src/budget.ts): invariants and alert logic
    - [`Budget.shouldAlert()`](budgetwise/packages/domain/src/budget.ts:71)
  - [`transaction.ts`](budgetwise/packages/domain/src/transaction.ts): transaction contract
- Usecases
  - Categories: [`create-category.ts`](budgetwise/packages/usecases/src/categories/create-category.ts), [`list-categories.ts`](budgetwise/packages/usecases/src/categories/list-categories.ts), [`update-category.ts`](budgetwise/packages/usecases/src/categories/update-category.ts), [`delete-category.ts`](budgetwise/packages/usecases/src/categories/delete-category.ts), [`seed-default-categories.ts`](budgetwise/packages/usecases/src/categories/seed-default-categories.ts)
  - Budgets: [`create-budget.ts`](budgetwise/packages/usecases/src/budgets/create-budget.ts), [`list-budgets.ts`](budgetwise/packages/usecases/src/budgets/list-budgets.ts), [`update-budget.ts`](budgetwise/packages/usecases/src/budgets/update-budget.ts), [`delete-budget.ts`](budgetwise/packages/usecases/src/budgets/delete-budget.ts)
  - Status and Dashboard: [`get-budget-status.ts`](budgetwise/packages/usecases/src/budgets/get-budget-status.ts), [`get-budget-dashboard.ts`](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.ts)
  - Transactions: [`add-transaction.ts`](budgetwise/packages/usecases/src/transactions/add-transaction.ts)
- Adapters (In-Memory for Tests)
  - [`categories-repo.ts`](budgetwise/packages/adapters/persistence/local/src/categories-repo.ts)
  - [`budgets-repo.ts`](budgetwise/packages/adapters/persistence/local/src/budgets-repo.ts)
  - [`transactions-repo.ts`](budgetwise/packages/adapters/persistence/local/src/transactions-repo.ts)
  - System: [`clock.ts`](budgetwise/packages/adapters/system/src/clock.ts), [`id.ts`](budgetwise/packages/adapters/system/src/id.ts)
- API (Hono)
  - [`categories.ts`](budgetwise/apps/api/src/routes/categories.ts), [`budgets.ts`](budgetwise/apps/api/src/routes/budgets.ts), [`transactions.ts`](budgetwise/apps/api/src/routes/transactions.ts), [`errors.ts`](budgetwise/apps/api/src/middleware/errors.ts), [`auth.ts`](budgetwise/apps/api/src/middleware/auth.ts)

## Test Suites Overview

- **Domain Unit Tests** (test entities in complete isolation)
  - [`budget.test.ts`](budgetwise/packages/domain/src/budget.test.ts) - Budget alert threshold logic
  - [`category.test.ts`](budgetwise/packages/domain/src/category.test.ts) - Category validation rules (name, length, etc.)
  - [`transaction.test.ts`](budgetwise/packages/domain/src/transaction.test.ts) - Transaction validation (amountCents must be integer)
  - [`user.test.ts`](budgetwise/packages/domain/src/user.test.ts) - User validation (email format, name)
  
- **Usecases Tests** (test business workflows with dependencies)
  - Categories
    - [`category-edge-cases.test.ts`](budgetwise/packages/usecases/src/categories/category-edge-cases.test.ts)
    - [`create-category.test.ts`](budgetwise/packages/usecases/src/categories/create-category.test.ts)
  - Budgets
    - [`budget-edge-cases.test.ts`](budgetwise/packages/usecases/src/budgets/budget-edge-cases.test.ts)
    - [`create-budget.test.ts`](budgetwise/packages/usecases/src/budgets/create-budget.test.ts)
    - [`get-budget-dashboard.test.ts`](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.test.ts)
  - Integration
    - [`integration/category-budget-transaction.integration.test.ts`](budgetwise/packages/usecases/src/integration/category-budget-transaction.integration.test.ts)
    
- **API Tests** (test HTTP endpoints)
  - [`budgets.test.ts`](budgetwise/apps/api/src/routes/budgets.test.ts)
  - [`categories.test.ts`](budgetwise/apps/api/src/routes/categories.test.ts)
  - [`transactions.int.test.ts`](budgetwise/apps/api/src/routes/transactions.int.test.ts)

## How to Run

### Running Tests

```bash
# All tests in monorepo
pnpm test

# Domain unit tests only
pnpm test --filter @budget/domain

# Usecases tests only
pnpm test --filter @budget/usecases

# API tests only
pnpm test --filter api

# TypeScript type checking
pnpm typecheck
```

### Running Tests with Coverage

```bash
# Domain tests with coverage
pnpm test --filter @budget/domain -- --coverage

# Usecases tests with coverage
pnpm test --filter @budget/usecases -- --coverage

# All tests with coverage (may fail on API due to schema package issue)
pnpm test -- --coverage
```

**Coverage Reports:**
- Generated in each package's `coverage/` directory
- Open `coverage/index.html` in browser for interactive line-by-line coverage visualization
- `coverage/lcov.info` available for CI/CD integration

**Current Coverage:**
- **Domain Package:** ~50% overall (Category, Transaction, User at 100%)
- **Usecases Package:** ~81% overall

### Notes

- API tests use Hono middleware. Authentication middleware [`authMiddleware`](budgetwise/apps/api/src/middleware/auth.ts:17) expects a JWT secret in environment; configure a test-friendly secret or adjust test scaffolding for API routes.
- Usecases tests rely on in-memory repositories and a deterministic clock for stable period calculations.
- Domain tests have zero dependencies - they test pure entity validation logic in complete isolation.

## Test Data and Harness

- In-memory repositories:
  - [`categories-repo.ts`](budgetwise/packages/adapters/persistence/local/src/categories-repo.ts), [`budgets-repo.ts`](budgetwise/packages/adapters/persistence/local/src/budgets-repo.ts), [`transactions-repo.ts`](budgetwise/packages/adapters/persistence/local/src/transactions-repo.ts)
- Deterministic system ports:
  - [`clock.ts`](budgetwise/packages/adapters/system/src/clock.ts) (fixed now for period calculations)
  - [`id.ts`](budgetwise/packages/adapters/system/src/id.ts) ULID generator
- Transactions:
  - Use [`makeAddTransaction()`](budgetwise/packages/usecases/src/transactions/add-transaction.ts:6) to record spend against a budget
- Status and Dashboard:
  - Budget status comes from [`makeGetBudgetStatus()`](budgetwise/packages/usecases/src/budgets/get-budget-status.ts:15)
  - Category aggregation comes from [`makeGetBudgetDashboard()`](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.ts:27)

## Key Behaviors to Validate

### Category

- Name validation (A–Z and spaces only), max length 50
  - Validated in domain constructor [`Category`](budgetwise/packages/domain/src/category.ts:16)
- Duplicate name restriction per user
  - Checked in usecase: [`makeCreateCategory()`](budgetwise/packages/usecases/src/categories/create-category.ts:14) with duplicate guard at [`duplicate check`](budgetwise/packages/usecases/src/categories/create-category.ts:23)
- Active/inactive toggling and filtering
  - Covered in [`category-edge-cases.test.ts`](budgetwise/packages/usecases/src/categories/category-edge-cases.test.ts)
- Deletion constraints (cannot delete category with active budgets)
  - Covered in [`category-edge-cases.test.ts`](budgetwise/packages/usecases/src/categories/category-edge-cases.test.ts)

### Budget

- Alert threshold logic
  - 0%: alert on any spend > 0, but not on 0
  - 100%: only alert when fully spent
  - Boundary: alert when percentageUsed ≥ threshold
  - Guard for 0-amount budgets
  - Implemented in [`Budget.shouldAlert()`](budgetwise/packages/domain/src/budget.ts:71)
- Period status computation
  - Period windows in [`calculatePeriodDates()`](budgetwise/packages/usecases/src/budgets/get-budget-status.ts:66)
  - Spent/remaining/percentage in [`get-budget-status.ts`](budgetwise/packages/usecases/src/budgets/get-budget-status.ts)
  - Spent calculation sums absolute values at [`reduce()`](budgetwise/packages/usecases/src/budgets/get-budget-status.ts:44)
- Overspending and exact spend to limit
  - Covered in [`budget-edge-cases.test.ts`](budgetwise/packages/usecases/src/budgets/budget-edge-cases.test.ts)

### Dashboard (Category Aggregation)

- Aggregates budget statuses per category, totals budget/spent/remaining
  - Loop over category budgets and accumulation at [`status loop`](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.ts:56)
  - Category summary build at [`summary`](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.ts:69)
- Over-budget and alerts aggregation
  - Counted during accumulation at [`flags`](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.ts:60)

### Transactions

- Contract and creation
  - Domain props in [`transaction.ts`](budgetwise/packages/domain/src/transaction.ts)
  - Persisted by repository [`TransactionsRepo`](budgetwise/packages/ports/src/repositories/transactions-repo.ts)
  - Created by usecase [`makeAddTransaction()`](budgetwise/packages/usecases/src/transactions/add-transaction.ts:6)
- Effect on budgets and categories
  - Budgets: increased `spentCents` within the active period; reduced `remainingCents` in [`get-budget-status.ts`](budgetwise/packages/usecases/src/budgets/get-budget-status.ts)
  - Categories: aggregated `totalSpentCents` and `totalRemainingCents` in [`get-budget-dashboard.ts`](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.ts)

## Test Types & Coverage Map

### Domain Unit Tests (Zero Dependencies)

Test individual entities in complete isolation - pure validation logic only.

- **Budget:** [`budget.test.ts`](budgetwise/packages/domain/src/budget.test.ts) - 4 tests
  - Alert threshold behavior (0%, 100%, boundary conditions)
  - Zero-budget guard via [`Budget.shouldAlert()`](budgetwise/packages/domain/src/budget.ts:71)
  - **Coverage: 51.78%** (tested: shouldAlert, isActive methods)

- **Category:** [`category.test.ts`](budgetwise/packages/domain/src/category.test.ts) - 35 tests
  - Name validation (A-Z only, length 1-50, no special chars/emoji/unicode)
  - Empty name rejection, whitespace handling
  - Optional fields (description, icon, color)
  - Getters (id, name, isActive, isDefault)
  - **Coverage: 100%**

- **Transaction:** [`transaction.test.ts`](budgetwise/packages/domain/src/transaction.test.ts) - 37 tests
  - Integer validation for amountCents (rejects decimals, NaN, Infinity)
  - Positive, negative, and zero amounts
  - Optional fields (categoryId, note)
  - Date handling (occurredAt, createdAt, updatedAt)
  - **Coverage: 100%**

- **User:** [`user.test.ts`](budgetwise/packages/domain/src/user.test.ts) - 60 tests
  - Email format validation (rejects missing @, domain, TLD)
  - Name validation (rejects empty/whitespace-only)
  - Unicode support in names
  - Getters (id, email, name, defaultCurrency)
  - **Coverage: 100%**

### Usecases Tests (With Dependencies)

Test business workflows using in-memory repositories and system adapters.

- **Category Usecases**
  - [`create-category.test.ts`](budgetwise/packages/usecases/src/categories/create-category.test.ts) - 6 tests
  - [`category-edge-cases.test.ts`](budgetwise/packages/usecases/src/categories/category-edge-cases.test.ts) - 33 tests
  - Tests: duplicate prevention, deletion constraints, active/inactive toggling, high-volume scenarios
  - **Coverage: 94.44%**

- **Budget Usecases**
  - [`create-budget.test.ts`](budgetwise/packages/usecases/src/budgets/create-budget.test.ts) - 5 tests
  - [`budget-edge-cases.test.ts`](budgetwise/packages/usecases/src/budgets/budget-edge-cases.test.ts) - 21 tests
  - [`get-budget-dashboard.test.ts`](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.test.ts) - 7 tests
  - Tests: alert thresholds, overspending, period calculations, concurrent transactions
  - **Coverage: 78.89%**

- **Integration Tests**
  - [`category-budget-transaction.integration.test.ts`](budgetwise/packages/usecases/src/integration/category-budget-transaction.integration.test.ts) - 1 test
  - Full workflow: Category → Budget → Transaction → Dashboard aggregation

### API Integration Tests

Test HTTP endpoints with Hono middleware.

- [`budgets.test.ts`](budgetwise/apps/api/src/routes/budgets.test.ts)
- [`categories.test.ts`](budgetwise/apps/api/src/routes/categories.test.ts)
- [`transactions.int.test.ts`](budgetwise/apps/api/src/routes/transactions.int.test.ts) - Full flow validation

### Domain vs Usecase Tests: Key Differences

| Aspect | Domain Unit Tests | Usecase Tests |
|--------|------------------|---------------|
| **What** | Entity validation rules | Business workflows |
| **Dependencies** | None (zero) | Repos, clock, ID generator |
| **Example** | "Name must be A-Z only" | "Create category → save → retrieve" |
| **Speed** | Fastest (ms) | Fast (slightly slower) |
| **Coverage** | Domain package | Usecases package |
| **Purpose** | Ensure domain integrity | Ensure workflows work |

**Why Both Matter:**
- Domain tests give accurate coverage metrics for the domain layer (monorepo coverage is per-package)
- Usecase tests verify the domain rules work correctly when integrated with repositories
- Both catch issues, but at different architectural layers

## Example Scenarios

1) Category spending aggregation
- Create Category → Create Budget in category → Add Transaction → Get Dashboard
- Expect:
  - `totalBudgetCents` equals sum of budgets
  - `totalSpentCents` equals sum of budgets’ period spends
  - `totalRemainingCents = totalBudgetCents - totalSpentCents`
- See: [`integration/category-budget-transaction.integration.test.ts`](budgetwise/packages/usecases/src/integration/category-budget-transaction.integration.test.ts)

2) Alert thresholds
- Create Budget with `alertThreshold = 0` then add small spend
- Expect `shouldAlert = true`
- See: [`budget-edge-cases.test.ts`](budgetwise/packages/usecases/src/budgets/budget-edge-cases.test.ts)

3) Duplicate category prevention (per user)
- Attempt to create a category with the same name (case-insensitive) twice for the same user
- Expect a duplicate error thrown from [`create-category.ts`](budgetwise/packages/usecases/src/categories/create-category.ts)
  - Duplicate check at [`guard`](budgetwise/packages/usecases/src/categories/create-category.ts:23)

## API Auth Considerations

- Categories and Budgets routes use [`authMiddleware`](budgetwise/apps/api/src/middleware/auth.ts:17) and expect a JWT secret in the environment. Ensure a test-friendly JWT secret is provided or mock/bypass for local tests.
- Transactions route does not use auth middleware; it validates body input via [`TransactionDTO`](budgetwise/packages/schemas/src/transaction.schema.ts).
- Error handling surfaces as JSON via [`errors.ts`](budgetwise/apps/api/src/middleware/errors.ts).

## Known Pitfalls and Notes

- Transactions counted as spend use `Math.abs(amountCents)` in [`get-budget-status.ts`](budgetwise/packages/usecases/src/budgets/get-budget-status.ts:44). If you need refunds/credits to increase remaining, adjust this to sum signed values and update tests accordingly.
- Category name validation is strict (A–Z and spaces). Unicode and punctuation are rejected in names at domain level [`Category`](budgetwise/packages/domain/src/category.ts:16), but icons can hold emoji.
- Alert thresholds:
  - `0` → any spend > 0 alerts
  - Boundary uses ≥ logic in [`Budget.shouldAlert()`](budgetwise/packages/domain/src/budget.ts:71)

## Extending Tests (Suggested Additions)

- Refunds/Credits flow (negative transactions) and their effect if the signed-sum model is adopted.
- Cross-period boundaries (transactions near end/start of period) via [`calculatePeriodDates()`](budgetwise/packages/usecases/src/budgets/get-budget-status.ts:66).
- Multi-category dashboard with overlapping budgets to validate totals and counts across categories.
- API-level auth-enabled tests with a mock JWT signer for [`authMiddleware`](budgetwise/apps/api/src/middleware/auth.ts:17).

## Commands Cheatsheet

### Running Tests
```bash
pnpm test                                    # All tests
pnpm test --filter @budget/domain            # Domain unit tests only
pnpm test --filter @budget/usecases          # Usecases tests only
pnpm test --filter api                       # API tests only
pnpm typecheck                               # TypeScript type checking
```

### Running with Coverage
```bash
pnpm test --filter @budget/domain -- --coverage      # Domain coverage
pnpm test --filter @budget/usecases -- --coverage    # Usecases coverage
pnpm test -- --coverage                              # All packages (may fail on API)
```

### Viewing Coverage Reports
```bash
# Coverage is in each package's coverage/ directory
open packages/domain/coverage/index.html       # Domain coverage (interactive)
open packages/usecases/coverage/index.html     # Usecases coverage (interactive)
```
