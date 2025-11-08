# Sprint 2 Worksheet

Format: Markdown file in your repository. Include links to relevant code, scripts, reports, and diagrams.

## 1. Regression Testing

> [!IMPORTANT]
>
> ### Worksheet Question
>
> 1. [x] Describe how you run regression testing:
>
>    - [x] Which tests are executed?
>
>    - [x] Which tool(s) are used?
>
> 2. [x] Link to the regression testing script.
>
> 3. [x] Include the latest snapshot of execution results.

### How We Run Regression Testing

**Regression testing ensures that new changes don't break existing functionality.** We run our entire test suite automatically on every pull request and merge to main/dev branches.

### Which Tests Are Executed

**Full Test Suite: 525 tests across 47 files**

| Test Type | Count | Purpose | When Run |
|-----------|-------|---------|----------|
| **Unit Tests** | ~450 tests | Test individual components in isolation | Every PR + main/dev merge |
| **Integration Tests** | ~58 tests | Test component interactions (auth, DB, services) | Every PR + main/dev merge |
| **Smoke Tests** | 17 tests | Validate production deployment | Post-deployment (manual/scheduled) |

**Coverage:**

- 55.3% lines | 74.5% functions
- Core domain entities: 100%
- Use cases: 73%
- API routes: 59%
- Frontend: 54%

### Which Tools Are Used

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **Vitest** | Unit/integration test runner | `vitest.config.ts` in each package |
| **Playwright** | E2E/smoke test runner | `e2e-tests/playwright.config.ts` |
| **GitHub Actions** | CI/CD automation | `.github/workflows/test.yml` |
| **Turbo** | Monorepo task orchestration | `turbo.json` |
| **lcov** | Coverage report generation | Merged coverage from all packages |

### Regression Testing Scripts

**Main CI Workflow:**

- [`.github/workflows/test.yml`](../.github/workflows/test.yml) - Automated regression testing on PRs and merges

**Test Commands:**

```bash
# Run all regression tests locally
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test types
pnpm test:unit        # Unit tests only
pnpm test:int         # Integration tests only
pnpm test:smoke:production  # Production smoke tests

# View coverage
pnpm coverage:report
```

**Smart Test Selection (PR optimization):**

```bash
# On PRs: Only test changed packages
pnpm turbo run test:unit --filter="...[origin/main]"

# On main/dev: Run all tests
pnpm test
```

### Latest Execution Results

**Test Run: November 7, 2025**

```
✓ Domain Tests (55 tests)
  ✓ packages/domain/src/budget.test.ts (15 tests)
  ✓ packages/domain/src/category.test.ts (12 tests)
  ✓ packages/domain/src/transaction.test.ts (18 tests)
  ✓ packages/domain/src/user.test.ts (10 tests)

✓ Use Case Tests (138 tests)
  ✓ packages/usecases/tests/budgets/ (45 tests)
  ✓ packages/usecases/tests/categories/ (35 tests)
  ✓ packages/usecases/tests/transactions/ (38 tests)
  ✓ packages/usecases/tests/auth/ (20 tests)

✓ Adapter Tests (228 tests)
  ✓ packages/adapters/auth-supabase/tests/ (22 tests)
  ✓ packages/adapters/persistence/tests/ (104 tests)
  ✓ packages/adapters/services/tests/ (23 tests)
  ✓ packages/adapters/system/tests/ (13 tests)
  ✓ apps/frontend/tests/ (66 tests)

✓ API Tests (97 tests)
  ✓ apps/api/tests/integration/ (97 tests)

✓ Smoke Tests (17 tests) - Production Deployment
  ✓ Frontend health checks (4 tests)
  ✓ API endpoint validation (4 tests)
  ✓ User flows (2 tests)
  ✓ Performance checks (2 tests)
  ✓ Error handling (2 tests)
  ✓ Security headers (3 tests)

─────────────────────────────────────────────────────
Test Suites: 47 passed, 47 total
Tests:       525 passed, 525 total
Time:        ~45s (local), ~2-3min (CI with caching)
Coverage:    55.3% lines | 74.5% functions
```

**To view the latest coverage report:**

```bash
pnpm coverage:report
```

This generates and opens the interactive HTML coverage report in your browser.

**Detailed Coverage Analysis:** See [`test-coverage/sprint2-test-summary.md`](../test-coverage/sprint2-test-summary.md) for comprehensive package-by-package breakdown, test distribution, and metrics.

**Note:** The [`test-coverage/test-summary.md`](../test-coverage/test-summary.md) folder contains coverage data from Sprint 1.

### Regression Testing Strategy

**On Pull Requests:**

1. Detect which files changed (`dorny/paths-filter`)
2. Run tests only for affected packages (`turbo --filter`)
3. Generate coverage report
4. Block merge if tests fail

**On Main/Dev Merge:**

1. Run **all 525 tests** (no filtering)
2. Generate full coverage report
3. Deploy to production (if all tests pass)
4. Optionally trigger smoke tests

