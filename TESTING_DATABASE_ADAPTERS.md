# Testing Database Adapters - Best Practices

## Overview

This document explains the testing strategy for database adapters (specifically Supabase) and why we use multiple testing approaches.

## The Three-Layer Testing Strategy

### 1. **Mapper Tests** (Unit Tests - Fastest)

**Purpose**: Test data transformation logic between database rows and domain entities.

**What we test**:
- Conversion from database rows to domain entities (`toTransaction`, `toCategory`, etc.)
- Conversion from domain entities to database rows (`fromTransaction`, `fromCategory`, etc.)
- Handling of optional/nullable fields
- Round-trip conversions (ensure no data loss)

**Why separate mapper tests**:
- Mappers have complex logic (field name transformations, date conversions, null handling)
- Fast execution (no database or mocking needed)
- Easy to debug when data transformation fails
- Can test edge cases thoroughly

**Example**: `packages/adapters/persistence/supabase/src/mappers.test.ts`

```typescript
it('should convert CategoryRow to Category domain entity', () => {
  const row: CategoryRow = { /* ... */ };
  const category = toCategory(row);
  
  expect(category.props.userId).toBe(row.user_id);
  expect(category.props.isActive).toBe(row.is_active);
});
```

**Benefits**:
- ✅ Very fast (< 1ms per test)
- ✅ No external dependencies
- ✅ Easy to write and maintain
- ✅ Catches data transformation bugs early

---

### 2. **Repository Unit Tests with Mocked Client** (Unit Tests - Fast)

**Purpose**: Test repository query construction, error handling, and client interactions WITHOUT a real database.

**What we test**:
- Correct SQL query construction (which table, filters, ordering)
- Proper parameter passing
- Error handling (database errors propagate correctly)
- Return value transformations

**Why mock the Supabase client**:
- Tests run instantly (no database setup)
- Can simulate error conditions easily
- Verify exact API calls made to Supabase
- No database state management needed

**Example**: `packages/adapters/persistence/supabase/src/transactions-repo.test.ts`

```typescript
it('should call correct Supabase methods for getById', async () => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: mockRow, error: null }),
  };
  
  mockClient.from.mockReturnValue(mockChain);
  
  await repo.getById('tx-1');
  
  expect(mockClient.from).toHaveBeenCalledWith('transactions');
  expect(mockChain.eq).toHaveBeenCalledWith('id', 'tx-1');
});
```

**Benefits**:
- ✅ Fast execution (2-5ms per test)
- ✅ No database setup required
- ✅ Easy to test error scenarios
- ✅ Verifies correct API usage
- ✅ Can run in CI without database

**Limitations**:
- ❌ Doesn't catch SQL/schema issues
- ❌ Doesn't test actual database constraints
- ❌ Can't verify complex queries work correctly

---

### 3. **Integration Tests with Real Database** (Integration Tests - Slower)

**Purpose**: Test actual database operations end-to-end.

**What we test**:
- Real CRUD operations work correctly
- Database constraints are enforced (foreign keys, unique constraints)
- Transactions and rollbacks
- Complex queries return correct results
- Cross-repository interactions
- Data persistence across operations

**Why use a real database**:
- Only way to catch real database issues
- Tests schema migrations work
- Verifies referential integrity
- Catches subtle bugs mocks would miss

**Example**: `packages/adapters/persistence/supabase/tests/integration/repos.int.test.ts`

```typescript
describe.skipIf(!shouldRun)("Supabase Integration", () => {
  it('should maintain referential integrity', async () => {
    await categoriesRepo.create(category);
    await budgetsRepo.create(budget); // References category
    await transactionsRepo.create(transaction); // References budget
    
    const retrieved = await transactionsRepo.getById('tx-1');
    expect(retrieved?.props.budgetId).toBe(budget.props.id);
  });
});
```

**Setup Requirements**:
- Supabase local dev: `supabase start` in `infra/supabase/`
- OR cloud test instance with env vars:
  ```bash
  SUPABASE_URL=http://localhost:54321
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
  ```

**Benefits**:
- ✅ Catches real database issues
- ✅ Tests schema changes
- ✅ Verifies constraints work
- ✅ Tests complex queries
- ✅ High confidence in production behavior

**Limitations**:
- ❌ Slower (50-200ms per test)
- ❌ Requires database setup
- ❌ Test isolation is harder
- ❌ Can't run without infrastructure

