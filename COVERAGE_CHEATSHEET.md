# Coverage Commands Cheat Sheet

## Quick Commands

### Generate Full Repo Coverage
```bash
# Option 1: All-in-one (run tests + merge + generate HTML + open)
pnpm run coverage:report

# Option 2: Run tests and merge only
pnpm run test:coverage

# Option 3: Step by step
pnpm test -- --coverage          # Run all tests with coverage
pnpm run coverage:merge          # Merge reports
pnpm run coverage:html           # Generate HTML (requires: sudo apt-get install lcov)
pnpm run coverage:view           # Open in browser
```

### Per-Package Coverage
```bash
pnpm --filter frontend test -- --coverage
pnpm --filter api test -- --coverage
pnpm --filter @budget/domain test -- --coverage
pnpm --filter @budget/usecases test -- --coverage
```

## Prerequisites

**Install lcov** (required for HTML report generation):

```bash
# Ubuntu/Debian
sudo apt-get install lcov

# macOS
brew install lcov
```

## Coverage File Locations

| Location | Description |
|----------|-------------|
| `coverage/lcov.info` | **Merged** coverage for entire repo |
| `coverage/html/index.html` | **Merged** HTML report |
| `apps/api/coverage/` | API-only coverage |
| `apps/frontend/coverage/` | Frontend-only coverage |
| `packages/domain/coverage/` | Domain-only coverage |
| `packages/usecases/coverage/` | Use cases-only coverage |

## Viewing Reports

```bash
# All-in-one: View merged HTML report
pnpm run coverage:view

# Manual: View merged HTML report (Linux)
xdg-open coverage/html/index.html

# Manual: View merged HTML report (macOS)
open coverage/html/index.html

# View specific package reports
open apps/frontend/coverage/index.html
open apps/api/coverage/lcov-report/index.html
open packages/domain/coverage/index.html
```

## Coverage Thresholds

| Package | Lines | Functions | Branches | Statements |
|---------|-------|-----------|----------|------------|
| **Domain** | 90% | 90% | 80% | 90% |
| **Use Cases** | 85% | 85% | 75% | 85% |
| **API** | 80% | 80% | 70% | 80% |
| **Frontend** | 50% | 50% | 40% | 50% |

## Troubleshooting

### No coverage reports found?
```bash
# Make sure to run tests with --coverage first
pnpm test -- --coverage
```

### genhtml not found?
```bash
# macOS
brew install lcov

# Ubuntu/Debian
sudo apt-get install lcov

# Or use npx (no install needed)
npx genhtml coverage/lcov.info -o coverage/html
```

### Want to see coverage for new packages?
Edit `scripts/merge-coverage.mjs` and add to `COVERAGE_SOURCES` array.

## CI/CD Usage

```yaml
# GitHub Actions
- name: Run tests with coverage
  run: pnpm run test:coverage

- name: Upload to Codecov
  uses: codecov/codecov-action@v4
  with:
    file: ./coverage/lcov.info
```

## See Also

- [COVERAGE_GUIDE.md](./COVERAGE_GUIDE.md) - Full documentation
- [TESTING.md](./TESTING.md) - Testing strategy