**Post-Deployment:**

1. Run 17 smoke tests against live production
2. Validate frontend, API, auth, performance, security
3. Alert team if any smoke test fails

This ensures we catch regressions early while keeping PR feedback fast (~2-3min vs ~5-10min if we ran all tests every time).

## 2. Testing Slowdown

> [!IMPORTANT]
>
> ### Worksheet Question
>
> 1. [x] Have you been able to keep all unit and integration tests from your test plan?
>
> 2. [x] Have you created different test plans for different release types? Explain.

### 1. Maintaining All Tests from Test Plan

**Yes, we've kept all unit and integration tests - and added more!**

#### Current Test Status

| Test Type | Status | Count |
|-----------|--------|-------|
| **Unit Tests** | ✅ Maintained & Growing | 525 tests across 47 files |
| **Integration Tests** | ✅ All kept | Supabase, Auth, Services |
| **Smoke Tests** | ✅ Added (not in original plan) | 17 production validation tests |

#### Coverage Maintained

```
Overall: 55.3% lines | 74.5% functions

Key Areas:
- Domain entities: 100%
- Use cases: 50-100% 
- Adapters: 23-100%
- Frontend utils: 83-100%
```

**Why We've Been Able to Maintain All Tests:**

1. **Clean Architecture Design** - Testable by default with dependency injection
2. **Test-First Development** - Tests written alongside features
3. **Smart CI Strategy** - Fast feedback loop keeps tests valuable (see below)

### 2. Different Test Plans for Different Release Types

**Yes! We use a tiered testing strategy that runs different tests based on context.**

#### Overview of Strategy

Instead of running all 525 tests on every commit, we intelligently select which tests to run based on:

- What code changed
- Which branch you're on
- What type of release it is

This keeps tests fast while maintaining quality gates at the right points.

#### Release Type Test Plans

##### Plan 1: Feature Development (Quick Validation)

**When:** Push to any feature branch  
**Goal:** Catch obvious errors fast

**Tests Run:**

- ✅ TypeScript type checking
- ✅ ESLint
- ❌ Skip unit/integration tests (wait for PR)

**Rationale:** Let developers iterate quickly. Comprehensive tests run when opening a PR.

**Implementation:**

```yaml
# .github/workflows/test.yml
quick-checks:
  steps:
    - run: pnpm typecheck
    - run: pnpm lint
```

##### Plan 2: Pull Request (Changed Packages Only)

**When:** PR to main/dev  
**Goal:** Test only what changed for fast feedback

**Tests Run:**

- ✅ Type check + Lint
- ✅ Unit tests for **changed packages only**
- ✅ Integration tests for **changed packages only**
- ✅ Coverage report

**How It Works:**

1. Detect which files changed
2. Identify affected packages
3. Run tests only for those packages

**Example:**

```bash
# Developer changed apps/frontend/src/utils/date.ts

Tests run:
- apps/frontend tests ✓
- packages that frontend depends on ✓

Tests skipped:
- apps/api tests ✗
- Unrelated packages ✗
```

**Implementation:**

```yaml
# Detect what changed
- uses: dorny/paths-filter@v3
  with:
    filters: |
      frontend: 'apps/frontend/**'
      api: 'apps/api/**'

# Run tests only for changed packages
- run: pnpm turbo run test:unit --filter="...[origin/${{ github.base_ref }}]"
```

##### Plan 3: Production Release (Full Suite)

**When:** Merge to main or dev branch  
**Goal:** Comprehensive validation before production

**Tests Run:**

- ✅ Type check + Lint
- ✅ **ALL** unit tests (525 tests)
- ✅ **ALL** integration tests
- ✅ Full coverage report

**Rationale:** Production must pass all tests, no exceptions.

**Implementation:**

```yaml
- name: Run all unit tests
  if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/dev'
  run: pnpm test:unit

- name: Run all integration tests
  run: pnpm test:int
```

##### Plan 4: Post-Deployment Validation (Smoke Tests)

**When:** After Cloudflare deploys to production  
**Goal:** Validate live production environment

**Tests Run:**

- 17 smoke tests against actual production URLs
  - Frontend loads correctly
  - API endpoints respond
  - Authentication redirects work
  - Performance acceptable
  - Security headers present

**Implementation:**

```yaml
# .github/workflows/smoke-tests.yml
on:
  workflow_dispatch:  # Manual trigger
  schedule:
    - cron: '0 9 * * *'  # Daily validation
```

**Example Test:**

```typescript
test('should load homepage successfully', async ({ page }) => {
  const response = await page.goto(PRODUCTION_URL);
  expect(response?.status()).toBe(200);
});
```

##### Plan 5: Pre-Release (Everything)

**When:** Manual trigger with `[full-tests]` in commit message  
**Goal:** Extra confidence before major releases

**Tests Run:** All tests + smoke tests + coverage

**Usage:**

```bash
git commit -m "feat: major release [full-tests]"
```