**Best Practices for Integration Tests**:
```typescript
// ✅ Gate tests with environment variables
const shouldRun = !!SUPABASE_URL && !!SUPABASE_SERVICE_ROLE_KEY;
describe.skipIf(!shouldRun)("Integration", () => { /* ... */ });

// ✅ Clean up before AND after tests
beforeEach(async () => {
  await client.from("transactions").delete().eq("user_id", testUserId);
});

afterAll(async () => {
  // Final cleanup
});

// ✅ Use consistent test data IDs
const testUserId = "test-user-supabase-integration";
```

---

## Why All Three?

### The Testing Pyramid

```
        /\
       /  \  Integration (Few, Slow, High Confidence)
      /____\
     /      \  Repository Unit Tests (More, Fast, Verify API)
    /________\
   /          \  Mapper Tests (Most, Fastest, Verify Logic)
  /____________\
```

**Each layer serves a purpose**:

1. **Mappers** - Catch data transformation bugs early (90% of tests)
2. **Repo Unit** - Verify correct API usage and error handling (8% of tests)
3. **Integration** - Ensure real database works (2% of tests, highest value)

### When to Write Each Type

| Scenario | Mapper Test | Repo Unit Test | Integration Test |
|----------|-------------|----------------|------------------|
| New field added to entity | ✅ | Optional | ✅ |
| New repository method | ❌ | ✅ | ✅ |
| Bug in date conversion | ✅ | ❌ | Optional |
| Error handling logic | ❌ | ✅ | ❌ |
| Database constraint added | ❌ | ❌ | ✅ |
| Complex multi-table query | ❌ | Optional | ✅ |

---

## Test Execution

### Local Development

```bash
# Run all tests (unit only if no DB configured)
pnpm test

# Run with coverage
pnpm test -- --coverage

# Run only mapper tests (fast)
pnpm test -- mappers.test.ts

# Run only repo unit tests
pnpm test -- transactions-repo.test.ts

# Run integration tests (requires Supabase)
pnpm test -- integration
```

### CI/CD Pipeline

```bash
# Stage 1: Fast unit tests (always run)
pnpm test -- --testPathIgnorePatterns=integration

# Stage 2: Integration tests (only if DB available)
if [ -n "$SUPABASE_URL" ]; then
  pnpm test -- integration
fi
```

---

## Files Created

### Supabase Adapter Tests

```
packages/adapters/persistence/supabase/
├── src/
│   ├── mappers.test.ts              # 🔹 Mapper unit tests
│   ├── transactions-repo.test.ts     # 🔹 Repo unit tests (mocked)
│   ├── transactions-repo.ts
│   ├── mappers.ts
│   └── ...
├── tests/
│   └── integration/
│       └── repos.int.test.ts         # 🔹 Integration tests (real DB)
└── vitest.config.ts                  # 🔹 Test configuration
```

### Test Coverage

- **Mappers**: ~30 tests covering all entity types
- **Repository Unit**: ~25 tests per repo
- **Integration**: ~15 tests covering cross-repo scenarios

**Total**: ~100+ tests added for Supabase adapters

---

## Common Patterns

### Mocking Supabase Client

```typescript
const mockClient = {
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    // ... chain continues
  })),
};
```

### Integration Test Setup

```typescript
beforeEach(async () => {
  // Clean test data
  await client.from("transactions").delete().eq("user_id", testUserId);
  
  // Create test fixtures
  await client.from("users").insert({ id: testUserId, /* ... */ });
});
```

### Handling Optional Fields

```typescript
// Mappers handle undefined → null conversion
export function fromCategory(category: Category): CategoryRow {
  return {
    description: category.props.description ?? null,
    icon: category.props.icon ?? null,
  };
}

// Test both cases
it('should handle null optional fields', () => {
  const row = { /* ..., */ description: null };
  const category = toCategory(row);
  expect(category.props.description).toBeUndefined();
});
```

---

## Key Takeaways

1. **Mappers are critical** - Most bugs happen in data transformation
2. **Mock for speed** - Unit tests should run in milliseconds
3. **Integrate sparingly** - Only test what mocks can't verify
4. **Gate integration tests** - Use env vars to make them optional
5. **Clean up religiously** - Integration tests must not interfere with each other
6. **Test the happy path AND errors** - Both success and failure cases matter

---

## References

- [Testing Trophy](https://kentcdodds.com/blog/write-tests) - Balance of test types
- [Supabase Local Dev](https://supabase.com/docs/guides/cli/local-development)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
