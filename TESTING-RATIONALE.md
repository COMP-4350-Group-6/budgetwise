# Testing Rationale: Budgets and Categories

This guide explains why we test specific behaviors and how we structure those tests to validate domain rules, usecases, and cross-cutting flows. It complements the how-to in [TESTING.md](budgetwise/TESTING.md).

## Principles and Strategy

- Domain-first invariants
  - Enforce core business rules at creation time so invalid state cannot exist. We validate these with focused unit tests tied to domain constructors, e.g. [Category](budgetwise/packages/domain/src/category.ts:16) and [Budget](budgetwise/packages/domain/src/budget.ts:22).
- Usecases as acceptance criteria
  - Usecases encode application behavior (CRUD, aggregations, guards). We design tests that reflect business scenarios (happy paths, boundaries, and negative cases), e.g. [create-category.ts](budgetwise/packages/usecases/src/categories/create-category.ts:14), [get-budget-status.ts](budgetwise/packages/usecases/src/budgets/get-budget-status.ts:15), [get-budget-dashboard.ts](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.ts:27).
- Integration to prove the flow
  - Verify that cross-component flows (Category → Budget → Transaction → Dashboard) work end-to-end with in-memory adapters and deterministic time, e.g. [category-budget-transaction.integration.test.ts](budgetwise/packages/usecases/src/integration/category-budget-transaction.integration.test.ts:1).
- Deterministic, fast, isolated
  - In-memory repos ([categories-repo.ts](budgetwise/packages/adapters/persistence/local/src/categories-repo.ts:1), [budgets-repo.ts](budgetwise/packages/adapters/persistence/local/src/budgets-repo.ts:1), [transactions-repo.ts](budgetwise/packages/adapters/persistence/local/src/transactions-repo.ts:4)), a fixed clock for period math, and ULIDs ensure stable, fast tests without external dependencies.

## Categories: What and Why We Test

1) Name validation (A–Z and spaces, no emoji/specials, non-empty, <= 50 chars)

- Why: Prevents invalid user inputs, ensures clean semantics across locales and UI.
- Where enforced: [Category](budgetwise/packages/domain/src/category.ts:16).
- Tests:
  - Reject Unicode/emoji/specials and spaces-only names
  - Accept min length (1), max length (50)
  - Accept optional fields (description/icon/color) and clearing them back to undefined
- Files: [category-edge-cases.test.ts](budgetwise/packages/usecases/src/categories/category-edge-cases.test.ts:1)

2) Duplicate name restriction (per user, case-insensitive)

- Why: Within a single user’s catalog, duplicates cause confusion. Across users, names can collide independently (multi-tenant).
- Where enforced: Duplicate check in [makeCreateCategory()](budgetwise/packages/usecases/src/categories/create-category.ts:23).
- Tests:
  - Same-user duplicate rejected
  - Different users can create same category name
- Files: [category-edge-cases.test.ts](budgetwise/packages/usecases/src/categories/category-edge-cases.test.ts:359)

3) Active/inactive toggling and list filters

- Why: Common lifecycle flows; lists must faithfully reflect active-only filtering.
- Tests:
  - Toggling state multiple times preserves expected state
  - listCategories(true) returns only active; listCategories(false) returns all
- Files: [category-edge-cases.test.ts](budgetwise/packages/usecases/src/categories/category-edge-cases.test.ts:186)

4) Sort order handling (negative, large, duplicates)

- Why: Ensure sort values can represent user-defined priorities without hidden coupling.
- Tests:
  - Accept negative and large values
  - Allow duplicates and preserve them
- Files: [category-edge-cases.test.ts](budgetwise/packages/usecases/src/categories/category-edge-cases.test.ts:239)

5) Default categories seeding (idempotent per user)

- Why: Avoid duplicate defaults, support multi-tenant isolation, and label defaults.
- Tests:
  - Seeding twice for same user does not change count
  - Different users get their own seeded sets
  - Seeded categories marked isDefault
- Files: [category-edge-cases.test.ts](budgetwise/packages/usecases/src/categories/category-edge-cases.test.ts:290)

6) Deletion constraints (no delete if budgets exist)

- Why: Protect referential integrity and UX expectations.
- Tests:
  - Deleting a category with active budgets is rejected
  - Deleting a category with no budgets succeeds
  - Non-existent category deletion yields error
- Files: [category-edge-cases.test.ts](budgetwise/packages/usecases/src/categories/category-edge-cases.test.ts:386)

