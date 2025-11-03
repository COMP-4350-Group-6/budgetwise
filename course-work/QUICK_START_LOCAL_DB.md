# Quick Start - Local Database Setup

**Goal:** Get BudgetWise running with a local Supabase database in 5 minutes.

---

## Prerequisites

- Docker Desktop installed and running
- Supabase CLI installed: `brew install supabase/tap/supabase`
- Node.js 18+ and pnpm

---

## Step 1: Start Local Supabase

```sh
cd infra/supabase
supabase start
```

**What this does:**
- Downloads Docker images (first time only)
- Starts PostgreSQL database
- Applies migration (creates tables)
- Generates local API keys

**Output you'll see:**
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
      Studio URL: http://127.0.0.1:54323
  Publishable key: eyJhbG... ← COPY THIS
      Secret key: eyJhbG... ← COPY THIS (service_role key)
```

**⚠️ IMPORTANT:** Keep this terminal output - you'll need these keys for steps 2 and 3!

Note: There's no line labeled "JWT secret" - the Secret key IS the service_role key, and there's a separate JWT secret used internally.

---

## Step 2: Configure API

Edit `apps/api/.dev.vars` and add the keys from `supabase start` output:

```env
# Look at the terminal output from `supabase start` and copy these:
SUPABASE_JWT_SECRET=<find in supabase start output under "JWT secret">
SUPABASE_SERVICE_ROLE_KEY=<copy "Secret key" from supabase start output>

# Optional: Leave empty if you don't have OpenRouter
OPENROUTER_API_KEY=
```

**Where to find the values:**

When you ran `supabase start`, you should have seen output like:
```
Started supabase local development setup.

...
      JWT secret: super-secret-jwt-token...  ← THIS IS SUPABASE_JWT_SECRET
...
      Secret key: eyJhbGciOiJ...             ← THIS IS SUPABASE_SERVICE_ROLE_KEY
```

**Verify API URL** in `apps/api/wrangler.jsonc`:
```jsonc
{
  "vars": {
    "SUPABASE_URL": "http://127.0.0.1:54321"  ← Should be LOCAL
  }
}
```

---

## Step 3: Configure Frontend

Edit `apps/frontend/.env.local` and add the Publishable key from step 1:

```env
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<paste "Publishable key" from supabase start>
```

**Example of what you're looking for in `supabase start` output:**
```
Publishable key: eyJhbGciOiJI...  ← PASTE THIS VALUE
```

---

## Step 4: Start Development Servers

### Terminal 1: API (if not already running)
```sh
cd apps/api
pnpm dev
```

**Look for:** `[Container] Using LOCAL Supabase at http://127.0.0.1:54321`

### Terminal 2: Frontend (MUST RESTART)
```sh
# Stop if running (Ctrl+C), then:
cd apps/frontend
pnpm dev
```

**Why restart?** Next.js only loads `.env.local` at startup.

---

## Step 5: Test It Works

1. **Open:** `http://localhost:3000`
2. **Sign up:** Create new account
3. **Verify:** 
   - No 401 errors
   - You can see the home page
   - Default categories load

---

## How Authentication Works (Simple)

```
┌──────────────┐
│   Frontend   │ Connects to local Supabase (127.0.0.1:54321)
└──────┬───────┘
       │ Signup/Login
       ↓
┌──────────────┐
│ Local Supabase│ Issues JWT token (signed with local secret)
└──────┬───────┘
       │ Token
       ↓
┌──────────────┐
│   Frontend   │ Sends request with token
└──────┬───────┘
       │ API call with: Authorization: Bearer <token>
       ↓
┌──────────────┐
│     API      │ Detects local URL → Uses local JWT secret → Verifies token
└──────┬───────┘
       │ Valid! Extract user ID
       ↓
┌──────────────┐
│   Database   │ Returns user's data only (RLS policies)
└──────────────┘
```

**Key Point:** Frontend and API must use the **same Supabase instance** (both local or both cloud).

---

## Troubleshooting

### 401 Unauthorized Errors

**Cause:** Frontend and API using different Supabase instances.

**Fix:**
1. Check both use `http://127.0.0.1:54321`:
   - `apps/api/wrangler.jsonc` → `SUPABASE_URL`
   - `apps/frontend/.env.local` → `NEXT_PUBLIC_SUPABASE_URL`
2. **Restart frontend** to load new config
3. Sign in again with a NEW account

### Tables Don't Exist

**Cause:** Migration not applied.

**Fix:**
```sh
cd infra/supabase
supabase db reset  # Reapplies migration
```

### Port Already in Use

**Cause:** Another Supabase instance running.

**Fix:**
```sh
supabase stop --all  # Stops all Supabase instances
cd infra/supabase
supabase start       # Start this project
```

---

## Switching to Cloud (When Needed)

### For Cloud Testing

**1. Update API** (`apps/api/wrangler.jsonc`):
```jsonc
"SUPABASE_URL": "https://yikylzhrskotiqnaitwz.supabase.co"
```

**2. Update Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://yikylzhrskotiqnaitwz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<get from Supabase Dashboard>
```

**3. Restart both servers**

The system **automatically detects** cloud URL and uses cloud secrets from `.dev.vars`.

### Back to Local

**1. Update API** (`apps/api/wrangler.jsonc`):
```jsonc
"SUPABASE_URL": "http://127.0.0.1:54321"
```

**2. Update Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<from supabase start output>
```

**3. Restart both servers**

---

## What Gets Auto-Detected

When you change the `SUPABASE_URL`:

**Local URL** (`http://127.0.0.1:54321`):
- ✅ Uses built-in local JWT secret
- ✅ Uses built-in local service role key
- ✅ No secrets needed in `.dev.vars`

**Cloud URL** (`https://....supabase.co`):
- ✅ Uses `SUPABASE_JWT_SECRET` from `.dev.vars`
- ✅ Uses `SUPABASE_SERVICE_ROLE_KEY` from `.dev.vars`
- ✅ Requires proper secrets configured

**You only change the URL** - everything else is automatic!

---

## Local Supabase Commands

```sh
# Start Supabase
cd infra/supabase && supabase start

# Check status
supabase status

# View Studio (database UI)
open http://127.0.0.1:54323

# Reset database (fresh start)
supabase db reset

# Stop Supabase
supabase stop
```

---

## That's It!

You now have:
- ✅ Local Supabase running with all tables
- ✅ Automatic key detection (no secret management)
- ✅ Easy switching between local and cloud
- ✅ Complete offline development capability

**Just restart your frontend** and you're ready to test PR #122!