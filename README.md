# BudgetWise

COMP 4350 - Full-Stack Budgeting Application

---

## ⚡ Quick Access

| Resource | Description |
|----------|-------------|
| 🌐 **[Swagger API Docs](http://localhost:8787/docs)** | Interactive API documentation (start API first) |
| 📖 **[Architecture](docs/architecture/DESIGN.md)** | Clean architecture design & patterns |
| 🧪 **[Testing Guide](docs/testing/TESTING_GUIDE.md)** | Test commands, coverage, best practices |
| 📊 **[Load Test Report](load-tests/LOAD_TEST_REPORT.md)** | API performance under stress |
| 🤖 **[LLM Profiler Dashboard](profiler/profiler-report.html)** | AI feature benchmarks |
| 📋 **[OpenAPI Spec](packages/schemas/dist/openapi.yaml)** | OpenAPI 3.1 specification |

---

## Overview

BudgetWise is a full-stack budgeting application built with [Clean Architecture](docs/architecture/DESIGN.md) principles in a monorepo. It enables users to manage categories, budgets, and transactions, with real-time dashboards and AI-powered features.

---

## Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org/))
- **pnpm** package manager ([install](https://pnpm.io/installation))
- **Supabase** account ([sign up free](https://supabase.com/))

## Quick Start

### 1. Clone and Install

```sh
git clone <repo-url> && cd budgetwise
pnpm install
```

### 2. Configure Supabase

Create a Supabase project and get your credentials from the dashboard.

**API environment** (create `apps/api/.dev.vars`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
OPENROUTER_API_KEY=your-openrouter-key  # Optional: for AI features
```

**Frontend environment** (create `apps/frontend/web-next/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### 3. Start the App

```sh
# Terminal 1: Start API (http://localhost:8787)
cd apps/api && pnpm dev

# Terminal 2: Start Frontend (http://localhost:3000)
cd apps/frontend/web-next && pnpm dev
```

> 📖 Detailed setup: [docs/setup/LOCAL_DEVELOPMENT_GUIDE.md](docs/setup/LOCAL_DEVELOPMENT_GUIDE.md)

---

## Project Structure

```
budgetwise/
├── apps/
│   ├── api/              # Backend REST API (Hono + Cloudflare Workers)
│   └── frontend/         # Next.js web application
├── packages/
│   ├── domain/           # Business logic
│   ├── schemas/          # Zod schemas + OpenAPI spec
│   └── ...               # ports, adapters, usecases, composition
├── docs/                 # All documentation
├── load-tests/           # k6 load testing
├── profiler/             # LLM performance benchmarks
└── e2e-tests/            # Playwright smoke tests
```

---

## 📚 Documentation

All documentation lives in [`docs/`](docs/README.md):

| Category | Description | Quick Link |
|----------|-------------|------------|
| **Architecture** | Design decisions, clean architecture | [DESIGN.md](docs/architecture/DESIGN.md) |
| **Setup** | Local development, database guides | [LOCAL_DEVELOPMENT_GUIDE.md](docs/setup/LOCAL_DEVELOPMENT_GUIDE.md) |
| **Testing** | Test guide, coverage, rationale | [TESTING_GUIDE.md](docs/testing/TESTING_GUIDE.md) |
| **Sprints** | Sprint worksheets | [Sprint 1](docs/sprints/sprint1_worksheet.md) • [2](docs/sprints/sprint2_worksheet.md) • [3](docs/sprints/sprint3_worksheet.md) |
| **Security** | Security analysis | [SECURITY_ANALYSIS.md](docs/security/SECURITY_ANALYSIS.md) |
| **DevOps** | CI/CD reports | [CI_CD_REPORT.md](docs/devops/CI_CD_REPORT.md) |
| **Acknowledgments** | AI usage credits | [ACKNOWLEDGMENTS.md](docs/acknowledgments/ACKNOWLEDGMENTS.md) |

---

## 🧪 Testing & Benchmarks

| Type | Location | Command | Results |
|------|----------|---------|---------|
| **Unit/Integration** | `packages/*/` | `pnpm test` | 525 tests, 74.5% functions |
| **Smoke/E2E** | [`e2e-tests/`](e2e-tests/) | `pnpm test:smoke:production` | 17 tests |
| **Load Testing** | [`load-tests/`](load-tests/) | `k6 run load-test.js` | [Report](load-tests/LOAD_TEST_REPORT.md) |
| **LLM Profiler** | [`profiler/`](profiler/) | `npx tsx run-stats.ts` | [Dashboard](profiler/profiler-report.html) |

### LLM AI Benchmarks

| Feature | Success | Mean | P50 | P95 |
|---------|---------|------|-----|-----|
| Auto-Categorization | 99% | 682ms | 596ms | 1103ms |
| Invoice Parsing | 100% | 2695ms | 1788ms | 6601ms |

---

## 🔌 API & OpenAPI

**Swagger UI:** http://localhost:8787/docs (interactive API explorer)

```sh
# Start API and open docs
cd apps/api && pnpm dev
# Then visit http://localhost:8787/docs
```

**Authentication:**
1. Login via `POST /auth/login` → Cookie set automatically
2. All `/v1/*` endpoints work with session cookie
3. Bearer tokens also supported for API clients

**Generate OpenAPI spec from Zod schemas:**
```sh
cd packages/schemas && pnpm run openapi:generate
# Output: packages/schemas/dist/openapi.yaml
```

---

## Versioning & Workflow

**Versioning:** `VX.0.0` (Sprints) • `V0.X.0` (Features) • `V0.0.X` (Patches)

**Branches:** `main` → `dev` → `feature/*` → PR

---

## Acknowledgments

Built with AI assistance (GPT-4, Copilot, Claude). See [docs/acknowledgments/](docs/acknowledgments/) for details.
