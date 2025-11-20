# Critical Regression Tests (Smoke Tests) Snapshot

**Last Updated:** 2025-11-07  
**Command:** `pnpm test:critical`

## Overview

Critical regression tests are a prioritized subset of tests tagged with `@critical` that cover high-impact, high-risk core functionality. These tests serve as fast smoke checks (< 2 seconds) for deployment validation and PR gates.

## Test Results

### Summary
- **Status:** ✅ All tests passing
- **Test Files:** 4 passed (4)
- **Tests:** 8 passed | 40 skipped (48 total)
- **Duration:** ~1.20s (transform 483ms, collect 2.26s, tests 64ms)

### Test Breakdown

#### Auth Middleware (`src/middleware/auth.test.ts`)
- ✅ `@critical allows request when token is valid` - **PASSED**
- ⏭️ 2 tests skipped (non-critical)

#### Budgets API (`src/routes/budgets.test.ts`)
- ✅ `@critical should create a budget with valid data` - **PASSED**
- ✅ `@critical should list all budgets for user` - **PASSED**
- ✅ `@critical should return dashboard data` - **PASSED**
- ✅ `@critical should update budget amount` - **PASSED**
- ⏭️ 14 tests skipped (non-critical)

#### Categories API (`src/routes/categories.test.ts`)
- ✅ `@critical should create a category with minimal data` - **PASSED**
- ✅ `@critical should list all categories` - **PASSED**
- ⏭️ 24 tests skipped (non-critical)

#### Transaction Integration (`tests/integration/transactions.int.test.ts`)
- ✅ `@critical should reflect added transaction in dashboard totals` - **PASSED**
  - Validates full flow: Category → Budget → Transaction → Dashboard aggregation

## Coverage Areas

These 8 critical tests validate:

1. **Authentication** - Token validation middleware
2. **Budget CRUD** - Create, list, update operations
3. **Dashboard Aggregation** - Budget totals and spending calculations
4. **Category Management** - Create and list operations
5. **Transaction Flow** - End-to-end transaction creation and dashboard reflection

## Usage

```bash
# Run critical smoke tests
pnpm test:critical

# Or from API package directly
cd apps/api
pnpm test:critical
```

## When to Run

- ✅ After every deployment (smoke testing)
- ✅ On every PR (fast feedback loop)
- ✅ Before releases as a gate check
- ✅ When time-constrained and full suite is expensive

## Notes

- Tests use in-memory repositories (no Supabase dependency required)
- All critical tests complete in under 2 seconds
- Non-critical tests are automatically skipped when running `test:critical`
- Test isolation: Each test resets the container state via `container.reset()`

---

*This snapshot reflects the current state of critical regression tests. Update this file after significant changes to the critical test suite.*

