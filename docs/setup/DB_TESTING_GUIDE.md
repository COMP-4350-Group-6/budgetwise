# Database Integration Testing Guide

This guide walks you through testing PR #122 (Supabase DB Integration) using **local Supabase**.

## Prerequisites

1. **Docker Desktop** (required for local Supabase)
   - Download: https://www.docker.com/products/docker-desktop
   - Ensure Docker is running before starting

2. **Supabase CLI**
   ```sh
   # macOS
   brew install supabase/tap/supabase
   
   # Verify installation
   supabase --version
   ```

3. **Node.js & pnpm**: Ensure you have Node.js 18+ and pnpm installed
   ```sh
   node --version  # Should be 18+
   pnpm --version
   ```

---

## Step 1: Checkout the PR Branch

```sh
git fetch origin
git checkout 107-setup-db
# or if you haven't pulled the branch yet:
# git checkout -b 107-setup-db origin/107-setup-db
```

---

## Step 2: Install Dependencies

```sh
pnpm install
```

This will install all workspace dependencies including the new `@supabase/supabase-js` package.

---

## Step 3: Start Local Supabase

```sh
cd infra/supabase
supabase start
```

**First-time setup:** This downloads Docker images (~1-2 GB) and may take a few minutes.

**Expected output:**
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
      Studio URL: http://127.0.0.1:54323
    Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
  Publishable key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
      Secret key: sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

**Key Point:** The migration (`0001_core_schema.sql`) is automatically applied! Tables are already created.

### Verify Tables Were Created

```sh
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "\dt public.*"
```

**Expected output:**
```
 Schema |     Name     | Type  |  Owner
--------+--------------+-------+----------
 public | budgets      | table | postgres
 public | categories   | table | postgres
 public | profiles     | table | postgres
 public | transactions | table | postgres
```

✅ All tables created with constraints, indexes, RLS policies, and triggers!

---

## Step 4: Configure Environment (Auto-Configured!)

**Good news:** The configuration is already set up for local development!

### API Configuration ✅
[`apps/api/wrangler.jsonc`](../apps/api/wrangler.jsonc)
```jsonc
{
  "vars": {
    "SUPABASE_URL": "http://127.0.0.1:54321"  // ← LOCAL
  }
}
```

### Frontend Configuration ✅
[`apps/frontend/.env.local`](../apps/frontend/.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

### JWT Auto-Detection ✅
**No manual secret management needed!**

The system automatically:
- Detects `127.0.0.1` in URL = LOCAL mode
- Uses hardcoded local JWT secret: `"super-secret-jwt-token-with-at-least-32-characters-long"`
- Works for all teammates without secret sharing

---

## Step 5: Start the Development Servers

### Terminal 1: Start API Server (if not running)

```sh
cd apps/api
pnpm dev
```

**Expected Output:**
```
⛅️ wrangler 4.42.2
─────────────────────────────────────────────
[Container] Using LOCAL Supabase at http://127.0.0.1:54321  ← Confirms local mode
Container initialized with Supabase: true

⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### Terminal 2: Restart Frontend

**IMPORTANT:** Frontend must be restarted to load the new `.env.local`:

```sh
# Stop the frontend (Ctrl+C)
cd apps/frontend
pnpm dev
```

**Why restart?** Next.js only loads `.env.local` at startup. Changes require restart.

---

## Step 6: Test Database Connectivity

### Method 1: Health Check Endpoint

Test the health endpoint to verify the API is running:

```sh
curl http://localhost:8787/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-03T19:30:00.000Z"
}
```

### Method 2: Test Auth Endpoints

**Sign Up a User:**

```sh
curl -X POST http://localhost:8787/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@example.com"
  },
  "session": {
    "access_token": "jwt-token-here",
    "refresh_token": "refresh-token-here"
  }
}
```

**Login:**

```sh
curl -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

---

## Step 7: Test Database Operations

After logging in, save the `access_token` from the response and use it for authenticated requests:

```sh
export TOKEN="your-access-token-here"
```

### Test Categories

**List Categories (should include default categories):**

```sh
curl http://localhost:8787/categories \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": "uuid-1",
    "userId": "your-user-id",
    "name": "Groceries",
    "description": "Food and household items",
    "icon": "🛒",
    "color": "#4CAF50",
    "createdAt": "2025-11-03T19:30:00.000Z",
    "updatedAt": "2025-11-03T19:30:00.000Z"
  },
  ...
]
```

**Create a Category:**

```sh
curl -X POST http://localhost:8787/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Entertainment",
    "description": "Movies, games, subscriptions",
    "icon": "🎮",
    "color": "#9C27B0"
  }'
```

### Test Budgets

**Create a Budget:**

```sh
curl -X POST http://localhost:8787/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "category-uuid-from-above",
    "name": "Monthly Groceries",
    "amountCents": 50000,
    "currency": "USD",
    "period": "MONTHLY",
    "startDate": "2025-11-01T00:00:00Z",
    "alertThreshold": 80
  }'
```

**List Budgets:**

```sh
curl http://localhost:8787/budgets \
  -H "Authorization: Bearer $TOKEN"
```

### Test Transactions

**Create a Transaction:**

```sh
curl -X POST http://localhost:8787/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "category-uuid-from-above",
    "description": "Weekly grocery shopping",
    "amountCents": 12500,
    "currency": "USD",
    "date": "2025-11-03T10:00:00Z",
    "type": "EXPENSE"
  }'
```

**List Transactions:**

