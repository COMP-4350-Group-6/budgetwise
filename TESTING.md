# Testing Guide (Quick Start)

Run these first:

- All tests (monorepo): `pnpm test`
- Domain tests with coverage: `pnpm test --filter @budget/domain -- --coverage`
- Usecases tests with coverage: `pnpm test --filter @budget/usecases -- --coverage`
- API tests: `pnpm test --filter api`
- Frontend: `pnpm test --filter frontend` 
- Open coverage report (HTML):
  - Domain: `open packages/domain/coverage/index.html`
  - Usecases: `open packages/usecases/coverage/index.html`

Notes:

- Coverage is per-package. API tests do not raise Domain coverage and vice versa.
- Barrel files like [`index.ts`](budgetwise/packages/usecases/src/index.ts:1) may show 0% (re-exports only) — this is normal.
- If API tests fail resolving schemas or due to auth, run packages individually (Domain/Usecases) for coverage.

---

## What Each Layer Tests

- Domain (unit, zero dependencies)
  - Entities and invariants only.
  - Tests:
    - [`budget.test.ts`](budgetwise/packages/domain/src/budget.test.ts:1)
    - [`category.test.ts`](budgetwise/packages/domain/src/category.test.ts:1)
    - [`transaction.test.ts`](budgetwise/packages/domain/src/transaction.test.ts:1)
    - [`user.test.ts`](budgetwise/packages/domain/src/user.test.ts:1)
  - Targets in code:
    - [`Budget`](budgetwise/packages/domain/src/budget.ts:22)
      - [`Budget.shouldAlert()`](budgetwise/packages/domain/src/budget.ts:71)
      - [`Budget.isActive()`](budgetwise/packages/domain/src/budget.ts:64)
      - [`Budget.amount`](budgetwise/packages/domain/src/budget.ts:52)
    - [`Category`](budgetwise/packages/domain/src/category.ts:16)
    - [`Transaction`](budgetwise/packages/domain/src/transaction.ts:12)
    - [`User`](budgetwise/packages/domain/src/user.ts:10)

- Usecases (application behavior, in-memory adapters)
  - CRUD flows, guards, aggregations.
  - Tests (examples):
    - Categories: [`create-category.test.ts`](budgetwise/packages/usecases/src/categories/create-category.test.ts:1), [`category-edge-cases.test.ts`](budgetwise/packages/usecases/src/categories/category-edge-cases.test.ts:1)
    - Budgets: [`create-budget.test.ts`](budgetwise/packages/usecases/src/budgets/create-budget.test.ts:1), [`budget-edge-cases.test.ts`](budgetwise/packages/usecases/src/budgets/budget-edge-cases.test.ts:1), [`get-budget-dashboard.test.ts`](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.test.ts:1)
    - Focused additions: [`list-budgets.test.ts`](budgetwise/packages/usecases/src/budgets/list-budgets.test.ts:1), [`delete-budget.test.ts`](budgetwise/packages/usecases/src/budgets/delete-budget.test.ts:1), [`update-budget.test.ts`](budgetwise/packages/usecases/src/budgets/update-budget.test.ts:1)
  - Core usecases:
    - [`create-budget.ts`](budgetwise/packages/usecases/src/budgets/create-budget.ts:1)
    - [`list-budgets.ts`](budgetwise/packages/usecases/src/budgets/list-budgets.ts:1)
    - [`update-budget.ts`](budgetwise/packages/usecases/src/budgets/update-budget.ts:1)
    - [`delete-budget.ts`](budgetwise/packages/usecases/src/budgets/delete-budget.ts:1)
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

## Commands (Cheat Sheet)

```bash
# Run all tests
pnpm test

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
