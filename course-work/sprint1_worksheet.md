# Sprint 1 Worksheet

> This deliverable focuses on testing coverage, test importance, and environment reproducibility.


## 1. Testing Plan

> [!WARNING]
> {MISSING_TODO}

## 2. Unit / Integration / Acceptance Testing


### Backend

> [!WARNING]
> {MISSING_TODO}

<!--
- API layer: 100% method coverage (every method has at least 1 tested line).

- Logic classes: ≥80% line coverage.

- Integration tests: 100% class coverage, with strong line & method coverage.
-->

### Frontend

> [!WARNING]
> {MISSING_TODO}

<!--
- Logic layer (if present): ≥80% coverage.

- UI tests: Describe approach and coverage.

- If unit tests are missing for some classes/methods, explain why and how quality is being ensured.

- Describe any unusual/unique aspects of your testing approach.

-->

### Coverage Report

> [!WARNING]
> {MISSING_TODO}

<!--
- Provide class and line coverage reports (link or screenshot).
-->

## 3. Testing Importance

Top 3 tests for each category:

### Unit Tests

> [!WARNING]
> {MISSING_TODO}

### Integration Tests

> 1. https://github.com/COMP-4350-Group-6/budgetwise/blob/main/packages/usecases/src/integration/category-budget-transaction.integration.test.ts  
- checks the orchestration across categories, budgets, and transactions. then links records, aggregates spending into category and budget totals, and checks domain rules with integrated repositories 

> 2. https://github.com/COMP-4350-Group-6/budgetwise/blob/main/apps/api/src/routes/transactions.int.test.ts 
- exercises the transactions HTTP endpoint end to end through request validation, use case execution, and persistence, asserting status codes, response structure, and correct updates to stored data and aggregates 

> 3. https://github.com/COMP-4350-Group-6/budgetwise/blob/main/packages/adapters/auth-supabase/src/index.int.test.ts 
- validates the Supabase auth adapter against domain auth ports, covering session and token handling, error mapping, and overall adapter-domain contract compliance ### Integration Tests

### Acceptance Tests

> [!WARNING]
> {MISSING_TODO}

## 4. Reproducible Environments

> [!WARNING]
> {MISSING_TODO}