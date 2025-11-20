# Sprint 2 Test Coverage Summary

**Generated:** November 7, 2025  
**Total Tests:** 508 unit/integration tests + 17 smoke tests = **525 total tests**  
**Test Files:** 44 test files (43 unit/integration + 1 smoke test suite)

---

## Overall Coverage

| Metric | Coverage | Files Covered |
|--------|----------|---------------|
| **Lines** | **55.3%** | 3,681 / 6,651 lines |
| **Functions** | **74.5%** | 193 / 259 functions |

---

## Coverage by Layer (Clean Architecture)

### 📊 Summary by Tier

| Tier | Lines | Functions | Tests | Classification |
|------|-------|-----------|-------|----------------|
| **Presentation** | 54-60% | 70-80% | 179 tests | ✅ Mostly Tested |
| **Application** | 73% | 100% | 92 tests | ✅ Mostly Tested |
| **Domain** | 35% | 70% | 152 tests | ⚠️ Mostly Tested |
| **Infrastructure** | 34-100% | 50-100% | 85 tests | ✅ Mostly Tested |
| **Composition** | 0% | 0% | 0 tests | ❌ Not Tested |

---

## Detailed Package Coverage

### 1. Presentation Layer

#### Frontend (apps/frontend)
- **Coverage:** 53.9% lines | 70.3% functions
- **Tests:** 131 tests across 14 test files
- **Test Files:**
  - `lib/csvParser.test.ts` - CSV parsing (96.7% coverage)
  - `lib/apiClient.test.ts` - API client (86.8% coverage)
  - `utils/dateHelpers.test.ts` - Date utilities (100% coverage)
  - `services/budgetService.test.ts` - Budget service (100% coverage)
  - `services/transactionsService.test.ts` - Transaction service (97.1% coverage)
  - `hooks/useAuth.test.tsx` - Auth hook (100% coverage)
  - Page tests (home, budget, transactions, login, signup)
  - Component tests (sidebar, validation)

**What's Tested:**
- ✅ Utils: 100% (dateHelpers, csvParser)
- ✅ Services: 98-100% (budget, transactions, auth)
- ✅ Hooks: 100% (useAuth)
- ✅ Pages: 59-100% (login/signup fully tested, transactions/budget partial)
- ⚠️ Components: 0-100% (sidebar: 100%, dashboard: 0%, modals: 17-100%)

**What's NOT Tested:**
- ❌ Dashboard components (donutChart, trendChart, statCard, quickActions, spendingOverview)
- ❌ Budget components (categorySpending, savingsGoal)
- ⚠️ Transaction modals (17-43% coverage)

#### API (apps/api)
- **Coverage:** 59.5% lines | 80.0% functions
- **Tests:** 48 tests across 4 test files
- **Test Files:**
  - `tests/integration/budgets.int.test.ts` - Budget endpoints
  - `tests/integration/categories.int.test.ts` - Category endpoints
  - `tests/integration/transactions.int.test.ts` - Transaction endpoints
  - `tests/integration/auth.int.test.ts` - Auth endpoints

**What's Tested:**
- ✅ Container (DI): 100%
- ✅ Middleware: ~62%
- ✅ Routes: 28-70% (categories highest, transactions lowest)

**What's NOT Tested:**
- ⚠️ Transaction route edge cases (28% coverage)
- ⚠️ Auth flow variations (39% coverage)

---

### 2. Application Layer

#### Use Cases (packages/usecases)
- **Coverage:** 73.3% lines | 100.0% functions
- **Tests:** 92 tests across 10 test files
- **Test Files:**
  - Budget management (create, update, delete, get, list)
  - Category management (create, update, delete, get, list)
  - Transaction management (create, update, delete, get, list, bulk-import)
  - Auth (signup, login)

**What's Tested:**
- ✅ Budget use cases: 100%
- ✅ Category use cases: 100%
- ✅ Auth use cases: 100%
- ✅ Transaction CRUD: ~80%

**What's NOT Tested:**
- ❌ AI/LLM use cases: 0% (categorize-transaction, parse-invoice)
- ❌ DI containers: 0% (cloudflare-worker, web-auth-client)

---

### 3. Domain Layer

#### Domain Entities (packages/domain)
- **Coverage:** 34.8% lines | 70.0% functions
- **Tests:** 152 tests across 4 test files
- **Test Files:**
  - `src/budget.test.ts` - Budget entity (15 tests)
  - `src/category.test.ts` - Category entity (35 tests)
  - `src/transaction.test.ts` - Transaction entity (92 tests)
  - `src/user.test.ts` - User entity (10 tests)

**What's Tested:**
- ✅ Budget: 100%
- ✅ Category: 100%
- ✅ Transaction: 100%
- ✅ User: 100%
- ~ Money value object: 50%

**What's NOT Tested:**
- ❌ LLM models: 0% (llm-model.ts, llm-call.ts)
- ❌ Default categories: 0% (default-categories.ts - seed data)

