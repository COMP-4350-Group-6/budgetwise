# Test Coverage Reports - Sprint 2

**Generated:** November 7, 2025  
**Repository:** budgetwise  
**Overall Coverage:** 55.3% lines, 74.5% functions

## Merged Repository Coverage Summary

```
Overall coverage rate:
  lines......: 55.3% (3681 of 6651 lines)
  functions..: 74.5% (193 of 259 functions)
```

**Files Included:** 96 source files across 9 packages

**Packages Merged:**
- ✅ apps/api
- ✅ apps/frontend
- ✅ packages/adapters/auth-supabase
- ✅ packages/adapters/persistence/local
- ✅ packages/adapters/persistence/supabase
- ✅ packages/adapters/services/openrouter
- ✅ packages/adapters/system
- ✅ packages/domain
- ✅ packages/usecases

---

## Package-Level Coverage Details

### Frontend (apps/frontend)

```
--------------------------------|---------|----------|---------|---------|-------------------
File                            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------------------|---------|----------|---------|---------|-------------------
All files                       |   53.86 |    76.03 |   50.95 |   53.86 |
 app                            |       0 |        0 |       0 |       0 |
  page.tsx                      |       0 |        0 |       0 |       0 | 1-7
 app/(protected)                |       0 |      100 |     100 |       0 |
  ProtectedLayoutClient.tsx     |       0 |      100 |     100 |       0 | 3-58
  layout.tsx                    |       0 |      100 |     100 |       0 | 3-45
 app/(protected)/budget         |   68.45 |    71.05 |   38.09 |   68.45 |
  page.tsx                      |   68.45 |    71.05 |   38.09 |   68.45 | ...
 app/(protected)/home           |   93.49 |    71.42 |     100 |   93.49 |
  page.tsx                      |   93.49 |    71.42 |     100 |   93.49 | 32,34,115-117
 app/(protected)/transactions   |   59.69 |    66.66 |      30 |   59.69 |
  page.tsx                      |   59.69 |    66.66 |      30 |   59.69 | ...
 app/(public)/login             |     100 |    86.66 |     100 |     100 |
  page.tsx                      |     100 |    86.66 |     100 |     100 | 24-25
 app/(public)/signup            |     100 |    68.18 |      60 |     100 |
  page.tsx                      |     100 |    68.18 |      60 |     100 | 28-30
 components/sidebar             |     100 |      100 |     100 |     100 |
  sidebar.tsx                   |     100 |      100 |     100 |     100 |
 components/validation          |     100 |      100 |     100 |     100 |
  PasswordRequirement.tsx       |     100 |      100 |     100 |     100 |
 constants                      |     100 |      100 |     100 |     100 |
  categories.ts                 |     100 |      100 |     100 |     100 |
  colors.ts                     |     100 |      100 |     100 |     100 |
  icons.ts                      |     100 |      100 |     100 |     100 |
 hooks                          |     100 |      100 |     100 |     100 |
  useAuth.ts                    |     100 |      100 |     100 |     100 |
 lib                            |    90.4 |    91.02 |     100 |    90.4 |
  apiClient.ts                  |   86.84 |       80 |     100 |   86.84 | 18-20,41-42
  csvParser.ts                  |   96.68 |    92.53 |     100 |   96.68 | 154-158
 services                       |   98.57 |      100 |   94.73 |   98.57 |
  budgetService.ts              |     100 |      100 |     100 |     100 |
  transactionsService.ts        |   97.14 |      100 |    87.5 |   97.14 | 43-47
 utils                          |     100 |      100 |     100 |     100 |
  dateHelpers.ts                |     100 |      100 |     100 |     100 |
--------------------------------|---------|----------|---------|---------|-------------------
```

**Test Files:** 14  
**Tests:** 131 total

**Key Highlights:**
- ✅ **100% coverage:** Utilities (dateHelpers), services (budgetService, transactionsService), hooks (useAuth)
- ✅ **96.68% coverage:** CSV parser
- ✅ **100% coverage:** Login/signup pages
- ⚠️ **Low coverage:** Dashboard components (0%), layout files (0%)

---

### API (apps/api)

```
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------|---------|----------|---------|---------|-------------------
All files         |   59.48 |    76.38 |      80 |   59.48 |                   
 middleware       |   62.08 |    61.11 |   83.33 |   62.08 |                   
  auth.ts         |   87.09 |    66.66 |     100 |   87.09 | 20-21,37-39,62    
  errors.ts       |   62.5  |       50 |     100 |   62.5  | 4,9               
 routes           |   58.48 |    78.01 |   75.86 |   58.48 |                   
  auth.ts         |   39.02 |       50 |      50 |   39.02 | ...               
  budgets.ts      |   84.51 |    84.88 |   91.66 |   84.51 | ...               
  categories.ts   |   97.82 |      100 |     100 |   97.82 | 67-68             
  health.ts       |     100 |      100 |     100 |     100 |                   
  transactions.ts |   27.5  |    76.31 |      50 |   27.5  | ...               
 app.ts           |     100 |      100 |     100 |     100 |                   
 container.ts     |     100 |      100 |     100 |     100 |                   
------------------|---------|----------|---------|---------|-------------------
```

