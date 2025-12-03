# BudgetWise - Design Choices

## Architecture Overview

BudgetWise is a full-stack budgeting application built with **Clean Architecture** and **Hexagonal Architecture** principles, organized as a monorepo. The design prioritizes separation of concerns, testability, and maintainability.

---

## Core Principles

### 1. Dependency Rule

Dependencies flow **inward only**:

```sh
apps → composition → usecases → domain
                  ↓
              ports ← adapters
```

- **Domain**: Pure business logic, no dependencies.
- **Ports**: Interfaces for repositories and services (depends only on domain).
- **Adapters**: Implementations for persistence, system, and auth (depends on ports).
- **Use Cases**: Application logic, orchestrates domain and ports (depends on domain + ports).
- **Composition**: Dependency injection containers for each runtime (depends on all).
- **Apps**: Entry points (API, frontend; depends on composition).

### 2. Domain-Driven Design

- **Value Objects**: e.g., `Money` (stores integer cents, currency-aware, immutable).
- **Entities**: e.g., `Transaction`, `Budget`, `Category`, `User` (validate invariants, encapsulate business rules).
- **Immutability**: All domain objects are immutable after creation.
- **Validation**: Constructors enforce invariants.

### 3. Ports & Adapters (Hexagonal Architecture)

- **Ports**: Define interfaces for external dependencies (e.g., repositories, clock, ID generator).
- **Adapters**: Implement those interfaces for different environments (in-memory, system).

### 4. Use Cases

- Each business operation is a single-purpose function/class (e.g., `AddTransaction`, `CreateBudget`).
- Use cases orchestrate domain logic and interact with ports.
- Easy to test in isolation.

### 5. Composition Root

- Dependency injection containers wire up all dependencies for each runtime (e.g., Cloudflare Worker).
- Single place to configure the application.

---

## Package Structure

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
└── ...
```

### Details

- **Domain (`packages/domain`)**: Pure TypeScript business logic. No external dependencies.
- **Ports (`packages/ports`)**: Interface definitions for repositories and services.
- **Adapters (`packages/adapters`)**: Infrastructure implementations (in-memory, Supabase, system).
- **Use Cases (`packages/usecases`)**: Application business logic, orchestrates domain and ports.
- **Composition (`packages/composition`)**: Dependency injection containers for each runtime.
- **Schemas (`packages/schemas`)**: API contracts and validation (Zod schemas, OpenAPI).
- **Apps**: Entry points (API with Hono on Cloudflare Workers, Next.js frontend).

---

## Key Design Decisions

### 1. Repository Pattern

- **Decision:** Abstract data persistence behind interfaces.
- **Rationale:** Enables swapping databases, easy testing, and clear contracts.

### 2. Use Case per Operation

- **Decision:** Each business operation gets its own class/function.
- **Rationale:** Single Responsibility Principle, easy testing, clear naming.

### 3. Barrel Exports (`index.ts`)

- **Decision:** Use index files to re-export from folders.
- **Rationale:** Cleaner imports, single entry point per module, easier refactoring.

### 4. Monorepo Structure

- **Decision:** Multiple packages in a single repo.
- **Rationale:** Code sharing, atomic commits, easier dependency management, unified CI/CD.

### 5. Cloudflare Workers

- **Decision:** Deploy API to edge computing platform.
- **Rationale:** Global distribution, auto-scaling, cost-effective, integrates with Cloudflare Pages.

---

## Testing Strategy

- **Domain**: Pure unit tests (no mocks needed) - test business logic in isolation
- **Use Cases**: Test with in-memory adapters - validate application flows
- **Adapters**: Integration tests against real services (Supabase, etc.)
- **API**: E2E/smoke tests validating production deployment

**See**: [TESTING_GUIDE.md](TESTING_GUIDE.md) for complete testing documentation

**Current Status**: 525 tests | 55.3% lines | 74.5% functions

---

## Architecture Patterns

### Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│           Apps (API, Frontend)          │
│         ↓ depends on ↓                  │
├─────────────────────────────────────────┤
│       Composition (DI Container)        │
│         ↓ depends on ↓                  │
├─────────────────────────────────────────┤
│         Use Cases (App Logic)           │
│         ↓ depends on ↓                  │
├─────────────────────────────────────────┤
│   Domain ← Ports → Adapters             │
│   (Pure)   (Interfaces)  (Implementations)│
└─────────────────────────────────────────┘
```

**Key Rules**:
- Domain has ZERO dependencies
- Ports define interfaces, Adapters implement them
- Use Cases orchestrate Domain + Ports
- Apps only talk to Composition
- All dependencies point INWARD

### Repository Pattern