#### Test Plan Comparison

| Release Type | Type Check | Lint | Unit Tests | Integration | Coverage | Smoke Tests | When |
|-------------|:----------:|:----:|:----------:|:-----------:|:--------:|:-----------:|------|
| Feature Branch | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Every push |
| Pull Request | ✅ | ✅ | Changed only | Changed only | ✅ | ❌ | PR created |
| Production | ✅ | ✅ | All 525 tests | All tests | ✅ | Optional | Merge to main |
| Post-Deploy | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ 17 tests | After deploy |
| Pre-Release | ✅ | ✅ | All | All | ✅ | ✅ | Manual |

### Strategy Rationale

#### Why Not Run All Tests Every Time?

**Problem:** Running 525 tests on every commit creates:

- Slow feedback loop
- Developer frustration
- Wasted CI resources

**Solution:** Smart test selection

- Fast feedback for PRs (only changed code)
- Comprehensive testing where it matters (main/dev)
- Quality gates at the right points

#### How We Achieve This

**1. Change Detection**

```yaml
# .github/workflows/test.yml
detect-changes:
  uses: dorny/paths-filter@v3
  with:
    filters: |
      frontend: 'apps/frontend/**'
      api: 'apps/api/**'
      packages: 'packages/**'
```

**2. Turbo's Dependency Graph**

```bash
# Runs tests for package + everything that depends on it
pnpm turbo run test:unit --filter="...[origin/main]"
```

**3. Local Caching**

```json
// turbo.json
{
  "tasks": {
    "test:unit": {
      "cache": true,
      "inputs": ["src/**", "tests/**"]
    }
  }
}
```

#### Deployment Strategy

**We use Cloudflare's native integration for deployment (not GitHub Actions):**

| Responsibility | Tool | Why |
|----------------|------|-----|
| **Testing** | GitHub Actions | Smart caching, PR comments, flexible |
| **Deployment** | Cloudflare Native | Faster, automatic PR previews, built-in monitoring |
| **Validation** | Playwright Smoke Tests | Real browser testing on live production |

**Workflow:**

```
1. Developer pushes → Cloudflare builds PR preview
2. GitHub runs changed package tests
3. PR approved → Merge
4. Cloudflare deploys to production (automatic)
5. GitHub runs all tests (quality gate)
6. Optional: Trigger smoke tests
```

### Implementation Files

**CI/CD Workflows:**

- [`.github/workflows/test.yml`](../.github/workflows/test.yml) - Smart test selection
- [`.github/workflows/smoke-tests.yml`](../.github/workflows/smoke-tests.yml) - Production validation
- [`.github/workflows/linter.yml`](../.github/workflows/linter.yml) - Code quality

<!-- **Documentation:**

- [`.github/CLOUDFLARE_NATIVE_SETUP.md`](../.github/CLOUDFLARE_NATIVE_SETUP.md) - Deployment strategy
- [`.github/CI_CD_TESTING_STRATEGY.md`](../.github/CI_CD_TESTING_STRATEGY.md) - Full details
- [`.github/CI_CD_QUICK_REFERENCE.md`](../.github/CI_CD_QUICK_REFERENCE.md) - Quick lookup -->

**Test Suites:**

- [`e2e-tests/smoke-tests/`](../e2e-tests/smoke-tests/) - 17 production smoke tests
- `packages/*/tests/` - Unit tests per package
- `apps/*/tests/` - Integration tests per app

### Summary

**Question 1: Have you kept all tests from your test plan?**  
✅ **Yes!** All prev tests maintained, plus many new tests added.

**Question 2: Different test plans for different release types?**  
✅ **Yes!** Five distinct test plans:

1. **Feature Branch** → Type check + lint (quick iteration)
2. **Pull Request** → Changed packages only (fast feedback)
3. **Production Release** → All tests (quality gate)
4. **Post-Deploy** → Smoke tests (live validation)
5. **Pre-Release** → Everything (extra confidence)

**Key Strategy:** Use smart test selection (Turbo + change detection) to run only relevant tests on PRs, while maintaining comprehensive testing on production releases. This balances speed with quality.

## 3. Not Testing

> [!IMPORTANT]
>
> ### Worksheet Question
>
> 1. [x] What parts of the system are not tested?
> 2. [x] Provide an updated system diagram.
> 3. [x] For each tier, indicate which layers are:
>    - [x] Fully tested (80%+)
>    - [x] Mostly tested (20–80%)
>    - [x] Somewhat tested (0–20%)
>    - [x] Not tested
> 4. [x] Include coverage reports for tested tiers.

### Overall Coverage Summary

**Repository Coverage: 55.3% lines | 74.5% functions**  
**Total Tests: 525 tests across 47 test files**

### What Parts Are Not Tested?

#### 1. **Composition Layer (0%)** - DI Containers

- `packages/composition/cloudflare-worker/` - Cloudflare Workers DI wiring
- `packages/composition/web-auth-client/` - Frontend authentication DI wiring