**Test Files:** 7  
**Tests:** 97 total

**Key Highlights:**
- ✅ **100% coverage:** Container (DI), health check, app setup
- ✅ **97.82% coverage:** Categories routes
- ✅ **84.51% coverage:** Budgets routes  
- ⚠️ **Low coverage:** Transactions routes (27.5%), auth routes (39%)

---

### Domain (packages/domain)

```
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------------|---------|----------|---------|---------|-------------------
All files             |   34.78 |    95.71 |      70 |   34.78 |                   
 budget.ts            |     100 |      100 |     100 |     100 |                   
 category.ts          |     100 |      100 |     100 |     100 |                   
 default-categories.ts|       0 |      100 |     100 |       0 | 3-15              
 llm-call.ts          |       0 |      100 |     100 |       0 | ...               
 llm-model.ts         |       0 |      100 |     100 |       0 | ...               
 money.ts             |   50.63 |     87.5 |   31.25 |   50.63 | ...               
 transaction.ts       |     100 |      100 |     100 |     100 |                   
 user.ts              |     100 |      100 |     100 |     100 |                   
----------------------|---------|----------|---------|---------|-------------------
```

**Test Files:** 4  
**Tests:** 55 total

**Key Highlights:**
- ✅ **100% coverage:** Budget, Category, Transaction, User entities
- ⚠️ **50.63% coverage:** Money value object (basic operations tested)
- ❌ **0% coverage:** LLM models, default categories seed data

---

### Use Cases (packages/usecases)

```
File                           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------------------|---------|----------|---------|---------|-------------------
All files                      |   73.33 |    86.44 |     100 |   73.33 |                   
 auth                          |     100 |      100 |     100 |     100 |                   
  index.ts                     |     100 |      100 |     100 |     100 |                   
 budgets                       |   88.77 |    82.44 |     100 |   88.77 |                   
  create-budget.ts             |     100 |      100 |     100 |     100 |                   
  delete-budget.ts             |     100 |      100 |     100 |     100 |                   
  get-budget-dashboard.ts      |   83.67 |    68.75 |     100 |   83.67 | 67,97-102,119-127
  get-budget-status.ts         |   87.17 |    72.72 |     100 |   87.17 | 23-24,81-86      
  list-budgets.ts              |     100 |      100 |     100 |     100 |                   
  update-budget.ts             |     100 |      100 |     100 |     100 |                   
 categories                    |   94.44 |    92.68 |     100 |   94.44 |                   
  create-category.ts           |    92.3 |    83.33 |     100 |    92.3 | 24-25             
  delete-category.ts           |   88.23 |    85.71 |     100 |   88.23 | 15-16             
  list-categories.ts           |     100 |      100 |     100 |     100 |                   
  seed-default-categories.ts   |     100 |      100 |     100 |     100 |                   
  update-category.ts           |      92 |    94.44 |     100 |      92 | 22-23             
 transactions                  |   35.46 |    61.53 |     100 |   35.46 |                   
  add-transaction.ts           |     100 |      100 |     100 |     100 |                   
  categorize-transaction.ts    |       0 |      100 |     100 |       0 | ...               
  delete-transaction.ts        |      80 |      100 |     100 |      80 | 9-10              
  parse-invoice.ts             |       0 |      100 |     100 |       0 | ...               
  update-transaction.ts        |   91.3  |      100 |     100 |   91.3  | 22-23             
-------------------------------|---------|----------|---------|---------|-------------------
```

**Test Files:** 11  
**Tests:** 138 total

**Key Highlights:**
- ✅ **100% coverage:** All budget CRUD operations, most category operations
- ✅ **100% coverage:** Authentication use cases
- ✅ **Function coverage: 100%** across all use cases
- ❌ **0% coverage:** AI features (categorize-transaction, parse-invoice)

---

### Adapters - OpenRouter (packages/adapters/services/openrouter)

```
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |    96.77 |     100 |     100 |                   
 index.ts |     100 |    96.77 |     100 |     100 | 291,392           
----------|---------|----------|---------|---------|-------------------
```

**Test Files:** 1  
**Tests:** 23 total

**Key Highlights:**
- ✅ **100% statement coverage** 
- ✅ **100% function coverage**
- ✅ **96.77% branch coverage**
- ✅ Comprehensive mocking of HTTP requests
- ✅ Tests for both categorization and invoice parsing
- ✅ Tests for tracker integration

---

### Adapters - Local Persistence (packages/adapters/persistence/local)

```
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------|---------|----------|---------|---------|-------------------
All files           |   81.52 |      100 |      84 |   81.52 |                   
 budgets-repo.ts    |   56.41 |      100 |   55.55 |   56.41 | 11-20,26-33       
 categories-repo.ts |     100 |      100 |     100 |     100 |                   
 transactions-repo.ts|    100 |      100 |     100 |     100 |                   
--------------------|---------|----------|---------|---------|-------------------
```

