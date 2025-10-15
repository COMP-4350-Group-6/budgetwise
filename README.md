# BudgetWise

COMP 4350 - Project Code

---

## Overview

BudgetWise is a full-stack budgeting application built with Clean Architecture principles in a monorepo.  
It allows users to manage categories, budgets, and transactions, with real-time dashboards and smart alerts.

---

## Table of Contents

- [Architecture & Design](#architecture--design)
- [Project Structure](#project-structure)
- [Setup Guide](#setup-guide)
- [Running the App](#running-the-app)
- [Testing](#testing)
- [Known Issues](#known-issues)
- [Branching Workflow](#branching-workflow)
- [Versioning](#versioning)
- [Acknowledgments](#acknowledgments)

---

## Architecture & Design

BudgetWise follows Clean Architecture and Hexagonal Architecture patterns:

- **Domain**: Pure business logic, no dependencies.
- **Ports**: Interfaces for repositories and services.
- **Adapters**: Implementations for persistence, system, and auth.
- **Use Cases**: Application logic, orchestrates domain and ports.
- **Composition**: Dependency injection containers for each runtime.
- **Apps**: Entry points (API, frontend).

**Key Design Choices:**

- **Monorepo**: All packages and apps in a single repository for atomic commits and easy dependency management.
<!-- - **Integer Cents**: All money values stored as integer cents for accuracy. -->
- **Barrel Exports**: Each package uses `index.ts` for clean imports.
- **Cloudflare Workers**: API deployed to edge for low latency.
- **Next.js Frontend**: Deployed to Cloudflare Pages.

For a detailed explanation, see [`DESIGN.md`](DESIGN.md).

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

---

## Setup Guide

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (monorepo package manager)
- [Docker](https://www.docker.com/) (optional, for local API)
- [Supabase](https://supabase.com/) account (for authentication)

### 1. Clone and Install

```sh
git clone <repo-url>
cd budgetwise
pnpm install
```

### 2. Environment Variables

Copy example env files and fill in values:



**Frontend `.env.local` example:**
```
NEXT_PUBLIC_API_URL="http://localhost:8787"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
```

**API env vars:**  
See `apps/api/wrangler.jsonc` and `.dev.vars` for local secrets.

---

## Running the App

### Backend/API

```sh
cd apps/api
pnpm install
pnpm dev
# API runs on http://localhost:8787 by default
```

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

### Run All Tests (Monorepo)

```sh
pnpm test
```

### Frontend Tests (Vitest)

```sh
cd apps/frontend
pnpm vitest
# or with coverage:
pnpm vitest run --coverage
```

- **Note:** Vitest loads `.env.local` for frontend tests via `vitest.setup.ts`.

### Backend/API Tests

```sh
cd apps/api
pnpm test
```

### Domain/Usecases Tests with Coverage

```sh
pnpm test --filter @budget/domain -- --coverage
pnpm test --filter @budget/usecases -- --coverage
```

### E2E Tests

```sh
cd apps/frontend
pnpm test:e2e
```

See [`TESTING.md`](TESTING.md) for more details and troubleshooting.

---

## Known Issues

- Some bugs and edge cases are tracked in the [GitHub Issues](https://github.com/COMP-4350-Group-6/budgetwise/issues) tab.
- Please check issues before reporting new bugs.

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

- [DESIGN.md](DESIGN.md) — Architecture and rationale
- [TESTING.md](TESTING.md) — Testing strategy and scenarios
- [BUDGET_IMPLEMENTATION_GUIDE.md](BUDGET_IMPLEMENTATION_GUIDE.md) — Implementation details and troubleshooting

---

*For API documentation and sprint planning, see the [API Doc](https://docs.google.com/document/d/1tYB-VAGl5qK_Bi0bbtqdJ5mbaJzvSiDYkD_54Wbm0mI/edit?usp=sharing) and `course-work/` folder.*
