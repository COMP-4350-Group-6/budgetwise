# Quick Reference: Running Smoke Tests

## TL;DR - Just Run This

```bash
# From root directory - Production smoke tests (RELIABLE)
pnpm test:smoke:production
```

**Result**: 17 tests in ~12 seconds ✅

---

## One-Time Setup (If Browsers Missing)

```bash
pnpm --filter @budgetwise/e2e-tests run install:browsers
```

Downloads Chromium, Firefox, WebKit (~500MB). **Only needed once.**

---

## Common Commands

### Production Testing

```bash
# Fast & Reliable (Chromium only - 17 tests, ~12s)
pnpm test:smoke:production

# Comprehensive (All browsers - 85 tests, ~2-3min)
pnpm test:smoke:production:all
```

### Local Testing

```bash
# Must have dev servers running first:
# Terminal 1: cd apps/frontend && pnpm dev
# Terminal 2: cd apps/api && pnpm dev

# Then run tests:
pnpm test:smoke                    # Chromium only
pnpm test:smoke:all                # All browsers
```

### Debugging

```bash
cd e2e-tests

pnpm test:headed    # Watch tests run in browser
pnpm test:ui        # Interactive UI mode (best for debugging)
pnpm test:debug     # Step-by-step debugger
pnpm report         # View last test report
```

---

## Troubleshooting

### ❌ "Executable doesn't exist"

**Fix**: Install browsers
```bash
pnpm --filter @budgetwise/e2e-tests run install:browsers
```

### ❌ Tests failing locally

**Fix**: Start dev servers first
```bash
# Terminal 1
cd apps/frontend && pnpm dev

# Terminal 2
cd apps/api && pnpm dev

# Terminal 3
pnpm test:smoke
```

### ❌ "Connection refused"

**Fix**: Check URLs
```bash
# Production (should work)
curl -I https://budgetwise.ca

# Local (requires dev servers)
curl -I http://localhost:3000
```

---

## What Gets Tested?

✅ Frontend loads (homepage, login, signup)  
✅ API responds (health check, CORS, auth)  
✅ User flows work (redirects, errors)  
✅ Performance acceptable (< 5s loads)  
✅ Security headers present (HTTPS, CSP)  

**17 tests** that validate production is working correctly.

---

## Full Documentation

See [e2e-tests/README.md](./README.md) for complete details.