```sh
curl http://localhost:8787/transactions \
  -H "Authorization: Bearer $TOKEN"
```

---

## Step 8: Verify Database in Local Supabase Studio

1. Open **Supabase Studio**: `http://127.0.0.1:54323`
2. Navigate to **Table Editor** (left sidebar)
3. Check each table to verify data:
   - Click `categories` → Should see 6 default categories for your user
   - Click `budgets` → Should see budgets you created
   - Click `transactions` → Should see transactions linked correctly

4. **Verify RLS Policies:**
   - Click on a table → "Policies" tab
   - Each table should have SELECT and ALL policies
   - Policies restrict data to `auth.uid() = user_id`

5. **Verify Constraints:**
   - Click on table → "Constraints" tab
   - Should see foreign keys, checks, and unique constraints

**Pro tip:** Use the SQL Editor to run custom queries:
```sql
-- Check categories for a user
SELECT * FROM public.categories WHERE user_id = 'your-user-id';

-- Check budgets with category names
SELECT b.*, c.name as category_name
FROM public.budgets b
JOIN public.categories c ON b.category_id = c.id
WHERE b.user_id = 'your-user-id';
```

---

## Step 9: Test Frontend Integration (Optional)

If you started the frontend server:

1. Open `http://localhost:3000`
2. Sign up or log in with your test account
3. Navigate through the app:
   - **Categories**: Should show default categories + any you created
   - **Budgets**: Create and view budgets
   - **Transactions**: Add and view transactions
4. Verify data persistence (refresh page, data should remain)

---

## Step 10: Run Automated Tests

### API Tests

```sh
cd apps/api
pnpm test
```

### Domain & Use Cases Tests

```sh
pnpm test --filter @budget/domain
pnpm test --filter @budget/usecases
```

### Integration Tests

```sh
cd apps/api
pnpm test transactions.int.test
```

---

## Troubleshooting

### Issue: "Cannot find base config file"

**Solution:** Already fixed! The tsconfig path was corrected in `packages/adapters/persistence/supabase/tsconfig.json`

### Issue: "Could not resolve @budget/domain"

**Solution:** Run `pnpm install` in the root directory to ensure all workspace links are established.

### Issue: "Authentication failed"

**Solutions:**
1. Verify `SUPABASE_JWT_SECRET` in `apps/api/.dev.vars` matches the one in Supabase Dashboard
2. Check that `SUPABASE_URL` in `wrangler.jsonc` is correct
3. Ensure the migration was run successfully

### Issue: "RLS policy violation"

**Solution:** 
1. Make sure you're using the `access_token` from login/signup in the Authorization header
2. Verify RLS policies were created by the migration
3. Check that `auth.uid()` matches your user ID in Supabase

### Issue: "No categories returned"

**Solution:**
1. The migration seeds default categories only after user signup
2. Try signing up a new user or manually run the seed function
3. Check the `categories` table in Supabase Dashboard

---

## Expected Test Results

After completing all steps, you should have:

✅ Local Supabase running at `http://127.0.0.1:54321`
✅ API server running with `[Container] Using LOCAL Supabase` in console
✅ Database tables created with constraints, indexes, RLS, triggers
✅ User can sign up and log in through the frontend
✅ 6 default categories automatically seeded for new users
✅ Categories, budgets, and transactions can be created via UI
✅ RLS policies prevent access to other users' data
✅ Frontend displays and interacts with local database data
✅ Data persists across page refreshes (stored in Docker volume)
✅ All automated tests pass

---

## Key Changes in This PR

According to the PR description, this integration:

1. **Added Supabase persistence layer** - Repository adapters for all entities
2. **Database migration** - Creates tables with constraints, indexes, and RLS
3. **Environment-based composition** - Automatically uses Supabase when env vars are set
4. **TypeScript improvements** - Stricter typing, proper serialization
5. **Clean Architecture compliance** - Domain → Ports → Adapters → Use Cases → Apps

---

## Switching to Cloud Supabase (If Needed)

To test against the cloud database:

1. **Update API URL** in `apps/api/wrangler.jsonc`:
   ```jsonc
   "SUPABASE_URL": "https://yikylzhrskotiqnaitwz.supabase.co"
   ```

2. **Update Frontend** in `apps/frontend/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://yikylzhrskotiqnaitwz.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<cloud-anon-key>
   ```

3. **Uncomment Cloud JWT** in `apps/api/.dev.vars`:
   ```env
   SUPABASE_JWT_SECRET=9kCj+7GdjxdyfjK6or1IZ3ErcQP2kOF3uLsSazUvP56hS5CPrJR0hYu9QJXF0Sm0SFc7ELL6uA3IElnWAgRWXg==
   ```

4. **Restart both servers**

The system will auto-detect the cloud URL and use the cloud JWT secret!

---

## Additional Resources

- [Local Supabase Studio](http://127.0.0.1:54323) - When local is running
- [Cloud Supabase Dashboard](https://supabase.com/dashboard/project/yikylzhrskotiqnaitwz) - For production
- [PR #122 Discussion](https://github.com/COMP-4350-Group-6/budgetwise/pull/122)
- [Local Development Guide](./LOCAL_DEVELOPMENT_GUIDE.md)
- [Clean Architecture Docs](../DESIGN.md)

---

## Questions?

If you encounter issues not covered here:
1. Check the PR comments for known issues
2. Review the console output for specific error messages
3. Verify environment variables are set correctly
4. Check Supabase Dashboard for RLS policy errors