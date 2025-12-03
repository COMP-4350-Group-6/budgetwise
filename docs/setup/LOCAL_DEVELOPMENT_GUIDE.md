# Local Development Guide with Supabase

This guide explains how to run BudgetWise completely locally using Supabase's local development environment.

## Why Local Development?

- **No cloud dependencies**: Develop offline without internet connection
- **Faster iteration**: No network latency
- **Free testing**: Unlimited requests and storage
- **Data isolation**: Each developer has their own database
- **Easy reset**: Start fresh anytime with `supabase db reset`

---

## Prerequisites

1. **Docker Desktop** (required for local Supabase)
   - Download: https://www.docker.com/products/docker-desktop
   - Ensure Docker is running before starting Supabase

2. **Supabase CLI**
   ```sh
   # macOS
   brew install supabase/tap/supabase
   
   # Windows (via scoop)
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   
   # Linux
   brew install supabase/tap/supabase
   ```

3. **Node.js 18+** and **pnpm**
   ```sh
   node --version  # Should be 18+
   pnpm --version
   ```

---

## Quick Start

### 1. Start Local Supabase

```sh
cd infra/supabase
supabase start
```

**First-time setup:** This will download Docker images (~1-2 GB) and may take a few minutes.

**Expected output:**
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Keep the terminal open or run in background with `supabase start &`

### 2. Configure API Environment

The API is already configured to auto-detect local Supabase! When `SUPABASE_URL` contains `localhost` or `127.0.0.1`, it automatically uses local credentials.

Verify your `apps/api/wrangler.jsonc`:
```jsonc
{
  "vars": {
    "SUPABASE_URL": "http://127.0.0.1:54321"
  }
}
```

### 3. Start the API Server

```sh
cd apps/api
pnpm dev
```

**Expected output:**
```
⛅️ wrangler 4.42.2
─────────────────────────────────────────────
[Container] Using LOCAL Supabase at http://127.0.0.1:54321
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### 4. Start the Frontend (Optional)

```sh
cd apps/frontend
pnpm dev
```

Frontend runs on `http://localhost:3000`

---

## How Auto-Detection Works

The system automatically detects local vs cloud Supabase based on the URL:

### Container Auto-Detection
[`packages/composition/cloudflare-worker/src/container.ts`](packages/composition/cloudflare-worker/src/container.ts:39)
```typescript
// Detects localhost or 127.0.0.1
function isLocalSupabase(url?: string): boolean {
  if (!url) return false;
  return url.includes('localhost') || url.includes('127.0.0.1');
}

// Auto-selects credentials
const isLocal = isLocalSupabase(supabaseUrl);
const supabaseServiceRoleKey = isLocal 
  ? LOCAL_SUPABASE_SERVICE_ROLE_KEY 
  : env?.SUPABASE_SERVICE_ROLE_KEY;
```

### Auth Middleware Auto-Detection
[`apps/api/src/middleware/auth.ts`](apps/api/src/middleware/auth.ts:17)
```typescript
// Auto-detects JWT secret
const jwtSecret = isLocal 
  ? LOCAL_SUPABASE_JWT_SECRET 
  : c.env?.SUPABASE_JWT_SECRET;
```

### What This Means for You

✅ **No .dev.vars changes needed** - Just change the URL in `wrangler.jsonc`  
✅ **No secret management** - Local secrets are hardcoded and safe  
✅ **Easy switching** - Toggle between local and cloud by changing one line  

---

## Testing the Setup

### 1. Check Supabase Studio

Open http://127.0.0.1:54323 to explore:
- **Table Editor**: View all tables (should see: profiles, categories, budgets, transactions)
- **SQL Editor**: Run queries
- **Authentication**: Manage users

### 2. Test API Endpoints

**Health check:**
```sh
curl http://localhost:8787/health
```

**Sign up a user:**
```sh
curl -X POST http://localhost:8787/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "DevPass123!"
  }'
```

**Expected response:**
```json
{
  "user": {"id": "...", "email": "dev@example.com"},
  "session": {"access_token": "...", "refresh_token": "..."}
}
```

### 3. Verify Default Categories

After signup, check that default categories were created:

```sh
# Save your token from signup
export TOKEN="your-access-token-here"

curl http://localhost:8787/categories \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 6 default categories (Groceries, Rent, Utilities, Transport, Health, Entertainment)

### 4. Check Database in Studio

1. Open http://127.0.0.1:54323
2. Go to Table Editor → `categories`
3. You should see the 6 default categories for your user

---

## Common Workflows

### Starting a Fresh Database

```sh
cd infra/supabase
supabase db reset
```

This will:
- Drop all tables
- Re-run migrations
- Seed default data
- Clear all users

### Stopping Supabase

```sh
cd infra/supabase
supabase stop
```

Add `--no-backup` to skip backup creation (faster).

### Viewing Logs

```sh
cd infra/supabase
supabase logs
```

### Accessing the Database Directly

```sh
# Using psql
supabase db connect