7) High volume behavior

- Why: Ensure repositories and filtering are performant and stable under load.
- Tests:
  - Rapid creation of many categories
  - Efficient listing and accurate counts under mixed active states
- Files: [category-edge-cases.test.ts](budgetwise/packages/usecases/src/categories/category-edge-cases.test.ts:497)

Note on name uniqueness in high-volume tests

- The domain enforces no duplicates per user. We generate unique, letters-only two-letter names to satisfy domain constraints and still stress list/filters: see adjusted test in [category-edge-cases.test.ts](budgetwise/packages/usecases/src/categories/category-edge-cases.test.ts:511).

## Budgets: What and Why We Test

1) Amount boundaries and integrity

- Why: Guard correctness on extremes, avoid floating issues, and enforce integers.
- Where enforced: [Budget](budgetwise/packages/domain/src/budget.ts:22).
- Tests:
  - Accept zero and one-cent budgets
  - Accept very large integers near safe bounds
  - Disallow negative amounts
- Files: [create-budget.test.ts](budgetwise/packages/usecases/src/budgets/create-budget.test.ts:1), [budget-edge-cases.test.ts](budgetwise/packages/usecases/src/budgets/budget-edge-cases.test.ts:1)

2) Dates and periods

- Why: Period math underpins spend calculations and dashboards. We ensure robust behavior across time edges.
- Tests:
  - Far past/future start dates, same-day start/end, multi-year spans
  - All periods (DAILY/WEEKLY/MONTHLY/YEARLY) covered
- Period window logic: [calculatePeriodDates()](budgetwise/packages/usecases/src/budgets/get-budget-status.ts:66)
- Files: [budget-edge-cases.test.ts](budgetwise/packages/usecases/src/budgets/budget-edge-cases.test.ts:168), [create-budget.test.ts](budgetwise/packages/usecases/src/budgets/create-budget.test.ts:1)

3) Overspending and exact-limit spending

- Why: Users hit edges; ensure clean reports and no off-by-one surprises.
- Tests:
  - Exact to the penny at limit: not over
  - One cent over: over budget
  - Extreme overspend: still consistent and no overflow
- Files: [budget-edge-cases.test.ts](budgetwise/packages/usecases/src/budgets/budget-edge-cases.test.ts:348)

4) Updates under transactional history

- Why: Real-world budgets change; system must recompute derived status correctly.
- Tests:
  - Increase budget after transactions: percentage recalculates
  - Decrease budget below spent: becomes over budget
- Files: [budget-edge-cases.test.ts](budgetwise/packages/usecases/src/budgets/budget-edge-cases.test.ts:433)

5) Alert thresholds semantics (0%, 100%, boundary, zero-amount guard)

- Why: Alerts drive UX nudges; edge semantics must be precise.
- Where implemented: [Budget.shouldAlert()](budgetwise/packages/domain/src/budget.ts:71)
- Rationale and fixes:
  - 0% threshold means alert on any spend > 0 (but not when spent is 0)
  - >= boundary check (80% triggers at 80 exactly)
  - Zero-amount budget guard to avoid divide-by-zero artifacts
  - Constructor validation updated to allow 0 as valid threshold while enforcing [0..100]
- Files: [budget-edge-cases.test.ts](budgetwise/packages/usecases/src/budgets/budget-edge-cases.test.ts:83), [budget.ts](budgetwise/packages/domain/src/budget.ts:39)

6) Concurrency and aggregation stability

- Why: Batch imports or concurrent inputs must yield stable counts and sums.
- Tests:
  - Add 100 transactions concurrently and validate accumulated spend and count
- Files: [budget-edge-cases.test.ts](budgetwise/packages/usecases/src/budgets/budget-edge-cases.test.ts:500)

## Dashboard Aggregation: Why and How We Test

- Why: Users reason about Categories; category totals derive from the budgets under them. The dashboard proves correct aggregation of per-budget statuses.
- How:
  - For each active category, collect its active budgets and compute [BudgetStatus](budgetwise/packages/usecases/src/budgets/get-budget-status.ts:5) via [makeGetBudgetStatus()](budgetwise/packages/usecases/src/budgets/get-budget-status.ts:15)
  - Accumulate totals and flags into [CategoryBudgetSummary](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.ts:6)
- Tests:
  - Over-budget and alert counts bubble up
  - Multiple budgets under one category sum correctly
  - Only the requesting user’s budgets are included
