# Sprint 2 Worksheet

Format: Markdown file in your repository. Include links to relevant code, scripts, reports, and diagrams.


## 1. Regression Testing

> [!IMPORTANT]
> ### Worksheet Question
>
> 1. [ ] Describe how you run regression testing:
>
>    - [ ] Which tests are executed?
>
>    - [ ] Which tool(s) are used?
>
> 2. [ ] Link to the regression testing script.
>
> 3. [ ] Include the latest snapshot of execution results.


## 2. Testing Slowdown

> [!IMPORTANT]
> ### Worksheet Question
>
> 1. [ ] Have you been able to keep all unit and integration tests from your test plan?
>
> 2. [ ] Have you created different test plans for different release types? Explain.


## 3. Not Testing

> [!IMPORTANT]
> ### Worksheet Question
>
> 1. [x] What parts of the system are not tested?
>
> 2. [x] Provide an updated system diagram.
>
> 3. [x] For each tier, indicate which layers are:
>    - [x] Fully tested (80%+)
>
>    - [x] Mostly tested (20–80%)
>
>    - [x] Somewhat tested (0–20%)
>
>    - [x] Not tested
>
> 5. [x] Include coverage reports for tested tiers.

### Answer

#### 1. What parts of the system are not tested?

The following components have **no test coverage (0%)**:

**Infrastructure Tier:**
- **Persistence Adapters:**
  - Local in-memory adapters (budgets, categories, transactions repositories)
  - Supabase adapters (budgets, categories, transactions, users, LLM calls repositories)
- **System Adapters:**
  - Clock adapter (system time provider)
  - ID generator adapter (ULID generation)
- **Services Adapters:**
  - All service layer implementations
