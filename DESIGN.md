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

- **Domain**: Pure unit tests (no mocks needed).
- **Use Cases**: Test with in-memory adapters.
- **Adapters**: Integration tests against real services.
- **API**: E2E tests with test database.

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
