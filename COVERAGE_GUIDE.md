# Coverage Reporting Guide

## Overview

This repository uses a monorepo structure with multiple packages. This guide explains how to generate and merge test coverage reports across all packages.

## Quick Start

### Generate Full Repository Coverage

```bash
# Run tests with coverage across all packages and merge results
pnpm run test:coverage

# View the merged HTML report
open coverage/html/index.html
```

## Commands

### 1. Run Tests with Coverage (All Packages)

```bash
# Using Turborepo to run tests in all packages
pnpm run test:coverage
```

This will:
1. Run tests with `--coverage` flag in all packages (via Turbo)
2. Generate individual coverage reports in each package's `coverage/` directory
3. Merge all reports into `coverage/lcov.info` at the repository root

### 2. Run Coverage for Specific Package

```bash
# Frontend
pnpm --filter frontend test -- --coverage

# API
pnpm --filter api test -- --coverage

# Domain
pnpm --filter @budget/domain test -- --coverage

# Use cases
pnpm --filter @budget/usecases test -- --coverage

# Specific adapter
pnpm --filter @budget/adapters-system test -- --coverage
```

### 3. View Coverage Reports

#### Option A: HTML Report (Recommended)

**Prerequisites:** Install `lcov` system package (includes `genhtml` command)

```bash
# Ubuntu/Debian
sudo apt-get install lcov

# macOS
brew install lcov
```

**Generate and view HTML report:**

```bash
# All-in-one command (runs tests, merges, generates HTML, and opens)
pnpm run coverage:report

# Or step by step:
pnpm run test:coverage        # Run tests and merge coverage
pnpm run coverage:html        # Generate HTML from merged lcov.info
pnpm run coverage:view        # Open HTML report in browser
```

**Manual commands:**

```bash
# Generate HTML report from merged coverage
genhtml coverage/lcov.info -o coverage/html

# Open in browser (Linux)
xdg-open coverage/html/index.html

# Open in browser (macOS)
open coverage/html/index.html
```

#### Option B: Terminal Summary

```bash
# Using lcov-summary (install globally if needed)
npx lcov-summary coverage/lcov.info
```

#### Option C: Per-Package Reports

Each package has its own HTML report:

```bash
# Frontend coverage
open apps/frontend/coverage/index.html

# API coverage
open apps/api/coverage/lcov-report/index.html

# Domain coverage
open packages/domain/coverage/index.html
```

## Coverage Report Structure

```
budgetwise/
├── coverage/                    # 📊 MERGED coverage (repository-wide)
│   ├── lcov.info               # Merged LCOV data
│   └── html/                   # Generated HTML report
│       └── index.html
│
├── apps/
│   ├── api/
│   │   └── coverage/           # 📊 API-only coverage
│   │       ├── lcov.info
│   │       └── lcov-report/
│   │           └── index.html
│   │
│   └── frontend/
│       └── coverage/           # 📊 Frontend-only coverage
│           ├── lcov.info
│           └── index.html
│
└── packages/
    ├── domain/
    │   └── coverage/           # 📊 Domain-only coverage
    ├── usecases/
    │   └── coverage/           # 📊 Use cases-only coverage
    └── adapters/
        ├── system/
        │   └── coverage/       # 📊 System adapter coverage
        └── persistence/
            └── local/
                └── coverage/   # 📊 Local persistence coverage
```

## How Coverage Merging Works

### 1. Individual Package Coverage

Each package generates its own coverage report using Vitest's v8 coverage provider:

```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
    }
  }
});
```

### 2. Turbo Orchestration

Turborepo runs tests in parallel across all packages:

```json
// turbo.json
{
  "tasks": {
    "test": {
      "outputs": ["coverage/**"]
    }
  }
}
```

### 3. Merge Script

The `scripts/merge-coverage.mjs` script:
- Finds all `lcov.info` files in package coverage directories
- Adjusts file paths to be relative to repository root
- Combines all LCOV data into a single `coverage/lcov.info`

**Packages included in merge:**
- `apps/api`
- `apps/frontend`
- `packages/adapters/auth-supabase`
- `packages/adapters/persistence/local`
- `packages/adapters/persistence/supabase`
- `packages/adapters/services/openrouter`
- `packages/adapters/system`
- `packages/domain`
- `packages/usecases`

