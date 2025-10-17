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

> 1. https://github.com/COMP-4350-Group-6/budgetwise/blob/main/packages/domain/src/budget.test.ts
- checks Budget domain behavior in isolation (no I/O/framework)
- verifies constructor validation: non-negative integer amountCents, non-empty name, valid date window
- verifies alert logic at boundaries: thresholds 0%, 80%, zero budgets
- verifies time-window activation via isActive
- ensures domain invariants/business rules for thresholds, totals, and alerts before API/use cases

> 2. https://github.com/COMP-4350-Group-6/budgetwise/blob/main/packages/domain/src/category.test.ts
- checks Category domain validation in isolation
- verifies name rules: non-empty, not whitespace-only, max length, reject digits/special chars/emoji (as specified)
- verifies optional fields: description, icon, color
- verifies immutability expectations
- verifies timestamp preservation
- ensures consistent categorization logic for downstream budgets/transactions/dashboards

> 3. https://github.com/COMP-4350-Group-6/budgetwise/blob/main/packages/domain/src/user.test.ts
- checks User domain validation in isolation
- verifies robust email validation across numerous edge cases
- verifies name validation, including international/Unicode scenarios
- verifies currency handling
- verifies immutability and timestamp integrity
- ensures user data integrity independent of the auth adapter for signup/login/profile flows

### Integration Tests

> 1. https://github.com/COMP-4350-Group-6/budgetwise/blob/main/packages/usecases/src/integration/category-budget-transaction.integration.test.ts  
- checks the orchestration across categories, budgets, and transactions. then links records, aggregates spending into category and budget totals, and checks domain rules with integrated repositories 
- verifies you can create a category and one or more monthly budgets tied to it
- verifies adding transactions to that budget increases spent for the correct category/budget
- verifies the dashboard totals are correct (totalBudgetCents = sum of budgets, totalSpentCents = sum of relevant transactions, totalRemainingCents = budget − spent)
- verifies over-budget/alert thresholds flip when spend passes the limit
- verifies only the requesting user’s data is included and multiple budgets in one category are aggregated together

> 2. https://github.com/COMP-4350-Group-6/budgetwise/blob/main/apps/api/src/routes/transactions.int.test.ts 
- checks the transactions HTTP endpoint end to end through request validation, use case execution, and persistence, asserting status codes, response structure, and correct updates to stored data and aggregates 
- verifies POST /transactions with a valid body returns 201 and JSON including a generated id
- verifies the transaction is actually persisted and linked to the given budget/category
- verifies bad input is rejected with the right status code
- verifies downstream aggregates update, fetching data after the POST shows the new spent totals

> 3. https://github.com/COMP-4350-Group-6/budgetwise/blob/main/packages/adapters/auth-supabase/src/index.int.test.ts 
- validates the Supabase auth adapter against domain auth ports, covering session and token handling, error mapping, and overall adapter-domain contract compliance
- verifies getMe returns null when not signed in
- verifies login with valid test credentials creates a session and logout clears it

### Acceptance Tests

> [!WARNING]
> {MISSING_TODO}

## 4. Reproducible Environments

> [!WARNING]
> {MISSING_TODO}
