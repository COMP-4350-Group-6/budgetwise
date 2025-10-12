# BudgetWise - Design Choices

## Architecture Overview

BudgetWise follows **Clean Architecture** principles with a monorepo structure. The design prioritizes separation of concerns, testability, and maintainability.

## Core Principles

### 1. Dependency Rule

Dependencies flow **inward only**:

```
apps → composition → usecases → domain
                  ↓
              ports ← adapters
```

- **Domain** has zero dependencies - pure business logic
- **Ports** define interfaces (depends only on domain)
- **Adapters** implement ports (depends on ports)
- **Use Cases** orchestrate domain logic (depends on domain + ports)
- **Composition** wires everything together (depends on all)
- **Apps** are entry points (depends on composition)

### 2. Domain-Driven Design

#### Money Value Object

- Stores amounts as **integer cents** to avoid floating-point errors
- Currency-aware with proper decimal place handling
- Immutable - all operations return new instances
- Type-safe operations that prevent mixing currencies

```typescript
// USD: 2 decimal places → $10.50 = 1050 cents
// JPY: 0 decimal places → ¥100 = 100 cents
const price = Money.fromAmount(10.50, 'USD'); // 1050 cents internally
```

#### Domain Entities

- **Transaction**: Financial transaction with amount, budget, category
- **Budget**: Spending limit with period (daily/weekly/monthly/yearly)
- **User**: Account with email, name, default currency

All entities:

- Validate invariants in constructors
- Expose immutable props
- Encapsulate business rules

### 3. Ports & Adapters (Hexagonal Architecture)

#### Ports Package

Defines **interfaces** for external dependencies:

- `Clock`: Time abstraction for testing
- `IdGenerator`: UUID generation
- Repository interfaces: `TransactionsRepo`, `UsersRepo`, `BudgetsRepo`

#### Adapters Package

Provides **implementations**:

- `persistence-inmem`: In-memory storage (for testing)
- `persistence-firebase`: Firestore implementation
- `system`: Real clock and UUID implementations

**Why?** Allows swapping implementations without changing business logic. Easy to test with mocks.

### 4. Use Cases

Business operations are isolated in single-purpose classes:

```typescript
class AddTransaction {
  constructor(
    private transactionsRepo: TransactionsRepo,
    private clock: Clock,
    private idGen: IdGenerator
  ) {}
  
  async execute(input: AddTransactionInput): Promise<Transaction> {
    // Business logic here
  }
}
```

**Benefits:**

- Each use case is independently testable
- Clear separation of business rules
- Easy to understand what the system does
- Simple to add new features

### 5. Composition Root

The `composition` package wires dependencies using dependency injection:

```typescript
class Container {
  // All dependencies created here
  private transactionsRepo = new FirebaseTransactionsRepo();
  private clock = new SystemClock();
  
  getAddTransactionUseCase() {
    return new AddTransaction(this.transactionsRepo, this.clock, this.idGen);
  }
}
```

**Why?** Single place to configure the entire application. Easy to swap implementations for different environments.

## Package Structure

### Domain (`packages/domain`)

**No external dependencies** - pure TypeScript business logic.

- Value objects: `Money`
- Entities: `Transaction`, `Budget`, `User`
- Invariant validation

### Ports (`packages/ports`)

Interface definitions. Depends only on domain types.

- Repository interfaces
- External service interfaces
- Keeps domain decoupled from infrastructure

### Adapters (`packages/adapters`)

Infrastructure implementations.

- **persistence-inmem**: Fast in-memory storage for testing
- **persistence-firebase**: Production Firestore persistence
- **system**: Real-world implementations (Clock, ID generation)

### Use Cases (`packages/usecases`)

Application business logic.

- Orchestrates domain objects
- Uses ports for I/O
- Single Responsibility Principle per use case

### Composition (`packages/composition`)

Dependency injection container.

- **cloudflare-worker**: Configuration for Cloudflare Workers runtime
- Wires adapters to ports
- Creates use case instances

### Schemas (`packages/schemas`)

API contracts and validation.

- OpenAPI specifications
- Request/response schemas
- Shared between frontend and backend

### Apps

#### `apps/api`

REST API built with Hono on Cloudflare Workers.

- Handles HTTP requests
- Input validation with schemas
- Routes to use cases
- Error handling middleware

#### `apps/web-next`

Next.js frontend.

- User interface
- Deployed to Cloudflare Pages

## Key Design Decisions

### 1. Integer Cents Storage

**Decision:** Store monetary amounts as integer cents, not floats.

**Rationale:**

- Avoids floating-point precision errors (0.1 + 0.2 ≠ 0.3)
- Database-friendly (integers are exact)
- Common pattern in financial systems

### 2. Currency-Aware Money Type

**Decision:** Money includes both amount and currency.

**Rationale:**

- Prevents mixing currencies accidentally
- Supports international users
- Type-safe currency conversions
- Different currencies have different decimal places

### 3. Repository Pattern

**Decision:** Abstract data persistence behind interfaces.

**Rationale:**

- Swap databases without changing business logic
- Easy testing with in-memory implementations
- Clear contract between layers
- Support multiple storage backends

### 4. Use Case per Operation

**Decision:** Each business operation gets its own class.

**Rationale:**

- Single Responsibility Principle
- Easy to test in isolation
- Clear naming (AddTransaction, UpdateBudget, etc.)
- Simple to understand system capabilities

### 5. Barrel Exports (index.ts)

**Decision:** Use index files to re-export from folders.

**Rationale:**

- Cleaner import statements
- Single entry point per module
- Easier refactoring
- Clear public API surface

**Trade-off:** May impact tree-shaking, adds files to maintain.

### 6. Monorepo Structure

**Decision:** Multiple packages in single repo.

**Rationale:**

- Share code between API and web app
- Atomic commits across layers
- Easier dependency management
- Single CI/CD pipeline

### 7. Cloudflare Workers

**Decision:** Deploy API to edge computing platform.

**Rationale:**

- Global distribution (low latency)
- Scales automatically
- Cost-effective for small apps
- Integrates with Cloudflare Pages for frontend

## Testing Strategy

- **Domain**: Pure unit tests (no mocks needed)
- **Use Cases**: Test with in-memory adapters
- **Adapters**: Integration tests against real services
- **API**: E2E tests with test database

## Future Considerations

<!-- problly wont do in this project -->
- **Event Sourcing**: Track all financial changes as events
- **CQRS**: Separate read/write models for performance
- **Multi-currency Conversion**: Real-time exchange rates

<!-- for future sprints -->
- **Budgets**: Add spending alerts and forecasting
- **Categories**: Hierarchical category system
- **Recurring Transactions**: Automatic transaction creation

## References

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) by Robert C. Martin
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) by Alistair Cockburn
