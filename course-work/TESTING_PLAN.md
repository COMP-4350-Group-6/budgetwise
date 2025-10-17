# Testing Plan Template
---

## Testing Goals and Scope  
- Backend API (Hono on Cloudflare Workers): Validate route contracts, auth, and DTOs for categories, budgets, transactions, plus health/auth endpoints. Focus on status codes, schema-shape, and auth gating.
- Application Usecases: Assert business behavior (CRUD, guards, aggregations, period math) with deterministic system ports and in-memory repos. This is the acceptance-style test bed.
- Domain Layer: Enforce invariants and value-object rules (e.g., name constraints, alert thresholds, integer amounts). Zero external deps for fast, isolated unit tests.
- Frontend (Next.js): Validate hooks, services, and UI components (auth flow, sidebar, API client), prioritizing logic-heavy code. Page-level coverage is a stretch goal.
- Adapters: Cover auth adapter (Supabase) and local/system adapters; include an integration sanity check for login/logout.
- Out of scope (current sprint): Full browser E2E; external network dependencies (besides the auth adapter tests) during CI. Risk-based manual smoke on critical paths instead.

---

## Testing Frameworks and Tools  
- Vitest (API, Domain, Usecases, Frontend local): Chosen for TypeScript-first workflow, jsdom support, speed, and unified runner across packages. Coverage via @vitest/coverage-v8.
- Jest (Frontend script availability): Present for compatibility; either runner works for component/hook tests. Team may standardize on Vitest to reduce duplication.
- Testing Library (frontend): DOM assertions and user interactions in jsdom.
- MSW (frontend dep): Available for HTTP mocking if needed; most frontend tests currently stub APIs via lib/apiClient.
- Turbo + pnpm workspaces: Orchestrated monorepo test runs and per-package coverage outputs.
- Rationale: Follows in-class discussions about fast unit tests at the base, selective integration/contract tests, and minimizing brittle end-to-end flake.

---

## Test Organization and Structure  
- API (Vitest): apps/api/src/routes/*.test.ts for HTTP route behavior and *.int.test.ts for broader flows; apps/api/src/middleware/auth.test.ts for auth.
- Usecases (Vitest): packages/usecases/src/**/**/*.test.ts near the usecase code; one cross-flow integration at packages/usecases/src/integration/....
- Domain (Vitest): packages/domain/src/*.test.ts co-located with entities/value objects.
- Adapters: packages/adapters/auth-supabase/src/index.test.ts (unit) and index.int.test.ts (integration).
- Frontend: apps/frontend/__tests__/... for components, hooks, services; setup at __tests__/setup/setupTests.ts.
- Conventions: .test.ts for unit/feature tests; .int.test.ts for higher-level or cross-layer integrations. Coverage is per-package (Turbo caches coverage/**).

---

## Coverage Targets  
- Baseline (current): Usecases ≈92% lines; Domain ≈71% lines; Frontend ≈36% lines; Auth adapter ≈75% lines. Coverage varies due to barrels and page files.
- Targets (Sprint 1 pragmatic):
  - Usecases: ≥90% lines, ≥90% branches (acceptance criteria stability).
  - Domain: ≥80% lines, ≥95% branches (strict invariants).
  - Frontend: ≥50% lines initially (raise over sprints), keep high branch coverage on lib/ and hooks.
  - API routes: 100% of key endpoints exercised; typed DTO parsing for all success/validation paths.
- Config note: Frontend Vitest thresholds currently set to 50/50/40/50; plan to raise gradually. Coverage is tracked per package, not repo-wide.

---

## Running Tests  
```
# Monorepo: run everything
pnpm test

# Domain and Usecases with coverage
pnpm test --filter @budget/domain -- --coverage
pnpm test --filter @budget/usecases -- --coverage

# API tests (Vitest)
pnpm test --filter api

# Frontend: Vitest (recommended for local) with jsdom + setup
cd apps/frontend
pnpm vitest
pnpm vitest run --coverage

# Frontend: Jest (alternative via script)
pnpm --filter frontend test -- --coverage

# Auth adapter tests
pnpm run test:auth          # unit (API auth middleware)
pnpm run test:auth:integration  # supabase adapter integration
```
---

## Reporting and Results  
<!--
Explain where to find test reports (HTML, console, CI output) and how to interpret them.  
Include screenshots or links if applicable (e.g., `/coverage/index.html`).
-->

---

## Test Data and Environment Setup  
- Prereqs: Node 18+, pnpm, optional Docker, Supabase credentials for adapter tests.
- API env: SUPABASE_JWT_SECRET required. Locally, Vitest config injects a test secret; route tests also hoist a jose mock and pass SUPABASE_JWT_SECRET into app.fetch env.
- Frontend env: .env.local loaded in __tests__/setup/setupTests.ts (e.g., NEXT_PUBLIC_API_URL); jsdom environment; next/navigation router mocked.
- Determinism: In-memory repos and fixed clock/ID adapters in Usecases/Domain ensure reproducible results to follow in-class discussions on deterministic tests.
---

## Quality Assurance and Exceptions  
- Known gaps: Some API integrations may fail without proper env; frontend page-level coverage intentionally lower (logic over view). Barrel exports can depress coverage percentages.
- Mitigations:
  - Risk-based regression suite: smoke critical flows (auth → category → budget → transaction → dashboard) before release.
  - Contract tests on API DTOs and typed parsers to catch breaking changes early.
  - Pre-merge gates: pnpm typecheck, pnpm lint, pnpm test with minimum coverage budgets on Usecases/Domain.
  - Manual exploratory passes on new UI surfaces when feature toggles land.
- Exceptions: External dependencies (real Supabase) are stubbed/mocked in unit tests; reserved for selective integration runs behind env guards.

---

## Continuous Integration [Once set up]

Multiple tests are automatically run using GitHub Actions & Workflows

- Super-Linter for (Markdown, YAML, XML, and GitLeaks)
  - Linters support proper adhearance to a unified format across workers (Our Markdown linter is oversensitive and needs to be toned down)  
  - The GitLeaks linter helps with idenfiying leaked keys

- Cloudflare Workers and Pages for building the app.


NOTE:
- Current CI is not stable and should not be relied upon until next sprint