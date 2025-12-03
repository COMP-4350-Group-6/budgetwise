# Local Supabase Setup - Complete Guide

**What this guide covers:** How to run BudgetWise with a local database, understanding the keys, and switching between local/cloud environments.

---

## Why Local Development?

✅ **Offline development** - No internet needed  
✅ **Free unlimited testing** - No cloud costs  
✅ **Faster iteration** - No network latency  
✅ **Easy reset** - Fresh database anytime  
✅ **Isolated data** - Your data stays on your machine  

---

## Quick Setup (5 Minutes)

### 1. Start Local Supabase

```sh
cd infra/supabase
supabase start
```

**First time:** Downloads Docker images (~1-2 GB), takes a few minutes  
**After that:** Starts instantly

**IMPORTANT:** Keep the terminal output! You'll need the keys shown.

### 2. Copy Keys to API

Look at the `supabase start` output and find these 3 lines:

```
JWT secret: <a long string>           ← Find this line
Publishable key: <starts with eyJ>    ← Find this line  
Secret key: <starts with eyJ>         ← Find this line
```

**Open** `apps/api/.dev.vars` and paste:

```env
SUPABASE_JWT_SECRET=<paste "JWT secret" value>
SUPABASE_SERVICE_ROLE_KEY=<paste "Secret key" value>

OPENROUTER_API_KEY=
```

### 3. Copy Key to Frontend

**Open** `apps/frontend/.env.local` and paste:

```env
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<paste "Publishable key" value>
```

### 4. Restart Both Servers

```sh
# Terminal 1: API
cd apps/api
pnpm dev

# Terminal 2: Frontend (must restart!)
cd apps/frontend
pnpm dev
```

### 5. Test

1. Open `http://localhost:3000`
2. Sign up with test account
3. ✅ No 401 errors = working!

---

## Understanding the Keys

### What Each Key Does

| Key | Label in Output | Where Used | Purpose |
|-----|----------------|------------|---------|
| **JWT Secret** | "JWT secret" | API middleware | Verify user tokens |
| **Service Role Key** | "Secret key" | API repositories | Database access (bypasses RLS) |
| **Publishable Key** | "Publishable key" | Frontend | Initialize Supabase client |

### Authentication Flow

```
1. Frontend signs user up
   → Uses Publishable Key to call Supabase Auth
   
2. Supabase returns JWT token
   → Token is signed with JWT Secret
   
3. Frontend sends API request with token
   → Authorization: Bearer <token>
   
4. API verifies token
   → Uses JWT Secret to check signature
   → Extracts user ID from token
   
5. API queries database
   → Uses Service Role Key (full access)
   → But only returns data for that user ID (RLS)
```

---

## Environment-Based Configuration

### How the System Works

The setup **requires keys in environment variables** for both local and cloud:

```
┌───────────────────────────────────────────────────┐
│  Environment Variables Drive Everything           │
├───────────────────────────────────────────────────┤
│                                                   │
│  apps/api/.dev.vars                               │
│  ├─ SUPABASE_JWT_SECRET ────────┐                │
│  └─ SUPABASE_SERVICE_ROLE_KEY ──┤                │
│                                  │                │
│  apps/api/wrangler.jsonc         │                │
│  └─ SUPABASE_URL ────────────────┤                │
│                                  ↓                │
│                          API Runtime              │
│                                  │                │
│                                  ↓                │
│                         Supabase Client           │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Key Point:** You must provide all keys via environment variables. There are no hardcoded defaults.

### Local Environment

**Keys come from:** `supabase start` output (same for everyone)

**Configuration:**
```
apps/api/wrangler.jsonc
  → SUPABASE_URL: "http://127.0.0.1:54321"

apps/api/.dev.vars  
  → SUPABASE_JWT_SECRET: <from supabase start>
  → SUPABASE_SERVICE_ROLE_KEY: <from supabase start>

apps/frontend/.env.local
  → NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321"
  → NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: <from supabase start>
```

### Cloud Environment

**Keys come from:** Supabase Dashboard → Settings → API

**Configuration:**
```
apps/api/wrangler.jsonc (or Cloudflare env vars)
  → SUPABASE_URL: "https://your-project.supabase.co"

apps/api/.dev.vars (or Cloudflare secrets)
  → SUPABASE_JWT_SECRET: <from dashboard>
  → SUPABASE_SERVICE_ROLE_KEY: <from dashboard>

apps/frontend/.env.local (or build env vars)
  → NEXT_PUBLIC_SUPABASE_URL: "https://your-project.supabase.co"
  → NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: <from dashboard>