**Rationale:** Simple composition roots that wire dependencies. Validated through integration tests.

#### 2. **AI/LLM Use Cases (0%)**

- `usecases/transactions/categorize-transaction.ts`
- `usecases/transactions/parse-invoice.ts`

**Rationale:** Thin wrappers around AI adapters. The underlying OpenRouter adapter has 100% coverage.

#### 3. **Observability Features (0%)**

- `domain/llm-model.ts` - Cost calculation models
- `domain/llm-call.ts` - LLM tracking entities
- `domain/default-categories.ts` - Seed data

**Rationale:** Newer observability features. Money value object has 50% coverage.

#### 4. **Supabase CRUD Repos (~3%)**

- Categories, Budgets, Users, LLM Calls repositories

**Rationale:** Mappers (100%) and Transactions repo (100%) are fully tested. Others follow same pattern.

#### 5. **UI Components (0-40%)**

- Dashboard components (0%)
- Advanced transaction modals (17-41%)

**Rationale:** Focus on business logic over UI. Component testing requires complex React Testing Library setup.

#### 6. **API Routes (28-70%)**

- `routes/transactions.ts` (28%) - Edge cases
- `routes/auth.ts` (39%) - Some flows

**Rationale:** Core business logic in use cases is tested. Routes add HTTP handling/validation.

#### 7. **External Services (Integration Only)**

- Supabase PostgreSQL, OpenRouter API, Cloudflare Workers

**Rationale:** Mocked in unit tests. Some Supabase integration tests exist (env-gated).

### System Diagram - Coverage by Tier

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER (53-59%)                   │
│                        [Mostly Tested]                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend: 53.86%  │  API: 59.48%                              │
│  ✓ Utils: 100%     │  ✓ Routes: ~70%                           │
│  ✓ Services: 100%  │  ✓ Middleware: ~62%                       │
│  ✓ Hooks: 100%     │  ✓ Container: 100%                        │
│  ✗ UI Components   │                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER (73%)                        │
│                        [Mostly Tested]                          │
├─────────────────────────────────────────────────────────────────┤
│  Use Cases: 73.33%                                              │
│  ✓ Budget Management: 100%   │  ✓ Auth: 100%                   │
│  ✓ Category Mgmt: 100%       │  ✓ Transactions: ~80%           │
│  ✗ AI Features: 0%           │  ✗ DI Containers: 0%            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     DOMAIN TIER (35%)                           │
│                        [Mostly Tested]                          │
├─────────────────────────────────────────────────────────────────┤
│  Entities: 34.78%                                               │
│  ✓ Budget: 100%        │  ✓ User: 100%                         │
│  ✓ Category: 100%      │  ~ Money: 50%                         │
│  ✓ Transaction: 100%   │  ✗ LLM Models: 0%                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE TIER (70%)                      │
│                        [Mostly Tested]                          │
├─────────────────────────────────────────────────────────────────┤
│  Adapters:                                                      │
│  ✓ OpenRouter (AI): 100%        │  ✓ System: 70%               │
│  ✓ Local Storage: 81.52%        │  ~ Auth: 62.85%              │
│  ~ Supabase: 34.24%             │                               │
│    • Mappers: 100%              │                               │
│    • Transactions: 100%         │                               │
│    • Others: ~3%                │                               │
└─────────────────────────────────────────────────────────────────┘

Legend: ✓ Tested  ~ Partial  ✗ Not Tested
```

### Coverage by Tier

| Tier | Coverage | Tests | Classification | Status |
|------|----------|-------|----------------|--------|
| **Presentation** | 53-59% | 228 tests | Mostly Tested | ✅ |
| **Application** | 73% | 138 tests | Mostly Tested | ✅ |
| **Domain** | 35% | 55 tests | Mostly Tested | ⚠️ |
| **Infrastructure** | 70% | 104 tests | Mostly Tested | ✅ |
| **Composition** | 0% | 0 tests | Not Tested | ❌ |

### Detailed Coverage Reports

#### Package-Level Summary

| Package | Coverage | Tests | Highlights |
|---------|----------|-------|------------|
| **Frontend** | 53.86% | 131 | ✅ Utils/Services: 100%, ⚠️ Components: 0-40% |
| **API** | 59.48% | 97 | ✅ Categories: 98%, ✅ Budgets: 85%, ⚠️ Transactions: 28% |
| **Domain** | 34.78% | 55 | ✅ Core entities: 100%, ❌ LLM models: 0% |
| **Use Cases** | 73.33% | 138 | ✅ CRUD: 100%, ❌ AI: 0%, Functions: 100% |
| **OpenRouter** | 100% | 23 | ✅ Full coverage including mocks |
| **Local Persist** | 81.52% | 18 | ✅ Transactions/Categories: 100% |
| **Supabase Persist** | 34.24% | 28 | ✅ Mappers: 100%, ⚠️ Others: ~3% |
| **System** | 70% | 13 | ✅ Clock: 100%, ~ ID Gen: 68% |
| **Auth Supabase** | 62.85% | 22 | ✅ Signup/Login: 100% |

#### Fully Tested Components (80%+)

- ✅ Frontend utilities (dateHelpers, csvParser): 96-100%
- ✅ Frontend services (budgetService, transactionsService): 98-100%
- ✅ Frontend hooks (useAuth): 100%
- ✅ OpenRouter AI adapter (categorization, invoice parsing): 100%
- ✅ Local persistence (transactions, categories): 100%
- ✅ Supabase mappers (domain ↔ DB transformation): 100%
- ✅ Supabase transactions repository: 100%
- ✅ Use cases (budgets, categories, auth): 100%
- ✅ Domain entities (Budget, Category, Transaction, User): 100%
- ✅ System clock adapter: 100%
- ✅ API container (DI): 100%

#### Viewing Coverage Reports

```bash
# Generate all coverage reports and open in browser
pnpm run coverage:report