**Interface** (Ports):
```typescript
// packages/ports/src/repositories/budget-repository.ts
export interface BudgetRepository {
  create(budget: Budget): Promise<Budget>;
  findById(id: string): Promise<Budget | null>;
  findByUserId(userId: string): Promise<Budget[]>;
  update(budget: Budget): Promise<Budget>;
  delete(id: string): Promise<void>;
}
```

**Implementation** (Adapters):
```typescript
// packages/adapters/persistence/src/supabase-budget-repository.ts
export class SupabaseBudgetRepository implements BudgetRepository {
  constructor(private supabase: SupabaseClient) {}
  
  async create(budget: Budget): Promise<Budget> {
    // Supabase-specific implementation
  }
  // ...
}
```

**Why**: Swap implementations without changing business logic

### Dependency Injection

**Container** (Composition):
```typescript
// packages/composition/cloudflare-worker/src/container.ts
export function createContainer(env: Env) {
  // System adapters
  const clock = new SystemClock();
  const idGen = new UlidGenerator();
  
  // Repositories
  const budgetRepo = new SupabaseBudgetRepository(supabase);
  
  // Use cases
  const createBudget = new CreateBudgetUseCase(budgetRepo, clock, idGen);
  
  return { createBudget, /* ... */ };
}
```

**Why**: Single place to wire all dependencies

### Domain-Driven Design

**Value Objects** (Immutable, validated):
```typescript
export class Money {
  private constructor(
    public readonly cents: number,
    public readonly currency: string = 'USD'
  ) {}
  
  static create(amount: number, currency?: string): Money {
    if (amount < 0) throw new Error('Amount cannot be negative');
    return new Money(Math.round(amount * 100), currency);
  }
  
  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.cents + other.cents, this.currency);
  }
}
```

**Entities** (Business rules enforced):
```typescript
export class Budget {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly amount: Money,
    public readonly categoryId: string,
    public readonly userId: string,
    public readonly period: Period
  ) {}
  
  static create(params: CreateBudgetParams): Budget {
    // Validate business rules
    if (!params.name.trim()) throw new Error('Name required');
    if (params.amount.cents <= 0) throw new Error('Amount must be positive');
    
    return new Budget(/* ... */);
  }
  
  isExceeded(spent: Money): boolean {
    return spent.cents > this.amount.cents;
  }
}
```

---

## Technology Stack

### Backend (API)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Runtime** | Cloudflare Workers | Edge computing, global distribution, auto-scaling |
| **Framework** | Hono | Lightweight, fast, built for Workers |
| **Database** | Supabase (PostgreSQL) | Managed Postgres, built-in auth, realtime |
| **Validation** | Zod | Type-safe schema validation |
| **ORM** | Drizzle | Type-safe, lightweight SQL builder |

### Frontend

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 14 | React with SSR, app router, optimizations |
| **Deployment** | Cloudflare Pages | Edge deployment, integrates with Workers |
| **UI** | Tailwind CSS | Utility-first, fast development |
| **State** | React Query | Server state management, caching |
| **Auth** | Supabase Auth | JWT-based, social providers |

### Infrastructure

| Component | Technology | Why |
|-----------|-----------|-----|
| **Monorepo** | Turborepo | Fast builds, smart caching |
| **Package Manager** | pnpm | Fast, efficient, workspace support |
| **CI/CD** | GitHub Actions | Native integration, free for public repos |
| **Testing** | Vitest + Playwright | Fast unit tests, reliable E2E |
| **Linting** | ESLint + TypeScript | Code quality, type safety |

---

## Data Flow

### Request Flow (API)

```
1. Client Request
   ↓
2. Cloudflare Worker (apps/api)
   ↓
3. Hono Router → Route Handler
   ↓
4. Zod Schema Validation
   ↓
5. Composition Container → Get Use Case
   ↓
6. Use Case → Orchestrate Domain + Ports
   ↓
7. Repository (Adapter) → Database
   ↓
8. Domain Entity ← Repository
   ↓
9. Use Case → Business Logic
   ↓
10. Response ← JSON
```

### State Flow (Frontend)

```
1. User Action (Button Click)
   ↓
2. React Component
   ↓
3. React Query Mutation/Query
   ↓
4. API Call (fetch)
   ↓
5. Worker API (Edge)
   ↓
6. Supabase Database
   ↓
7. Response → React Query Cache
   ↓
8. Component Re-render
   ↓
9. UI Update
```

---

## Project Structure Details