```

---

## Switching Environments

### Local → Cloud

**1. Get cloud keys from** [Supabase Dashboard](https://supabase.com/dashboard/project/yikylzhrskotiqnaitwz/settings/api)

**2. Update API:**
```jsonc
// apps/api/wrangler.jsonc
"SUPABASE_URL": "https://yikylzhrskotiqnaitwz.supabase.co"
```

```env
# apps/api/.dev.vars
SUPABASE_JWT_SECRET=<cloud-jwt-secret>
SUPABASE_SERVICE_ROLE_KEY=<cloud-service-role-key>
```

**3. Update Frontend:**
```env
# apps/frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://yikylzhrskotiqnaitwz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<cloud-anon-key>
```

**4. Restart both servers**

### Cloud → Local

**1. Get local keys:** Run `supabase start` (or `supabase status` if already running)

**2. Update API:**
```jsonc
// apps/api/wrangler.jsonc
"SUPABASE_URL": "http://127.0.0.1:54321"
```

```env
# apps/api/.dev.vars
SUPABASE_JWT_SECRET=<from-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<from-supabase-start>
```

**3. Update Frontend:**
```env
# apps/frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<from-supabase-start>
```

**4. Restart both servers**

---

## Staging & Production

### Staging

Create a **separate Supabase project** for staging:

1. Go to https://supabase.com → Create new project
2. Name it `budgetwise-staging`
3. Get keys from Settings → API
4. Set in Cloudflare Workers environment variables (staging)
5. Set in Cloudflare Pages build environment (staging)

**Cloudflare Worker secrets (staging):**
```sh
wrangler secret put SUPABASE_JWT_SECRET --env staging
wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env staging
```

**Cloudflare Pages env vars (staging):**
```
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<staging-anon-key>
```

### Production

Same process as staging, but:
- Use production Supabase project
- Set in Cloudflare production environment
- Use `wrangler secret put` without `--env` flag

---

## Key Security

### What's Safe to Expose?

✅ **Publishable Key** - Public, safe in client code  
✅ **API URL** - Public  
✅ **Database URL structure** - Only connection info  

### What MUST Stay Secret?

❌ **JWT Secret** - Can forge user tokens  
❌ **Service Role Key** - Full database access  
❌ **Database Password** - Direct DB access  

### How We Keep Secrets Safe

**Local:**
- Keys from `supabase start` go in `.dev.vars` (gitignored)
- Same for all developers (safe to share internally)
- Not exposed in code

**Cloud:**
- Keys from Supabase Dashboard go in Cloudflare secrets
- Never committed to git
- Managed by Cloudflare

---

## Troubleshooting

### "Can't find keys in supabase start output"

Run `supabase status` - it shows the same keys:

```sh
cd infra/supabase
supabase status
```

### "401 Unauthorized errors"

**Cause:** Frontend and API using different Supabase instances (one local, one cloud)

**Fix:**
1. Make sure BOTH use SAME URL:
   - `apps/api/wrangler.jsonc` → `SUPABASE_URL`
   - `apps/frontend/.env.local` → `NEXT_PUBLIC_SUPABASE_URL`
2. Make sure keys are from the same instance
3. Restart BOTH servers
4. Clear browser storage and login again

### "Table doesn't exist"

**Fix:**
```sh
cd infra/supabase
supabase db reset  # Reapplies migrations
```

---

## Summary

### Current Setup (Local)

You now have:
- ✅ Local Supabase running in Docker
- ✅ All database tables created (profiles, categories, budgets, transactions)
- ✅ Environment variables configured from `supabase start` output
- ✅ No hardcoded secrets in code
- ✅ Ready for local development

### What You Configured

**3 Files Updated:**
1. `apps/api/.dev.vars` - API secrets from `supabase start`
2. `apps/frontend/.env.local` - Frontend key from `supabase start`
3. `apps/api/wrangler.jsonc` - URL set to `http://127.0.0.1:54321`

### What's Automatic

- Table creation (via migration)
- Default categories seeding (on user signup)
- RLS policy enforcement
- JWT token signing and verification

### Next Steps

1. **Restart frontend** if not done already
2. **Test signup/login** at `http://localhost:3000`
3. **Explore database** at `http://127.0.0.1:54323` (Supabase Studio)
4. **Start developing!**

---

## Related Guides

- [`QUICK_START_LOCAL_DB.md`](./QUICK_START_LOCAL_DB.md) - Quick reference
- [`LOCAL_DEVELOPMENT_GUIDE.md`](./LOCAL_DEVELOPMENT_GUIDE.md) - Full workflow guide  
- [`DB_TESTING_GUIDE.md`](./DB_TESTING_GUIDE.md) - Testing PR #122
- [`SETUP_COMPLETE.md`](./SETUP_COMPLETE.md) - Post-setup checklist

---

**Setup Date:** 2025-11-03  
**Supabase Status:** ✅ Running at http://127.0.0.1:54321  
**Database Tables:** ✅ All created and verified  
**Configuration:** ✅ Environment-based (no hardcoded secrets)