# Or step by step:
pnpm run test:coverage    # Run tests + merge
pnpm run coverage:html    # Generate HTML (requires: apt-get install lcov)
pnpm run coverage:view    # Open in browser
```

**HTML Reports:**

- Merged: `coverage/html/index.html`
- Frontend: `apps/frontend/coverage/index.html`
- API: `apps/api/coverage/lcov-report/index.html`
- Per-package: `packages/{name}/coverage/index.html`
<!-- 
**Documentation:**
- [Coverage Guide](../COVERAGE_GUIDE.md) - Commands and workflows
- [Coverage Cheatsheet](../COVERAGE_CHEATSHEET.md) - Quick reference
 -->

## 4. Profiler

### Profiler Implementation

We implemented a bash API profiler that exercises all endpoints. The profiler uses curl to make HTTP requests and measures response times

### Results

**Which endpoint is the slowest?**

POST /transactions - 7ms

**Is the slowdown fixable - and why/why not?**

Yes but it's not necessary. The 7ms response time is excellent and well within acceptable performance thresholds. The slight delay is expected for write operations due to:

- Database write operations for inserting the transactions
- Transaction validation logic
- Domain object creation and persistence

This is normal performance for POST operations. No optimization needed.

**Profiler Output:**

[Profiler Results](../profiler/profiler-results/output-20251105-153415.txt)

## 5. Last Dash

> [!IMPORTANT]
>
> ### Worksheet Question
>
> 1. [x] What issues do you foresee in the final sprint?

### Anticipated Challenges for Sprint 3

#### 1. Technical Debt from AI-Generated Code

**Issue:** While AI-generated code enabled rapid feature delivery in Sprints 1 and 2, it's now creating friction when extending functionality.

**Specific Problems:**
- Code requires significant refactoring to align with architecture guidelines
- Increased PR review time as developers need additional context to understand AI-generated patterns
- Code smells and inconsistencies emerged across AI-generated sections
- Varying code quality and style between different AI-generated modules

**Mitigation Strategy:**
- Allocate dedicated refactoring time in early Sprint 3 (before new features)
- Leverage the `refactor/all` branch for consolidated improvements
- Establish explicit code review criteria for AI-assisted contributions
- Enhance architectural documentation in `DESIGN.md` with concrete examples
- Implement stricter linting rules to enforce consistency

**Impact:** Medium - Initial velocity slowdown, but improved maintainability and long-term productivity.

---

#### 2. Team Coordination and Communication

**Issue:** Limited synchronous availability across team members has complicated planning and decision-making.

**Specific Problems:**
- No overlapping time slots for full team meetings
- Asynchronous communication effective but slows critical decisions
- Sprint planning and retrospectives difficult to coordinate
- Scheduling conflicts limit pair programming and knowledge sharing
- Risk of knowledge silos when team members work independently

**Mitigation Strategy:**
- Implement structured async stand-ups via GitHub Discussions or Slack
- Mandate comprehensive PR descriptions documenting decisions and rationale
- Weekly written status updates from each team member
- Use GitHub Project boards for real-time task visibility
- Require cross-functional PR reviews to distribute knowledge
- Create technical design documents before implementation to align understanding
- Schedule critical synchronous meetings 1 week in advance using availability polls

**Key Challenge:** Smaller sub-teams can accelerate specific tasks but risk creating silos where members lose context about parallel work, making integration and collective ownership harder.

**Impact:** Medium - Workable with disciplined async practices, but requires conscious effort to maintain team cohesion and shared understanding.

---

#### 3. Integration Testing Environment

**Issue:** Some integration tests are skipped due to missing Supabase environment configuration.

**Specific Problems:**
- Supabase integration tests require environment variables not configured in CI
- Only ~3% coverage on Supabase repositories (Categories, Budgets, Users, LLM Calls)
- CI/CD pipeline cannot validate full integration test suite
- Risk of integration bugs slipping through to production

**Mitigation Strategy:**
- Configure test Supabase instance for CI environment
- Add GitHub Secrets with Supabase test credentials
- Enable skipped integration tests once environment is ready
- Document local integration test setup in README
- Consider test database seeding scripts for consistent test data

**Impact:** Low - Current unit tests and smoke tests provide solid coverage; integration tests would add defense-in-depth.

---

#### 4. UI Component Testing Coverage

**Issue:** Dashboard and transaction UI components have low test coverage (0-40%).

**Specific Problems:**
- React Testing Library setup complexity for Next.js components
- Time constraints prioritized business logic testing over UI testing
- Mocking Next.js hooks, routing, and client components requires significant boilerplate
- No visual regression testing for layout changes

**Mitigation Strategy:**
- Prioritize testing critical user paths (transaction CRUD, budget management)
- Add Playwright component tests for key user journeys
- Implement snapshot tests for visual regression detection
- Defer comprehensive component unit tests to post-Sprint 3 if time-constrained
- Focus on integration/E2E tests that validate UI behavior end-to-end

**Impact:** Low - Business logic has strong coverage (73% use cases, 100% domain entities); manual testing and smoke tests catch UI regressions effectively.

---

### Risk Summary

| Priority | Challenge | Impact | Mitigation Effort |
|----------|-----------|--------|-------------------|
| **High** | Technical debt cleanup | Medium | High - Requires dedicated time |
| **High** | Team coordination | Medium | Medium - Process changes |
| **Medium** | Integration test setup | Low | Low - Configuration task |
| **Low** | UI component testing | Low | High - Defer if needed |

### Sprint 3 Focus Areas

**Week 1:**
1. Refactor AI-generated code (high priority)
2. Set up integration test environment
3. Improve async communication workflows

**Week 2-3:**
4. Implement new features with stricter quality gates
5. Enhanced documentation and knowledge sharing
6. Add critical UI tests if time permits

**Overall Assessment:** Challenges are manageable with clear mitigation strategies. Success depends on:
- Early prioritization of technical debt over new features
- Disciplined async communication and documentation
- Leveraging existing test coverage while strategically filling gaps

The team has strong fundamentals (55% coverage, 525 tests, CI/CD automation) providing a solid foundation for Sprint 3.

## 6. Show Off

### Bryce

**CSV Upload Feature**

I implemented a CSV upload feature that allows users to bulk import transactions

Included

- **Flexible CSV parsing**:
  - Supports various column name formats (amount/price/total, date/occurredAt, description/note)
- **Automatic AI categorization**
  - Transactions are automatically categorized using AI based on their description
- **Error handling**
  - Shows preview before import, reports errors by row number, continues importing even if some rows fail
- **User-friendly UI**
  - Modal with file upload, preview table, and clear success/error feedback

The implementation uses a CSV parser on the frontend and a bulk import endpoint on the backend. When transactions are imported without categories, the system automatically calls the AI categorization service to assign appropriate categories.

**Key Files:**

- apps/frontend/src/lib/csvParser.ts - CSV parsing logic
- apps/frontend/src/app/(protected)/transactions/page.tsx - Upload UI
- apps/api/src/routes/transactions.ts - Bulk import endpoint is POST /transactions/bulk-import

This feature saves users time by allowing them to import many transactions at once rather than entering them manually one by one.

### Ramatjyot

**CI/CD Pipeline & Clean Architecture**

I implemented end-to-end continuous deployment with Cloudflare and architected our Clean Architecture design that enabled high test coverage.

#### What I Built

**Cloudflare CI/CD Pipeline**

- **Automatic deployments** - Push to `main` → instant production deploy (API and Frontend on workers runtime)
- **PR preview deployments** - Each PR gets unique URL
- **Zero-downtime** - Global edge network deployment, sub-100ms latency worldwide
- **Full automation** - 525 tests run → build → deploy → live in minutes

**Clean Architecture Design**

- **Researched and proposed** layered architecture: Domain → Use Cases → Adapters → Infrastructure
- **Port/Adapter pattern** - Designed interfaces enabling swappable implementations (Local/Supabase, OpenRouter AI)
- **Dependency inversion** - Domain has zero external dependencies, enabling 100% coverage on core entities
- **Enabled testability** - Architecture directly contributed to 55.3% repo coverage

**Codebase Refactoring** (In Progress - `refactor/all` branch)

- Monorepo optimization and circular dependency removal
- Build process streamlining for faster CI/CD
- Consolidating duplicate code across packages

#### Impact

**Deployment Velocity:** Hours → Minutes (automated)  
**Developer Experience:** Preview URLs eliminate "works on my machine" - reviewers test PRs before merge  
**Global Performance:** Cloudflare edge = 99.99% uptime, sub-100ms responses  
**Cost Efficiency:** Serverless pay-per-use vs always-on servers  
**Test Coverage:** Clean Architecture separation = 100% on domain entities, 73% on use cases

#### Key Deliverables

- `.github/workflows/deploy.yml` - CI/CD pipeline
- `DESIGN.md` - Architecture documentation
- `wrangler.jsonc` - Cloudflare configuration
- Production: `https://budgetwise.ca`