# Or use the connection string
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Creating New Migrations

```sh
cd infra/supabase
supabase migration new your_migration_name
```

Edit the generated file in `migrations/` then apply:
```sh
supabase db reset  # Resets and applies all migrations
```

---

## Switching Between Local and Cloud

### Use Local Supabase (Default)

`apps/api/wrangler.jsonc`:
```jsonc
{
  "vars": {
    "SUPABASE_URL": "http://127.0.0.1:54321"
  }
}
```

### Use Cloud Supabase

`apps/api/wrangler.jsonc`:
```jsonc
{
  "vars": {
    "SUPABASE_URL": "https://yikylzhrskotiqnaitwz.supabase.co"
  }
}
```

`apps/api/.dev.vars`:
```env
SUPABASE_JWT_SECRET=your-cloud-jwt-secret
```

**No other changes needed!** The auto-detection handles everything else.

---

## Troubleshooting

### Docker Not Running

**Error:**
```
Error: Cannot connect to the Docker daemon
```

**Solution:**
1. Open Docker Desktop
2. Wait for it to fully start
3. Run `supabase start` again

### Port Already in Use

**Error:**
```
Error: Port 54321 is already in use
```

**Solution:**
```sh
# Stop existing Supabase instance
supabase stop

# Or find and kill the process using the port
lsof -ti:54321 | xargs kill -9

# Start again
supabase start
```

### Migration Errors

**Error:**
```
Error: migration failed
```

**Solution:**
```sh
# Reset database completely
supabase db reset

# If that fails, stop and restart
supabase stop --no-backup
supabase start
```

### API Can't Connect to Supabase

**Symptoms:**
- "Using in-memory repositories" in console
- No data persists after restart

**Solution:**
1. Verify Supabase is running: `supabase status`
2. Check URL in `wrangler.jsonc` is `http://127.0.0.1:54321`
3. Restart API server

### Authentication Fails

**Error:**
```
Invalid token or Unauthorized errors
```

**Solutions:**
1. Ensure you're using the token from the signup/login response
2. Token format: `Bearer <actual-token>`
3. Check API logs for JWT secret mismatch
4. Verify SUPABASE_URL is pointing to the right instance

### Email Confirmations

**Issue:** Local Supabase doesn't send real emails

**Solution:**
- Local mode has email confirmations **disabled** by default
- View emails in Inbucket: http://127.0.0.1:54324
- Or check `infra/supabase/config.toml`:
  ```toml
  [auth.email]
  enable_confirmations = false  # Already set
  ```

---

## Development Best Practices

### 1. Always Start Supabase First

```sh
# Start Supabase
cd infra/supabase && supabase start

# Then start API
cd ../../apps/api && pnpm dev
```

### 2. Use Supabase Studio for Debugging

- **Table Editor**: View data, run queries
- **Auth**: Check user accounts
- **Logs**: See database errors
- **API**: Test endpoints

### 3. Reset Database Frequently

During active development, reset often to ensure migrations work:
```sh
supabase db reset
```

### 4. Check Migration Files

Before committing, verify migrations are idempotent:
```sh
# Apply twice, should not error
supabase db reset
supabase db reset
```

### 5. Test Both Local and Cloud

Before PR, test against both:
```sh
# Test local
# Change SUPABASE_URL to localhost, run tests

# Test cloud  
# Change SUPABASE_URL to cloud, run tests
```

---

## Environment Variable Summary

### Required for Local Development

In `apps/api/wrangler.jsonc`:
```jsonc
{
  "vars": {
    "SUPABASE_URL": "http://127.0.0.1:54321"
  }
}
```

### Optional

In `apps/api/.dev.vars`:
```env
# Not required for local Supabase (auto-detected)
# SUPABASE_JWT_SECRET=...

# Optional: For AI features
OPENROUTER_API_KEY=your-key-here
```

---

## Useful Commands Reference

```sh
# Supabase Commands
supabase start              # Start all services
supabase stop               # Stop all services
supabase status             # Check status
supabase db reset           # Reset database
supabase db diff            # Show schema changes
supabase migration new NAME # Create new migration
supabase logs               # View logs

# Database Access
supabase db connect         # psql to local DB

# Project Commands  
pnpm dev                    # Start dev server (from app dir)
pnpm test                   # Run tests
```

---

## Next Steps

After local setup is working:
1. Explore the [Database Testing Guide](./DB_TESTING_GUIDE.md)
2. Read about [Clean Architecture](../DESIGN.md)
3. Review the [Testing Strategy](../TESTING.md)
4. Check out the [API routes](../apps/api/src/routes/)

---

## Additional Resources

- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Project README](../README.md)