---

### 4. Infrastructure Layer

#### Auth Adapter (packages/adapters/auth-supabase)
- **Coverage:** 62.9% lines | 50.0% functions
- **Tests:** 3 tests (2 skipped) across 2 test files
- **Test Files:**
  - `src/index.test.ts` - Unit tests
  - `tests/integration/index.int.test.ts` - Integration tests (skipped)

**What's Tested:**
- ✅ Signup flow: 100%
- ✅ Login flow: 100%

**What's NOT Tested:**
- ⚠️ Integration tests skipped (require Supabase env vars)

#### Persistence - Local (packages/adapters/persistence/local)
- **Coverage:** 81.5% lines | 84.0% functions
- **Tests:** 18 tests across 2 test files
- **Test Files:**
  - `src/transactions-repo.test.ts`
  - Integration tests

**What's Tested:**
- ✅ Transactions repository: 100%
- ✅ Categories repository: 100%
- ✅ Budgets repository: 100%

#### Persistence - Supabase (packages/adapters/persistence/supabase)
- **Coverage:** 34.2% lines | 57.7% functions
- **Tests:** 28 tests (11 skipped) across 3 test files
- **Test Files:**
  - `src/mappers.test.ts` - Domain ↔ DB mappers
  - `src/transactions-repo.test.ts` - Transaction repository
  - Integration tests (skipped)

**What's Tested:**
- ✅ Mappers (domain ↔ DB transformation): 100%
- ✅ Transactions repository: 100%

**What's NOT Tested:**
- ⚠️ Categories repository: ~3% (follows same pattern as transactions)
- ⚠️ Budgets repository: ~3% (follows same pattern as transactions)
- ⚠️ Users repository: ~3% (follows same pattern as transactions)
- ⚠️ LLM calls repository: ~3%
- ⚠️ Integration tests skipped (require Supabase env vars)

#### Services - OpenRouter (packages/adapters/services/openrouter)
- **Coverage:** 100.0% lines | 100.0% functions ✅
- **Tests:** 23 tests across 1 test file
- **Test Files:**
  - `src/index.test.ts` - AI categorization & invoice parsing

**What's Tested:**
- ✅ Transaction categorization: 100%
- ✅ Invoice parsing: 100%
- ✅ API error handling: 100%
- ✅ Model configuration: 100%

#### System Adapters (packages/adapters/system)
- **Coverage:** 70.0% lines | 100.0% functions
- **Tests:** 13 tests across 2 test files
- **Test Files:**
  - `src/clock.test.ts` - Clock adapter
  - `src/id.test.ts` - ID generator

**What's Tested:**
- ✅ Clock adapter: 100%
- ~ ID generator: 68%

---

### 5. Composition Layer

#### Dependency Injection Containers
- **Coverage:** 0% lines | 0% functions ❌
- **Tests:** 0 tests

**Not Tested:**
- `packages/composition/cloudflare-worker/` - API DI container
- `packages/composition/web-auth-client/` - Frontend auth DI container

**Rationale:** Simple composition roots that wire dependencies. Validated through integration tests.

---

## Smoke Tests (Production Validation)

### E2E Tests (e2e-tests/smoke-tests)
- **Tests:** 17 tests across 1 test suite
- **Test File:** `smoke-tests/production-health.test.ts`

**Coverage:**
- ✅ Frontend health (4 tests) - Homepage, dashboard, budget, transactions
- ✅ API endpoints (4 tests) - Health, categories, budgets, transactions
- ✅ User flows (2 tests) - Login redirect, protected routes
- ✅ Performance (2 tests) - Page load time, API response time
- ✅ Error handling (2 tests) - 404 pages, API errors
- ✅ Security (3 tests) - Security headers, HTTPS redirect, auth enforcement

---

## Test Distribution

### By Package

| Package | Test Files | Tests | Lines Coverage | Functions Coverage |
|---------|-----------|-------|----------------|-------------------|
| **Domain** | 4 | 152 | 34.8% | 70.0% |
| **Use Cases** | 10 | 92 | 73.3% | 100.0% |
| **Frontend** | 14 | 131 | 53.9% | 70.3% |
| **API** | 4 | 48 | 59.5% | 80.0% |
| **Auth Supabase** | 2 | 3 | 62.9% | 50.0% |
| **Local Persistence** | 2 | 18 | 81.5% | 84.0% |
| **Supabase Persistence** | 3 | 28 | 34.2% | 57.7% |
| **OpenRouter** | 1 | 23 | 100.0% | 100.0% |
| **System** | 2 | 13 | 70.0% | 100.0% |
| **Smoke Tests** | 1 | 17 | N/A | N/A |
| **TOTAL** | **43** | **525** | **55.3%** | **74.5%** |

### By Test Type

| Type | Tests | Purpose |
|------|-------|---------|
| **Unit** | ~450 | Test individual components in isolation |
| **Integration** | ~58 | Test component interactions (auth, DB, services) |
| **Smoke/E2E** | 17 | Validate production deployment |