- Files: [get-budget-dashboard.test.ts](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.test.ts:1), [get-budget-dashboard.ts](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.ts:27)

## Integration: Why We Prove the Full Flow

- Rationale: Unit and usecase tests validate pieces; a single integration establishes the user journey:
  - Create Category → Create Budget (in category) → Add Transaction (to budget) → Read Dashboard (category totals decrease)
- Files: [category-budget-transaction.integration.test.ts](budgetwise/packages/usecases/src/integration/category-budget-transaction.integration.test.ts:1)
- Determinism: Fixed clock (e.g., 2025-01-15) ensures transactions fall within the active period to make spending visible.

## API Tests: Why and How (Selective)

- Why: Ensure HTTP surfaces align with usecases and schemas, and typed test code stays strict.
- How:
  - Type-safe parsing helpers replace raw `res.json()` to avoid unknown typing and enforce API contracts (DTOs).
  - Categories tests are aligned with domain rules (A–Z and spaces only, max 50).
- Files: [budgets.test.ts](budgetwise/apps/api/src/routes/budgets.test.ts:1), [categories.test.ts](budgetwise/apps/api/src/routes/categories.test.ts:1)
- Integration (category → budget → transaction → dashboard): [transactions.int.test.ts](budgetwise/apps/api/src/routes/transactions.int.test.ts:1)
- Auth note: Categories/Budgets routes require JWT ([authMiddleware](budgetwise/apps/api/src/middleware/auth.ts:17)); configure a test JWT or bypass for local runs.

## Why Budget-Centric Transactions in Tests

- Budgets define periods, limits, and alert thresholds. Linking transactions to budgets yields unambiguous status and alerts.
- Categories aggregate budgets; category totals come from summing per-budget statuses. This is reflected in:
  - [Transaction](budgetwise/packages/domain/src/transaction.ts:12) → belongs to a budget
  - [makeGetBudgetStatus()](budgetwise/packages/usecases/src/budgets/get-budget-status.ts:15) → computes period spend and remaining for a budget
  - [makeGetBudgetDashboard()](budgetwise/packages/usecases/src/budgets/get-budget-dashboard.ts:27) → rolls per-budget status up to the category

This design is why our tests focus on:

- Proving per-budget correctness first
- Then verifying category-level aggregation

## Rationale for Specific Fixes and Adjustments

- Alert threshold (0% semantics and boundary):
  - Updated [Budget.shouldAlert()](budgetwise/packages/domain/src/budget.ts:71) and constructor threshold validation [0..100] acceptance ([budget.ts](budgetwise/packages/domain/src/budget.ts:39)) to satisfy edge-case tests and intuitive behavior.
- Category high-volume test naming:
  - Refactored to unique, letter-only names to honor duplicate-name rule per user while maintaining load aspects ([category-edge-cases.test.ts](budgetwise/packages/usecases/src/categories/category-edge-cases.test.ts:511)).
- API tests typing:
  - Introduced typed parsers/DTOs to remove unknowns and match strict TypeScript settings in [budgets.test.ts](budgetwise/apps/api/src/routes/budgets.test.ts:1) and [categories.test.ts](budgetwise/apps/api/src/routes/categories.test.ts:1).
  - Aligned API category tests to domain rules (reject Unicode/specials in name, accept emoji in icon).

## Future Enhancements to Testing

- Refunds/Credits semantics:
  - Current spend sums `Math.abs(amountCents)` ([get-budget-status.ts](budgetwise/packages/usecases/src/budgets/get-budget-status.ts:44)). If refunds should increase remaining, change to signed sum and add tests for negative amounts.
- Multi-budget overlap policy per category:
  - Tests to lock in the rule for how server assigns a budget when multiple budgets are active in a category on the same date (if a by-category transaction endpoint is added).
- Boundary-of-period tests:
  - Transactions near period edges (e.g., end of month) to confirm inclusion/exclusion rules in [calculatePeriodDates()](budgetwise/packages/usecases/src/budgets/get-budget-status.ts:66).
- Performance and load:
  - Stress tests for many budgets/transactions per category to validate aggregation performance.

## Summary

We test by enforcing strict domain invariants, proving usecase behavior through edge and negative cases, and demonstrating end-to-end flows with deterministic, in-memory integration. Alerts and spend logic are budget-centric; categories are derived aggregations. This approach yields precise status reporting, clear edge semantics, and maintainable tests that evolve with the domain model.
