# 🚀 BudgetWise Load Testing - Quick Start

Get up and running in 3 steps.

---

## Prerequisites

```bash
# Install k6 (macOS)
brew install k6

# Install k6 (Windows - use chocolatey)
choco install k6

# Install k6 (Linux)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

---

## Step 1: Setup (One-time)

```bash
cd load-tests
pnpm install
```

---

## Step 2: Create Test Users (One-time)

This creates 20 test users in Supabase with JWT tokens.

```bash
pnpm exec tsx create-test-users.ts
```

**Output:**
- `tokens.json` - 20 JWT tokens (one per user)
- `token.txt` - First user's token

---

## Step 3: Run the Load Test

```bash
k6 run -e BASE_URL=https://api.budgetwise.ca load-test.js
```

### Test Against Local Development

```bash
k6 run -e BASE_URL=http://localhost:8787 load-test.js
```

---

## Generated Reports

After running, you'll find:

| File | Description |
|------|-------------|
| `load-test-report-{timestamp}.html` | Visual HTML report with charts |
| `load-test-results-{timestamp}.json` | Raw metrics data |

Open the HTML file in a browser to view interactive charts.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `pnpm exec tsx create-test-users.ts` | Create test users & get tokens |
| `pnpm exec tsx seed-test-data.ts` | Seed categories for test users |
| `k6 run -e BASE_URL=... load-test.js` | Run the load test |

---

## Test Configuration

The test runs with:
- **20 concurrent users** (VUs)
- **2 minute duration** (30s ramp up, 1m sustained, 30s ramp down)
- **Endpoints tested:**
  - `GET /auth/me` - User authentication
  - `GET /v1/transactions` - List transactions
  - `GET /v1/categories` - List categories  
  - `POST /v1/transactions` - Create transaction
  - `POST /v1/transactions/parse-invoice` - LLM invoice parsing (5% of requests)

---

## Expected Results (Passing)

```
✓ http_req_duration: p(95) < 500ms
✓ http_req_failed: rate < 1%
✓ http_reqs: rate > 3.33/s (200 req/min)
```

---

## Troubleshooting

### "tokens.json not found"
Run `pnpm exec tsx create-test-users.ts` first.

### "401 Unauthorized" errors
Tokens may have expired. Re-run `pnpm exec tsx create-test-users.ts`.

### High error rate on invoice parsing
This is expected due to LLM rate limits. The 62% success rate under load is acceptable.

---

## Documentation

- [LOAD_TEST_REPORT.md](./LOAD_TEST_REPORT.md) - Full test report with analysis
- [README.md](./README.md) - Detailed documentation