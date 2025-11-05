# BudgetWise API Profiler

Performance testing tool for the BudgetWise API that measures response times across all endpoints.

## Prerequisites

### 1. Configure API for Local Development

**Enable local Supabase in [`apps/api/wrangler.jsonc`](../apps/api/wrangler.jsonc):**
```jsonc
{
  "vars": {
    "SUPABASE_URL": "http://127.0.0.1:54321"  // ← Uncomment this line
  }
}
```

**Add local JWT secret to [`apps/api/.dev.vars`](../apps/api/.dev.vars):**
```env
SUPABASE_LOCAL_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
```

> **Note:** This enables HS256 token verification for local Supabase. See [Environment Configuration](#environment-configuration) below for cloud setup.

### 2. Start Local Supabase
```bash
cd infra/supabase
supabase start
```

### 3. Start API Server
```bash
cd apps/api
pnpm dev
```

Expected output:
```
[Container] Using LOCAL Supabase at http://127.0.0.1:54321
[wrangler:inf] Ready on http://localhost:8787
```

### 4. User Account
Ensure you have a user account in your local Supabase (or use existing credentials)

## Quick Start

### Step 1: Get Authentication Token

```bash
cd profiler
bash scripts/getAuthToken.sh <your-email> <your-password>
```

**Example:**
```bash
bash scripts/getAuthToken.sh ahnaf.ahsan1123@gmail.com Testing112#
```

This script will:
- Automatically load Supabase config from [`apps/frontend/.env.local`](../apps/frontend/.env.local)
- Authenticate with your local Supabase
- Display your auth token

**Output:**
```
Loading local Supabase config from apps/frontend/.env.local
Using Supabase URL: http://127.0.0.1:54321

Login successful

Auth Token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Use this token with the profiler:
  bash scripts/profilerApi.sh "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 2: Run Profiler

```bash
bash scripts/profilerApi.sh "<AUTH_TOKEN_FROM_STEP_1>"
```

**Example:**
```bash
bash scripts/profilerApi.sh "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### One-Liner (Recommended)

Combine both steps:

```bash
cd profiler && \
AUTH_TOKEN=$(bash scripts/getAuthToken.sh your-email@example.com YourPassword123! 2>&1 | grep -A 1 "Auth Token:" | tail -n 1 | xargs) && \
bash scripts/profilerApi.sh "$AUTH_TOKEN"
```

## What Gets Tested

The profiler tests all API endpoints:

### Health & Info
- `GET /health` - Health check
- `GET /auth` - Auth info

### Authentication (No Auth)
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset

### Authentication (With Auth)
- `GET /auth/me` - Current user
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token

### Categories
- `GET /categories` - List all categories
- `GET /categories?active=true` - List active categories
- `POST /categories/seed` - Seed default categories
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Budgets
- `GET /budgets` - List all budgets
- `GET /budgets?active=true` - List active budgets
- `GET /budgets/dashboard` - Budget dashboard
- `GET /budgets/:id/status` - Budget status
- `POST /budgets` - Create budget
- `PUT /budgets/:id` - Update budget
- `DELETE /budgets/:id` - Delete budget

### Transactions
- `GET /transactions` - List transactions
- `GET /transactions?days=30&limit=50` - Filtered transactions
- `POST /transactions` - Create transaction
- `POST /transactions/bulk-import` - Bulk import
- `PATCH /transactions/:id` - Update transaction
- `POST /transactions/:id/categorize` - Auto-categorize
- `DELETE /transactions/:id` - Delete transaction
- `POST /transactions/parse-invoice` - Parse invoice image

## Output

Results are saved to `profiler-results/output-<timestamp>.txt`

**Console Output Example:**
```
Starting API profiling...

Health & Info Endpoints:
✓ GET /health - 45ms - Status: 200
✓ GET /auth - 52ms - Status: 200

Auth Endpoints (No Auth Required):
✓ POST /auth/signup - 234ms - Status: 201
✓ POST /auth/login - 187ms - Status: 200

...

Profiling Results Summary

Slowest Endpoints:
────────────────────────────────────────────────────────────────
 1. POST   /transactions/parse-invoice                1234ms  Status: 200
 2. POST   /budgets/dashboard                          456ms  Status: 200
 3. POST   /transactions/bulk-import                   345ms  Status: 201
...

Statistics:
────────────────────────────────────────────────────────────────
Total Endpoints Tested: 28
Total Time: 8532ms
Average Response Time: 304.71ms
Slowest: POST /transactions/parse-invoice - 1234ms
Fastest: GET /health - 45ms

Results saved to: profiler-results/output-20251105-161523.txt
```

## Configuration

### Custom API URL

To test against a different API endpoint:

```bash
export API_URL='http://localhost:3000'
bash scripts/profilerApi.sh "$AUTH_TOKEN"
```

### Custom Supabase

To override the automatic detection:

```bash
export SUPABASE_URL='https://your-project.supabase.co'
export SUPABASE_ANON_KEY='your-anon-key'
bash scripts/getAuthToken.sh user@example.com password
```

## Troubleshooting

### "Error: Missing Supabase credentials"

**Solution:**
- Ensure [`apps/frontend/.env.local`](../apps/frontend/.env.local) exists with local Supabase config
- Or manually export the variables:
  ```bash
  export SUPABASE_URL='http://127.0.0.1:54321'
  export SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  ```

### "Login failed"

**Possible causes:**
1. Supabase not running - Run `supabase status` in `infra/supabase/`
2. Wrong credentials - Double-check email/password
3. User doesn't exist - Sign up first through the app or API

### Connection errors

**Solution:**
1. Verify API is running: `curl http://localhost:8787/health`
2. Check Supabase is running: `supabase status` (in `infra/supabase/`)
3. Ensure ports aren't blocked

## Files

- [`scripts/getAuthToken.sh`](scripts/getAuthToken.sh) - Get JWT token from Supabase
- [`scripts/profilerApi.sh`](scripts/profilerApi.sh) - Run API profiler
- `profiler-results/` - Timestamped results

## Related Documentation

- [Local Development Guide](../course-work/LOCAL_DEVELOPMENT_GUIDE.md)
- [API Routes](../apps/api/src/routes/)
- [Testing Guide](../TESTING.md)