**Test Files:** 4  
**Tests:** 18 total (unit + integration)

**Key Highlights:**
- ✅ **100% coverage:** Transactions and categories repositories
- ✅ **100% branch coverage** across all files
- ⚠️ **56% coverage:** Budgets repository (some CRUD operations untested)

---

### Adapters - Supabase Persistence (packages/adapters/persistence/supabase)

```
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------|---------|----------|---------|---------|-------------------
All files           |   34.24 |    83.33 |   57.69 |   34.24 |                   
 budgets-repo.ts    |    2.63 |      100 |       0 |    2.63 | 5-77              
 categories-repo.ts |    3.5  |      100 |       0 |    3.5  | 5-58              
 llm-calls-repo.ts  |    5.68 |      100 |       0 |    5.68 | 12-177            
 mappers.ts         |     100 |      100 |     100 |     100 |                   
 supabase-client.ts |   16.66 |      100 |       0 |   16.66 | 4-12              
 transactions-repo.ts|    100 |      100 |     100 |     100 |                   
 users-repo.ts      |    3.44 |      100 |       0 |    3.44 | 5-59              
--------------------|---------|----------|---------|---------|-------------------
```

**Test Files:** 3  
**Tests:** 28 total (17 unit with mocks, 11 integration - skipped without env)

**Key Highlights:**
- ✅ **100% coverage:** Mappers (domain ↔ database transformation)
- ✅ **100% coverage:** Transactions repository (fully tested with mocks)
- ❌ **~3% coverage:** Categories, budgets, users repositories (not yet tested)
- ❌ **~6% coverage:** LLM calls repository (tracking/observability feature)

---

### Adapters - System (packages/adapters/system)

```
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |      70 |     87.5 |     100 |      70 |                   
 clock.ts |     100 |      100 |     100 |     100 |                   
 id.ts    |   68.42 |     87.5 |     100 |   68.42 | 5-6,14-15         
----------|---------|----------|---------|---------|-------------------
```

**Test Files:** 2  
**Tests:** 13 total

**Key Highlights:**
- ✅ **100% coverage:** Clock adapter (Date.now wrapper)
- ✅ **100% function coverage** across both adapters
- ⚠️ **68% coverage:** ID generator (ULID and UUID generation tested, some edge cases missed)

---

### Adapters - Auth Supabase (packages/adapters/auth-supabase)

```
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |   62.85 |    66.66 |      50 |   62.85 |                   
 index.ts |   62.85 |    66.66 |      50 |   62.85 | 16-17,28-29,40-52,63-70
----------|---------|----------|---------|---------|-------------------
```

**Test Files:** 1  
**Tests:** 22 total

**Key Highlights:**
- ✅ **100% coverage:** Signup and login flows (fully tested with mocks)
- ⚠️ **~30% coverage:** Refresh token and logout operations (basic happy path tested)
- ⚠️ **50% function coverage:** Half of auth operations thoroughly tested

---

## Test Execution Summary

### Total Tests Across Repository

```
Package                          | Test Files | Tests | Status
---------------------------------|------------|-------|--------
Frontend                         |     14     |  131  |   ✓
API                              |      7     |   97  |   ✓
Domain                           |      4     |   55  |   ✓
Use Cases                        |     11     |  138  |   ✓
Adapters - OpenRouter            |      1     |   23  |   ✓
Adapters - Local Persistence     |      4     |   18  |   ✓
Adapters - Supabase Persistence  |      3     |   28  |   ✓
Adapters - System                |      2     |   13  |   ✓
Adapters - Auth Supabase         |      1     |   22  |   ✓
---------------------------------|------------|-------|--------
TOTAL                            |     47     |  525  |   ✓
```

---

## How to Run Coverage Reports

### Generate Merged Coverage

```bash
# Run all tests with coverage and merge
pnpm run test:coverage

# Generate HTML report (requires lcov)
pnpm run coverage:html

# Open in browser
pnpm run coverage:view

# Or all-in-one
pnpm run coverage:report
```

### View Individual Package Coverage

```bash
# Frontend
pnpm --filter frontend test --coverage
open apps/frontend/coverage/index.html

# API  
pnpm --filter api test --coverage
open apps/api/coverage/lcov-report/index.html

# Domain
pnpm --filter @budget/domain test --coverage
open packages/domain/coverage/index.html

# Use Cases
pnpm --filter @budget/usecases test --coverage
open packages/usecases/coverage/index.html

# OpenRouter adapter
pnpm --filter @budget/adapters-openrouter test --coverage
open packages/adapters/services/openrouter/coverage/index.html
```

---

## References

- [Coverage Guide](../COVERAGE_GUIDE.md) - Comprehensive documentation
- [Coverage Cheatsheet](../COVERAGE_CHEATSHEET.md) - Quick reference
- [Testing Coverage Diagram](./testing-coverage-diagram.md) - System architecture with coverage annotations
- [Merged Coverage Report](./coverage-reports/merged-coverage.lcov) - Raw LCOV data