### 4. HTML Generation

Use `genhtml` (from lcov package) to convert the merged LCOV data to HTML:

```bash
npx genhtml coverage/lcov.info -o coverage/html
```

## Coverage Thresholds

### Per-Package Thresholds

Each package defines its own coverage thresholds:

**Frontend** (`apps/frontend/vitest.config.ts`):
```typescript
coverage: {
  thresholds: {
    lines: 50,
    statements: 50,
    branches: 40,
    functions: 50,
  }
}
```

**API** (`apps/api/vitest.config.ts`):
```typescript
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 70,
    statements: 80,
  }
}
```

**Domain** (`packages/domain/vitest.config.ts`):
```typescript
coverage: {
  thresholds: {
    lines: 90,
    functions: 90,
    branches: 80,
    statements: 90,
  }
}
```

**Use Cases** (`packages/usecases/vitest.config.ts`):
```typescript
coverage: {
  thresholds: {
    lines: 85,
    functions: 85,
    branches: 75,
    statements: 85,
  }
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests with Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests with coverage
        run: pnpm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: budgetwise-coverage
```

## Troubleshooting

### Coverage Reports Not Found

**Problem**: Script says "No coverage reports found"

**Solution**:
```bash
# Run tests with coverage first
pnpm run test -- --coverage

# Then merge
pnpm run coverage:merge
```

### Path Issues in Merged Report

**Problem**: File paths in merged report are incorrect

**Solution**: The merge script automatically adjusts paths. If issues persist:
1. Check that package names in `COVERAGE_SOURCES` match your directory structure
2. Ensure `lcov.info` files have consistent path formatting

### Missing Packages in Merged Report

**Problem**: Some packages don't appear in merged coverage

**Solution**:
1. Verify the package has tests that run
2. Check that the package is listed in `scripts/merge-coverage.mjs` `COVERAGE_SOURCES`
3. Ensure the package's `vitest.config.ts` has coverage enabled

### HTML Report Not Generating

**Problem**: `genhtml` command fails

**Solution**:
```bash
# Install lcov globally (contains genhtml)
brew install lcov  # macOS
sudo apt-get install lcov  # Ubuntu/Debian

# Or use npx to run without installing
npx genhtml coverage/lcov.info -o coverage/html
```

## Coverage Badges

### Generate Badge from Coverage Data

Using [shields.io](https://shields.io/):

```markdown
![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)
```

### Auto-generate from Coverage File

Using [coverage-badges-cli](https://www.npmjs.com/package/coverage-badges-cli):

```bash
npm install -g coverage-badges-cli
coverage-badges --output coverage-badge.svg
```

## Advanced Usage

### Coverage for Specific File Pattern

```bash
# Only test files matching pattern
pnpm test -- --coverage --coverage.include='src/**/*.ts'

# Exclude test files from coverage
pnpm test -- --coverage --coverage.exclude='**/*.test.ts'
```

### Watch Mode with Coverage

```bash
# Run in watch mode and update coverage
pnpm test -- --coverage --watch
```

### Export Coverage in Different Formats

Edit `vitest.config.ts`:

```typescript
coverage: {
  reporter: [
    'text',      // Terminal output
    'html',      // HTML report
    'lcov',      // LCOV format (for merging)
    'json',      // JSON format
    'cobertura'  // Cobertura XML (for Jenkins)
  ]
}
```

## Best Practices

1. **Run coverage locally before pushing**
   ```bash
   pnpm run test:coverage
   ```

2. **Check coverage trends** - Aim for coverage to increase or stay stable

3. **Focus on critical paths** - Prioritize coverage for:
   - Domain logic (90%+ target)
   - Use cases (85%+ target)
   - API routes (80%+ target)

4. **Don't chase 100%** - Some code doesn't need testing:
   - Type definitions
   - Configuration files
   - Simple glue code
   - Framework-generated code

5. **Review uncovered code** - Use HTML report to find untested branches

## Related Documentation

- [TESTING.md](../TESTING.md) - Overall testing strategy
- [FRONTEND_TEST_COVERAGE.md](../FRONTEND_TEST_COVERAGE.md) - Frontend-specific tests
- [TESTING_DATABASE_ADAPTERS.md](../TESTING_DATABASE_ADAPTERS.md) - Database testing