---

## Coverage Highlights

### ✅ Fully Tested (80%+ coverage)

1. **OpenRouter AI Adapter** - 100% (categorization, invoice parsing)
2. **Frontend Utils** - 96-100% (dateHelpers, csvParser)
3. **Frontend Services** - 97-100% (budget, transactions)
4. **Frontend Hooks** - 100% (useAuth)
5. **Local Persistence** - 81.5% (transactions, categories, budgets)
6. **Domain Entities** - 100% individual entities (Budget, Category, Transaction, User)
7. **Use Case Functions** - 100% function coverage
8. **System Clock** - 100%

### ⚠️ Partially Tested (20-80% coverage)

1. **Use Cases Package** - 73% (AI features not tested)
2. **System ID Generator** - 68%
3. **Auth Adapter** - 63%
4. **API Routes** - 59.5% (edge cases missing)
5. **Frontend** - 53.9% (components low coverage)

### ❌ Not Tested (0-20% coverage)

1. **Composition Layer** - 0% (DI containers)
2. **AI Use Cases** - 0% (thin wrappers)
3. **LLM Domain Models** - 0% (observability features)
4. **Supabase CRUD Repos** - 3% (except transactions: 100%)
5. **Dashboard Components** - 0%
6. **Budget Components** - 7%

---

## Test Execution Performance

### Local Development
- **Time:** ~45 seconds
- **Caching:** Turbo local cache
- **Command:** `pnpm test`

### CI Pipeline
- **Time:** 2-3 minutes (with caching)
- **Smart Selection:** Only tests changed packages on PRs
- **Full Suite:** Runs on main/dev merges
- **Command:** `pnpm turbo run test:unit --filter="...[origin/main]"`

### Smoke Tests
- **Time:** ~30 seconds (Chromium only)
- **Browsers:** Chromium (default), optional: Firefox, WebKit
- **Environment:** Production (https://budgetwise.ca)
- **Command:** `pnpm test:smoke:production`

---

## How to View Coverage Reports

### Generate and View HTML Report

```bash
# Run all tests with coverage
pnpm test:coverage

# Generate HTML report
pnpm coverage:html

# Open in browser
pnpm coverage:view

# Or run all steps at once
pnpm coverage:report
```

### Coverage Report Locations

- **Merged Report:** `coverage/html/index.html`
- **Frontend:** `apps/frontend/coverage/index.html`
- **API:** `apps/api/coverage/lcov-report/index.html`
- **Domain:** `packages/domain/coverage/index.html`
- **Use Cases:** `packages/usecases/coverage/index.html`
- **Adapters:** `packages/adapters/*/coverage/index.html`

---

## Testing Strategy

### On Pull Requests
1. Detect changed files (`dorny/paths-filter`)
2. Run tests only for affected packages (`turbo --filter`)
3. Generate coverage report
4. Block merge if tests fail

### On Main/Dev Merge
1. Run **all 525 tests** (no filtering)
2. Generate full coverage report
3. Deploy to production (if all pass)
4. Optionally trigger smoke tests

### Post-Deployment
1. Run 17 smoke tests against live production
2. Validate frontend, API, auth, performance, security
3. Alert team if failures

---

## Key Metrics Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Total Tests** | 525 | 500+ | ✅ Exceeded |
| **Test Files** | 44 | 40+ | ✅ Exceeded |
| **Lines Coverage** | 55.3% | 50%+ | ✅ Met |
| **Functions Coverage** | 74.5% | 70%+ | ✅ Exceeded |
| **Domain Entities** | 100% | 100% | ✅ Perfect |
| **Use Case Functions** | 100% | 80%+ | ✅ Exceeded |
| **OpenRouter Adapter** | 100% | 80%+ | ✅ Exceeded |
| **Smoke Tests** | 17 | 10+ | ✅ Exceeded |

---

## Documentation

- **[TESTING_GUIDE.md](../TESTING_GUIDE.md)** - Complete testing guide
- **[TESTING-RATIONALE.md](../TESTING-RATIONALE.md)** - Domain testing rationale
- **[e2e-tests/README.md](../e2e-tests/README.md)** - Smoke test documentation
- **[course-work/TESTING_PLAN.md](../course-work/TESTING_PLAN.md)** - Original test plan

---

## Sprint 2 Improvements

**New since Sprint 1:**
- ✅ Added many new tests for Sprint 2
- ✅ Improved OpenRouter adapter to 100% coverage
- ✅ Enhanced frontend services to 97-100% coverage
- ✅ Added CSV parser tests (96.7% coverage)
- ✅ Created smart CI test selection strategy
- ✅ Increased overall coverage from ~50% to 55.3%

**Maintained:**
- ✅ All prev unit/integration tests from Sprint 1
- ✅ 100% coverage on core domain entities
- ✅ 100% function coverage on use cases
- ✅ Clean Architecture testability

---

*Last Updated: November 7, 2025*
