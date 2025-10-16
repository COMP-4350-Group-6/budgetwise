# Test Summary (Updated)

## TL;DR

- **Usecases**: green and well-covered (~92% lines).
[see screenshot](usecase.png)

- **Domain**: all green but lighter logic; ~71% line coverage largely due to barrels/exports.
[see screenshot](domain.png)

- **Frontend**: tests pass; overall line coverage is low (~36%) because pages/routes lack tests.
 [see screenchot](frontend.png)

- **Auth adapter (supabase)**: **all tests passing** (2 files, 5/5 tests) with ~75% lines..
[see screenshot](auth-adapter-supabase.png)

- **API package integration tests**: still failing because of **env/config issues**; we attempted loading `dotenv` for Supabase but couldn’t pinpoint the issue in time. We’ll keep investigating and will **email Prof the necessary config files** (`.env`, `.dev.vars`, API keys for tests) soon.
[see screenshot](api.png)

---

## Packages & Apps

### `@budget/usecases`

- **Status:** 10/10 test files passed · **90/90 tests passed**
- **Coverage (all files):** Lines **91.92%**, Branches **93%**, Functions **100%**.


### `@budget/domain`

- **Status:** 4/4 files passed · **152/152 tests passed**
- **Coverage (all files):** Lines **71.02%**, Branches **95.58%**, Functions **68.42%**.
- **Notes:** This package doesn’t contain much complex logic (mostly invariants/types), which explains the lower statement/line coverage. Barrel files (`index.ts`, `...categories.ts`) report 0% lines; consider excluding pure re-exports from coverage.

### Frontend (`apps/frontend`)

- **Status:** 7/7 files passed · **36/36 tests passed**
- **Coverage:** Lines **35.9%**, Branches **82.41%**, Functions **86.2%**.
- **Notes:** Many route/page files show 0% statements.`lib/apiClient.ts` is strong at **~91% lines**.

### Auth Adapter: `packages/adapters/auth-supabase`

- **Status:** **2/2 files passed · 5/5 tests passed** (includes integration: login/logout succeed with test credentials).
- **Coverage:** ~**75.71%** lines, ~**66.66%** branches.

---

## API / Integration Tests (Backend)

- Failures (e.g., `transactions.int.test.ts`) stem from **missing Supabase env**; stderr repeatedly shows `SUPABASE_JWT_SECRET not configured`.
- We **tried loading `dotenv`** for the Supabase config (via Vitest setup) and even **hard-coded `SUPABASE_JWT_SECRET`** in the test env, but it still didn’t take effect.
- This **was working earlier**; a recent change likely broke env loading and we couldn’t track it down due to time constraints.

**Next steps:**

1) Find out the reason why it was failing
2) Add a **test auth adapter** flag to bypass external verification in CI if needed.

---

## Administrative

- We will **email the professor** the necessary test configuration materials soon: API key(s) for tests, `.dev.vars`, and `.env` templates.
- Known gap: API tests failing due to environment; acknowledged and actively investigating.
