# BudgetWise

COMP 4350 - Project Code

---

Sprint 1 Worksheet: [Sprint 1 Worksheet](course-work/sprint1_worksheet.md)

Sprint 2 Worksheet: [Sprint 2 Worksheet](course-work/sprint2_worksheet.md)

Sprint 3 Worksheet: [Sprint 3 Worksheet](course-work/sprint3_worksheet.md)

Testing Plan: [Testing Plan](course-work/TESTING_PLAN.md)

## Overview

BudgetWise is a full-stack budgeting application built with [Clean Architecture](DESIGN.md) principles in a monorepo.  
It enables users to manage categories, budgets, and transactions, with real-time dashboards and smart alerts.

---

## Table of Contents

- [BudgetWise](#budgetwise)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Architecture \& Design](#architecture--design)
  - [Project Structure](#project-structure)
  - [Setup Guide](#setup-guide)
    - [Prerequisites](#prerequisites)
    - [1. Clone and Install](#1-clone-and-install)
    - [2. Environment Variables](#2-environment-variables)
  - [Running the App](#running-the-app)
    - [Backend/API](#backendapi)
    - [API Documentation (Swagger UI)](#api-documentation-swagger-ui)
    - [Frontend](#frontend)
  - [Testing](#testing)
    - [Quick Start](#quick-start)
    - [What We Test](#what-we-test)
    - [Test Types](#test-types)
    - [Load Testing](#load-testing)
    - [Documentation](#documentation)
  - [Known Issues](#known-issues)
  - [Branching Workflow](#branching-workflow)
  - [Versioning](#versioning)
  - [Acknowledgments](#acknowledgments)
  - [Further Reading](#further-reading)

---

## Architecture & Design

BudgetWise follows [Clean Architecture](DESIGN.md) and Hexagonal Architecture patterns:

- **Domain**: Pure business logic, no dependencies.
- **Ports**: Interfaces for repositories and services.
- **Adapters**: Implementations for persistence, system, and auth.
- **Use Cases**: Application logic, orchestrates domain and ports.
- **Composition**: Dependency injection containers for each runtime.
- **Apps**: Entry points (API, frontend).

**Key Design Choices:**

- **Monorepo**: All packages and apps in a single repository for atomic commits and easy dependency management.
- **Barrel Exports**: Each package uses `index.ts` for clean imports.
- **Cloudflare Workers**: API deployed to edge for low latency.
- **Next.js Frontend**: Deployed to Cloudflare Pages.

For a detailed explanation of these choices and the rationale, see [DESIGN.md](DESIGN.md).

---

## Project Structure

```sh
budgetwise/
├── apps/
│   ├── api/         # Backend API (Hono, Cloudflare Worker)
│   └── frontend/    # Next.js frontend
├── packages/
│   ├── domain/      # Business logic (entities, value objects)
│   ├── ports/       # Interfaces for repositories/services
│   ├── adapters/    # Implementations (in-memory, firebase, system)
│   ├── usecases/    # Application logic
│   ├── schemas/     # API validation schemas
│   └── composition/ # Dependency injection containers
├── course-work/     # Sprint worksheets and planning
├── infra/           # Infrastructure configs (firebase, cloudflare)
├── .env*            # Environment variables (see below)
├── README.md        # This file
├── DESIGN.md        # Architecture/design rationale
├── TESTING.md       # Testing strategy and guide
├── ACKNOWLEDGMENTS.md
└── ...
```

For more on the folder structure and rationale, see [DESIGN.md](DESIGN.md#package-structure).

---

## Setup Guide

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (monorepo package manager)
- [Cloudflare account](https://cloudflare.com) (optional, for deployment)
- [Supabase](https://supabase.com/) account (for authentication)

### 1. Clone and Install

```sh
git clone <repo-url>
cd budgetwise
pnpm install
```

### 2. Environment Variables

Copy example env files and fill in values:

**Frontend `.dev.vars` example:**

```
NEXT_PUBLIC_API_URL="http://localhost:8787"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
```

**API env vars:**  
See [`apps/api/wrangler.jsonc`](apps/api/wrangler.jsonc) and `.dev.vars.example` for local secrets.

---

## Running the App

### Backend/API

```sh
cd apps/api
pnpm install
pnpm dev
# API runs on http://localhost:8787 by default
```

### API Documentation (Swagger UI)

The API includes built-in interactive documentation via Swagger UI:

1. **Start the API server:**
   ```sh
   cd apps/api && pnpm dev
   ```

2. **Open Swagger UI:** http://localhost:8787/docs

3. **Available endpoints:**
   - `GET /docs` - Interactive Swagger UI
   - `GET /docs/openapi.json` - OpenAPI 3.1 spec (JSON)
   - `GET /health` - Health check

4. **Authentication flow:**
   - Login via `POST /auth/login` → Sets session cookie automatically
   - All `/v1/*` endpoints use the cookie for authentication
   - Bearer tokens also supported for API clients

> **Note:** To generate/update the OpenAPI spec from Zod schemas:
> ```sh
> cd packages/schemas && pnpm run openapi:generate
> ```

### Frontend

```sh
cd apps/frontend
pnpm install
pnpm dev
# Frontend runs on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing

> **📚 See [TESTING_GUIDE.md](TESTING_GUIDE.md) for the complete testing guide**

### Quick Start

```sh
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# View coverage report
pnpm coverage:report

# Run smoke tests (production)
pnpm test:smoke:production
```

### What We Test

- **525 unit & integration tests** across 47 files
- **17 smoke tests** validating production deployment
- **55.3% lines coverage** | **74.5% functions coverage**

### Test Types

| Type | Location | Command | Purpose |
|------|----------|---------|---------|
| **Unit** | `packages/*/src/*.test.ts` | `pnpm test:unit` | Test individual components |
| **Integration** | `packages/*/tests/integration/` | `pnpm test:int` | Test component interactions |
| **Smoke/E2E** | `e2e-tests/smoke-tests/` | `pnpm test:smoke:production` | Validate production |

### Load Testing

The API has been load tested to validate performance under stress:

```sh
cd load-tests && pnpm install
k6 run load-test.js
```

**Results:**
- **[load-tests/LOAD_TEST_REPORT.md](load-tests/LOAD_TEST_REPORT.md)** - Analysis and findings
- **[load-tests/load-test-results-report.html](load-tests/load-test-results-report.html)** - Interactive HTML report
- **[load-tests/load-test-results.json](load-tests/load-test-results.json)** - Raw metrics data

See **[load-tests/README.md](load-tests/README.md)** for setup and configuration.

### Documentation

- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Complete testing guide (commands, best practices, troubleshooting)
- **[e2e-tests/README.md](e2e-tests/README.md)** - Smoke test documentation
- **[load-tests/README.md](load-tests/README.md)** - Load testing guide
- **[TESTING-RATIONALE.md](TESTING-RATIONALE.md)** - Domain-specific testing rationale
- **[course-work/TESTING_PLAN.md](course-work/TESTING_PLAN.md)** - Original test plan

---

## Known Issues

- Some bugs and edge cases are tracked in the [GitHub Issues](https://github.com/COMP-4350-Group-6/budgetwise/issues) tab.
- Please check issues before reporting new bugs.
- API integration tests may fail if environment variables are missing

---

## Branching Workflow

Repo uses a GitFlow-like workflow:

| Branch              | Description                                                                                                          | Branches from     | Merges to                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------- |
| `main`              | Production code                                                                                                      | NONE              | N/A                         |
| `dev`               | Development code                                                                                                     | `main`            |                             |
| `release/{VERSION}` | Releases                                                                                                             | `dev`             | `dev`, `main`               |
| `feature/{TITLE}`   | Feature work                                                                                                         | `dev`             | `dev`                       |
| `hotfix/{TITLE}`    | Critical production fixes                                                                                            | `main`            | `main`, `dev`               |
| `test/{TITLE}`      | Testing/experiments (never merged to main/dev)                                                                       | (ANY)             | only other `test/` branches |
| `doc/{TITLE}`       | Documentation updates                                                                                                | `dev`, `feature/` | `dev`, `feature/`           |

See table and details above for merge requirements.

---

## Versioning

- **V**X**.0.0** - Major releases (Sprints)
- **V0.**X**.0** - Minor releases (Features)
- **V0.0.**X** - Patches (Hotfixes, missing deliverables, etc.)

---

## Acknowledgments

All code and documentation in this repository was written with the help of AI (prompt engineering, Copilot, GPT-4/5) and human intervention for verification, review, and integration.  
Special thanks to all open-source libraries and tools used.

See [`ACKNOWLEDGMENTS.md`](ACKNOWLEDGMENTS.md) for more details and attributions.

---

## Further Reading

- **[DESIGN.md](DESIGN.md)** — Comprehensive architecture, design patterns, and technical decisions
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** — Complete testing strategy, commands, and troubleshooting
- **[TESTING-RATIONALE.md](TESTING-RATIONALE.md)** — Domain-specific testing reasoning
- **[ACKNOWLEDGMENTS.md](ACKNOWLEDGMENTS.md)** — AI usage and tool acknowledgments
- **[test-coverage/test-summary.md](./test-coverage/test-summary.md)** — Test coverage reports
- **[packages/schemas/README.md](packages/schemas/README.md)** — OpenAPI/Swagger documentation
- **[packages/schemas/dist/openapi.yaml](packages/schemas/dist/openapi.yaml)** — OpenAPI 3.1 specification

*For interactive API documentation, visit `/docs` on any running API instance (e.g., http://localhost:8787/docs).*

*For sprint planning, see the [`course-work/`](course-work/) folder.*