```
budgetwise/
├── apps/
│   ├── api/                      # Cloudflare Worker API
│   │   ├── src/
│   │   │   ├── index.ts          # Worker entry point
│   │   │   ├── app.ts            # Hono app setup
│   │   │   ├── container.ts      # DI container
│   │   │   ├── middleware/       # Auth, CORS, error handling
│   │   │   └── routes/           # Route handlers
│   │   ├── tests/                # Integration tests
│   │   └── wrangler.jsonc        # Cloudflare config
│   │
│   └── frontend/                 # Next.js frontend
│       ├── src/
│       │   ├── app/              # App router pages
│       │   ├── components/       # React components
│       │   ├── hooks/            # Custom hooks
│       │   ├── services/         # API clients
│       │   └── utils/            # Utilities
│       └── tests/                # Component tests
│
├── packages/
│   ├── domain/                   # Pure business logic
│   │   └── src/
│   │       ├── entities/         # Budget, Category, Transaction, User
│   │       ├── value-objects/    # Money, Period, DateRange
│   │       └── types/            # Shared types
│   │
│   ├── ports/                    # Interface definitions
│   │   └── src/
│   │       ├── repositories/     # Data access interfaces
│   │       └── services/         # External service interfaces
│   │
│   ├── adapters/                 # Interface implementations
│   │   ├── auth-supabase/        # Supabase auth adapter
│   │   ├── persistence/          # Database adapters
│   │   │   ├── src/              # Supabase repositories
│   │   │   └── local/            # In-memory (testing)
│   │   ├── services/             # External service adapters
│   │   └── system/               # Clock, ID generator
│   │
│   ├── usecases/                 # Application logic
│   │   └── src/
│   │       ├── budgets/          # Budget operations
│   │       ├── categories/       # Category operations
│   │       ├── transactions/     # Transaction operations
│   │       └── users/            # User operations
│   │
│   ├── composition/              # DI containers
│   │   ├── cloudflare-worker/   # Worker container
│   │   └── web-auth-client/     # Frontend container
│   │
│   └── schemas/                  # API contracts
│       └── src/
│           ├── api/              # Request/response schemas
│           └── openapi/          # OpenAPI spec
│
├── e2e-tests/                    # Smoke/E2E tests
│   └── smoke-tests/              # Production validation
│
├── infra/                        # Infrastructure
│   └── supabase/                 # Supabase config, migrations
│
└── course-work/                  # Sprint worksheets, planning
```

---

## Security Considerations

### Authentication
- JWT-based with Supabase Auth
- Tokens stored in httpOnly cookies
- Refresh token rotation
- Social provider support (Google, GitHub)

### Authorization
- Row-level security (RLS) in Supabase
- User ID from JWT claims
- All queries filtered by userId

### API Security
- CORS configured for specific origins
- Rate limiting on Cloudflare
- Input validation with Zod
- SQL injection prevention (parameterized queries)

### Data Protection
- Passwords hashed (bcrypt via Supabase)
- Sensitive data encrypted at rest
- HTTPS enforced
- Security headers (CSP, HSTS, etc.)

---

## Performance Optimizations

### Edge Computing
- API deployed to 300+ Cloudflare locations
- <50ms latency globally
- Automatic caching at edge

### Database
- Connection pooling via Supabase
- Indexes on userId, categoryId, date columns
- Efficient queries (no N+1 problems)

### Frontend
- Server-side rendering (Next.js)
- Image optimization (next/image)
- Code splitting (automatic)
- React Query caching (stale-while-revalidate)

### Caching Strategy
- Static assets: CDN (1 year)
- API responses: React Query (5 min)
- User session: LocalStorage + memory

---

## Deployment

### Cloudflare Workers (API)
```bash
# Deploy to production
pnpm --filter api deploy

# Deploy to preview
pnpm --filter api deploy --env preview
```

**Automatic**: GitHub pushes to main trigger deployment

### Cloudflare Pages (Frontend)
```bash
# Deploy to production
pnpm --filter frontend deploy

# Preview deployments
# Automatic on every PR
```

**Automatic**: Cloudflare native integration

### Database Migrations
```bash
# Run migrations
cd infra/supabase
supabase db push

# Generate migration
supabase db diff -f migration_name
```

---

## Monitoring & Observability

### Cloudflare Analytics
- Request count, latency, errors
- Geographic distribution
- Cache hit rates

### Supabase Dashboard
- Database performance
- Query performance
- Connection pool usage

### Error Tracking
- Cloudflare error logs
- Structured logging in Workers
- Error boundaries in React

---

## Future Considerations

- **Budgets**: Spending alerts and forecasting.
- **Categories**: Hierarchical category system.
- **Recurring Transactions**: Automatic transaction creation.
- **Event Sourcing**: Track all financial changes as events.
- **CQRS**: Separate read/write models for performance.
- **Multi-currency Conversion**: Real-time exchange rates.

---

## References

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) by Robert C. Martin
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) by Alistair Cockburn

---