The architecture and deployment pipeline I built became the foundation enabling the team to move fast while maintaining quality - automated testing catches regressions, preview deployments catch integration issues, and Clean Architecture keeps business logic testable and maintainable.

### Robert

### Sid

**Optimistic Add + Async Auto-categorization**

I added an optimistic UI update when creating a transaction and improved the auto-categorization flow so it updates the transaction in-place without reloading the whole list.

Included

- **Optimistic insert**
  - New transaction is inserted into local state immediately after the add API returns and the list is sorted by occurredAt.
  - Removes the previous full reload (no more `await loadTransactions()`) for faster UX.
- **Better auto-categorization flow**
  - Tracks whether a category was selected and whether note/description existed (`hadCategorySelected`, `hadNoteOrDescription`).
  - If no category was chosen and there is note/description, calls `categorizeTransaction` asynchronously.
  - When categorization returns, updates the matching transaction's `categoryId` and `updatedAt` in state (no full reload).
  - `setCategorizingId` is still used to indicate ongoing categorization.
- **Minor state and cleanup**
  - Clears form fields as before; uses `newTx` from the create response to avoid re-fetching.

**Key file**

- apps/frontend/src/app/(protected)/transactions/page.tsx

**Relevant Links**

- [Issue](https://github.com/COMP-4350-Group-6/budgetwise/issues/102)
- [Commit](https://github.com/COMP-4350-Group-6/budgetwise/commit/857087990d542cd17874dacd8a016b57514b1125)

### Stephanie

#### Frontend Refactor & UI/UX redesign

#### Overview

I refactored and modernized the entire pages (based on feedback given) mostly to improve performance, maintainability, and user experience. The new layout separates logic into smaller, reusable components (filters, lists, modals, summaries) for clarity and scalability.

#### What It Does

- **Redesigned category and spending sections** for better readability and usability. Added smooth budget creation/edit flows, integrated category color indicators, and improved progress bar visuals.
- **Rebuilt the transaction and home page** into modular, readable components (`TransactionList`, `TransactionFilters`, etc.)
- **Added a constant folder to eliminate string literals in codebase**
- **Simplified and optimized the data flow** between modals and services
- **Enhanced the page visuals** with new responsive CSS layouts
- **Fixed category editing and modal update states**
  
#### Current Status & Next Steps

 **Note: Refactoring not fully completed due to time constraints**

#### Key Files

- [`apps/frontend/src/app/(protected)/home/page.tsx`](../../apps/frontend/src/app/(protected)/home/page.tsx)  
- [`apps/frontend/src/app/(protected)/transactions/page.tsx`](../../apps/frontend/src/app/(protected)/transaction/page.tsx) — Main page refactor and logic flow
- [`apps/frontend/src/components/transactions/transactionList.tsx`](../../apps/frontend/src/app/components/transaction/transactionList.tsx) — Redesigned list UI with live edit buttons
- [`apps/frontend/src/components/transactions/modals`](../../apps/frontend/src/app/components/transactions/modals) — Modularized add/edit/import/upload modals
- [`apps/frontend/src/app/constants/strings`](../../apps/frontend/src/app/constants/strings)  - Removal of string literals in code

#### Commit

**Commit**: [https://github.com/COMP-4350-Group-6/budgetwise/pull/118/commits/76fc006d38c4bf517819c97781d05c5ebf48fa23](https://github.com/COMP-4350-Group-6/budgetwise/pull/137/commits/5ce025aa9a095ba7f770e7971f7477f315f7454d)

### Ahnaf

#### Why I Love the Auto-Categorization Feature (commit #96)

I'm incredibly proud of the auto-categorization feature because it's **fast and smooth**. When a user adds a transaction, they see "Categorizing..." for maybe half a second, then boom! it's done! No waiting, no spinning wheels, just instant categorization.

To achieve this, I chose `Mistral Small` as the LLM model, which is the perfect sweet spot for this task. It's a small, fast model that costs ~$0.0002 per call instead of $0.05 like the big models, making it 250x chexaper while still being highly accurate for pattern matching tasks like categorizing "Starbucks coffee $5.50" → "Food & Dining."

The smoothness comes from three key architectural decisions I made:

**Technical Implementation:**

- **Async-first design** - Categorization happens in the background after the transaction is created, so users never wait
- **Smart prompting**  the LLM prompt to uses category UUIDs instead of names, preventing common AI mistakes/hallucinations (THERES TRADE OFFS FOR THIS, BUT SO FAR IT WORKS 99% OF THE TIME0
- **Non-blocking UI** - The transaction appears immediately, then updates with the category when ready. It's optimistic updates.
- **Graceful fallbacks** - If categorization fails, the transaction still saves successfully

**Performance Optimizations:**

- **Right-sized model** - Mistral Small handles 95%+ accuracy at 250x lower cost than large models
- **Token efficiency** - Limited to 300 tokens max, keeping responses under 200ms
- **Usage tracking** - Built LLM call monitoring to track costs and performance in real-time
- **Bulk import support** - Auto-categorizes entire CSV imports without blocking

**Documentation & Knowledge Sharing:**
I created a comprehensive **"How to Choose an LLM Model 101"** wiki page that teaches the team the "Three Bears Principle" for model selection. It explains when to use small/medium/large models, includes cost calculations, decision trees, and real-world examples from our codebase. This documentation ensures anyone on the team can make informed LLM choices without wasting money or sacrificing performance.

#### LLM Choice Cost Rationale

```math
\begin{aligned}
\text{Input tokens per call} &\approx 300 \text{ tokens} \\
\text{Output tokens per call} &\approx 75 \text{ tokens} \\
\\
\textbf{Mistral Small:} \\
\text{Input cost} &= 300 \times \frac{\$0.10}{1000000} = \$0.00003 \text{ per call} \\
\text{Output cost} &= 75 \times \frac{\$0.30}{1000000} = \$0.0000225 \text{ per call} \\
\text{Total per call} &= \$0.0000525 \\
\text{Monthly AI cost (1M transactions)} &= 1000000 \times \$0.0000525 = \$52.50 \\
\\
\textbf{Claude Sonnet 4.5:} \\
\text{Input cost} &= 300 \times \frac{\$3.00}{1000000} = \$0.0009 \text{ per call} \\
\text{Output cost} &= 75 \times \frac{\$15.00}{1000000} = \$0.001125 \text{ per call} \\
\text{Total per call} &= \$0.002025 \\
\text{Monthly AI cost (1M transactions)} &= 1000000 \times \$0.002025 = \$2025 \\
\\
\textbf{Cost Difference:} \\
\text{Mistral Small saves} &= \$2025 - \$52.50 = \$1972.50 \text{ per month} \\
\text{Cost ratio} &= \frac{\$2025}{\$52.50} = 38.6\times \text{ more expensive with Claude}
\end{aligned}
```

Key insights:

- Mistral Small: $52.50/month for 1M transactions
- Claude Sonnet 4.5: $2,025/month for 1M transactions
- Savings: $1,972.50/month by choosing Mistral Small
- Claude is 38.6× more expensive for this use case

#### Practical Value Calculations

Some math I did to demonstrate this features practical value.

**Case**: say there are 1 million transactions

```math
\begin{aligned}
\text{Input tokens per call} &\approx 300 \text{ tokens} \\
\text{Output tokens per call} &\approx 75 \text{ tokens} \\
\\
\text{Input cost} &= 300 \times \frac{\$0.10}{1000000} = \$0.00003 \text{ per call} \\
\\
\text{Output cost} &= 75 \times \frac{\$0.30}{1000000} = \$0.0000225 \text{ per call} \\
\\
\text{Total per call} &\approx \$0.0000525 \\
\\
\text{Monthly AI cost} &= 1000000 \times \$0.0000525 = \$52.50 \\
\\
\\
\text{Manual time per transaction} &= 10 \text{ seconds} \\
\\
\text{Total time for 1M transactions} &= 1000000 \times 10 \text{ sec} \\
&= 10000000 \text{ seconds} \\
&= \frac{10000000}{3600} = 2778 \text{ hours} \\
&= \frac{2778}{8} = 347 \text{ work days} \\
&= \frac{347}{260} = 1.34 \text{ work years} \\
\\
\text{Labor cost at } \$30\text{/hour} &= 2778 \times \$30 = \$83340 \\
\\
\text{Net monthly savings} &= \$83340 - \$52.50 = \$83287.50 \\
\\
\text{ROI} &= \frac{\$83287.50}{\$52.50} = 1586\times \text{ return on investment}
\end{aligned}
```

*Please note these are just educated guesstimates*

**Bottom line:** By choosing the right LLM and engineering a smooth UX, we save **$83,340/month** in human economic labor costs and **1.34 work years of human labor** for just **$53/month** in AI costs. This also does not include the intangible QoL benefits.

The end result is that users get instant, accurate categorization that seems too good to be true, while it costs us pennies per thousand transactions.

*Acknowledgements:
The above article was structured and refined with assistance from Claude Sonnet 4.5 (Anthropic). The Fermi estimates, cost calculations, mathematical formulations, and overall narrative structure were developed through iterative collaboration via the Anthropic web interface. It had been verified for factuality.*

## Sprint 2 Quick Checklist

- [ ] Regression testing process described.

- [ ] Link to regression script + last results.

- [ ] Testing slowdown discussed.

- [ ] Untested parts identified + updated system diagram.

- [ ] Tier testing coverage levels stated.

- [ ] Coverage reports included.

- [ ] API profiler run + slowest endpoint identified.

- [ ] Profiler output attached/linked.

- [ ] Issues for final sprint listed.

- [ ] Each member’s “best work” committed & described.