- **Ports:**
  - Interface definitions (not tested as they're just TypeScript interfaces)
- **Schemas:**
  - Zod validation schemas (pure schema definitions)
- **Composition/Dependency Injection:**
  - Cloudflare Worker container
  - Web Auth Client container

**Presentation Tier:**
- **Frontend UI Components:**
  - Budget components (no test files)
  - Dashboard components (no test files)
  - Sidebar components (no test files)
  - Transaction components (excluding some that have tests)
  - Validation components (no test files)
- **E2E Tests:**
  - No end-to-end tests exist in the repository

**API Tier:**
- **Integration Tests:**
  - Currently failing due to environment configuration issues (Supabase JWT secret not being loaded)
  - Tests exist but are not passing in CI

**Low Coverage Areas (0-20%):**
- **Auth Adapters:** Only the Supabase auth adapter has tests (~76% coverage), but it represents a small portion of the overall adapter layer

#### 2. System Diagram

See the detailed system architecture diagram: [`sprint2-system-diagram.md`](./sprint2-system-diagram.md)

This diagram shows all four architectural tiers (Presentation, Application, Domain, Infrastructure) and their testing coverage status.

#### 3. Testing Coverage by Tier

##### **Presentation Tier**

**Frontend (Next.js):**
- **Coverage:** ~36% lines, 82% branches, 86% functions
- **Status:** Mostly Tested (20-80%)
- **What's tested:**
  - API client library (~91% lines)
  - Auth service
  - Some page components (home, transactions, budget pages)
  - Some hooks
- **What's not tested:**
  - Most UI components (budgets, dashboard, sidebar, validation)
  - Many route/page files

**API (Hono/Cloudflare Workers):**
- **Coverage:** Tests exist but currently failing due to env issues
- **Status:** Mostly Tested (20-80%)
- **What's tested:**
  - Route handlers (budgets, categories with unit tests)
  - Auth middleware (unit tests)
- **What's not tested:**
  - Integration tests failing in CI

##### **Application Tier**

**Use Cases:**
- **Coverage:** ~92% lines, 93% branches, 100% functions
- **Status:** ✅ **Fully Tested (80%+)**
- **Tests:** 90/90 passing
- **What's tested:**
  - Budget operations (create, update, list, delete, get-status, get-dashboard)
  - Category operations (create, edge cases)
  - Transaction operations
  - Auth operations
  - Integration tests (category-budget-transaction flow)
- **What's not tested:**
  - Edge cases for some newer features

##### **Domain Tier**

**Domain Models:**
- **Coverage:** ~71% lines, 95.5% branches, 68.4% functions
- **Status:** Mostly Tested (20-80%)
- **Tests:** 152/152 passing
- **What's tested:**
  - Budget entity & invariants
  - Category entity
  - Transaction entity
  - User entity
  - Money value object
- **What's not tested:**
  - Barrel export files (index.ts) - pure re-exports
  - Some helper utilities

**Note:** The domain tier has high branch coverage (95.5%) which is the most important metric for business logic. The lower line coverage is primarily due to barrel files (pure re-exports in `index.ts`) being included in coverage reports, as noted in the [TESTING.md](../TESTING.md) documentation.

##### **Infrastructure Tier**

**Ports (Interfaces):**
- **Coverage:** N/A (TypeScript interfaces)
- **Status:** Not Tested (interfaces don't need tests)

**Adapters:**
- **Auth (Supabase):**
  - **Coverage:** ~76% lines, 67% branches
  - **Status:** Mostly Tested (20-80%)
  - **Tests:** 5/5 passing (2 unit tests, 3 integration tests)
  - Includes login/logout integration tests with test credentials

- **Persistence (Local & Supabase):**
  - **Coverage:** 0%
  - **Status:** ❌ **Not Tested**
  - No unit or integration tests for repository implementations

- **System (Clock, ID):**
  - **Coverage:** 0%
  - **Status:** ❌ **Not Tested**
  - No tests for clock or ID generator adapters

- **Services:**
  - **Coverage:** 0%
  - **Status:** ❌ **Not Tested**

**Schemas (Zod):**
- **Coverage:** 0%
- **Status:** Not Tested (pure validation schemas)

**Composition (DI Containers):**
- **Coverage:** 0%
- **Status:** ❌ **Not Tested**
- No tests for dependency injection setup

#### 4. Coverage Reports

Coverage reports and screenshots are available in the [`../test-coverage/`](../test-coverage/) directory:

1. **Use Cases Coverage:** [`test-coverage/usecase.png`](../test-coverage/usecase.png)
   - 91.92% lines, 93% branches, 100% functions
   - All 90 tests passing

2. **Domain Coverage:** [`test-coverage/domain.png`](../test-coverage/domain.png)
   - 71.02% lines, 95.58% branches, 68.42% functions
   - All 152 tests passing

3. **Frontend Coverage:** [`test-coverage/frontend.png`](../test-coverage/frontend.png)
   - 35.9% lines, 82.41% branches, 86.2% functions
   - All 36 tests passing

4. **Auth Adapter Coverage:** [`test-coverage/auth-adapter-supabase.png`](../test-coverage/auth-adapter-supabase.png)
   - 75.71% lines, 66.66% branches
   - All 5 tests passing

5. **API Status:** [`test-coverage/api.png`](../test-coverage/api.png)
   - Tests failing due to environment configuration issues
   - Issue: Supabase JWT secret not being loaded in test environment

**Summary Report:** See [`test-coverage/test-summary.md`](../test-coverage/test-summary.md) for detailed analysis of all test results and known issues.


## 4. Profiler

> [!IMPORTANT]
> ### Worksheet Question
>
> 1. [ ] Run a profiler on your API while exercising every endpoint.
>
> 2. [ ] Identify:
>
>    - [ ] Which endpoint is the slowest.
>
>    - [ ] Whether the slowdown is fixable — and why/why not.
>
> 3. [ ] Include profiler output (linked or attached).


## 5. Last Dash

> [!IMPORTANT]
> ### Worksheet Question
>
> 1. [ ] What issues do you foresee in the final sprint?


## 6. Show Off

> [!IMPORTANT]
> ### Worksheet Question
>
> 1. [ ] Each team member highlights their best work (code, UI, design, integration, mocks, etc.).
>
> Remember: good refactored code should be simple and elegant.
>
> 2. [ ] Each member must commit their own update — commit logs will be checked.

### Ahnaf



### Bryce



### Ramatjyot



### Robert



### Sid



### Stephanie





## Sprint 2 Quick Checklist

- [ ] Regression testing process described.

- [ ] Link to regression script + last results.

- [ ] Testing slowdown discussed.

- [x] Untested parts identified + updated system diagram.

- [x] Tier testing coverage levels stated.

- [x] Coverage reports included.

- [ ] API profiler run + slowest endpoint identified.

- [ ] Profiler output attached/linked.

- [ ] Issues for final sprint listed.

- [ ] Each member’s “best work” committed & described.