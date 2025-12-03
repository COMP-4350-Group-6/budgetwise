# Setup Complete - Action Required

Your local Supabase is running! You need to copy some keys to complete the setup.

---

## What You Need to Do

### Step 1: Get Your Keys

In the terminal where you ran `supabase start`, you should see output like this:

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
      Studio URL: http://127.0.0.1:54323
         ...
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
  Publishable key: eyJhbGci...  ← COPY THIS
      Secret key: eyJhbGci...  ← COPY THIS
```

**You need 3 values:**
1. **JWT secret** (labeled "JWT secret")
2. **Service Role Key** (labeled "Secret key") 
3. **Publishable Key** (labeled "Publishable key")

---

### Step 2: Update API Environment

Edit `apps/api/.dev.vars`:

```env
# Paste the values you copied:
SUPABASE_JWT_SECRET=<paste JWT secret here>
SUPABASE_SERVICE_ROLE_KEY=<paste Secret key here>

# Optional (leave empty if you don't have it):
OPENROUTER_API_KEY=
```

---

### Step 3: Update Frontend Environment

Edit `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<paste Publishable key here>
```

---

### Step 4: Restart Servers

**Restart API:**
```sh
# In API terminal, press Ctrl+C
cd apps/api
pnpm dev
```

**Restart Frontend:**
```sh
# In frontend terminal, press Ctrl+C  
cd apps/frontend
pnpm dev
```

---

## Test It Works

1. Open `http://localhost:3000`
2. Sign up: `test@local.dev` / `Test1234!`
3. ✅ No 401 errors
4. ✅ You can see categories, create budgets

---

## If You Lost the Keys

Run this command to see them again:

```sh
cd infra/supabase
supabase status
```

It will show the same keys you need.

---

## Cloud vs Local

### Current Setup (Local)

```
API:      http://127.0.0.1:54321
Frontend: http://127.0.0.1:54321
Database: Local Docker
Keys:     From `supabase start`
```

### To Switch to Cloud

**1. Update** `apps/api/wrangler.jsonc`:
```jsonc
"SUPABASE_URL": "https://yikylzhrskotiqnaitwz.supabase.co"
```

**2. Update** `apps/api/.dev.vars` with cloud keys from Supabase Dashboard

**3. Update** `apps/frontend/.env.local` with cloud URL and key

**4. Restart both servers**

---

## That's It!

Once you've completed steps 1-4 above, your local development environment is ready.

For more details, see:
- [`QUICK_START_LOCAL_DB.md`](./QUICK_START_LOCAL_DB.md) - Original quick start
- [`LOCAL_DEVELOPMENT_GUIDE.md`](./LOCAL_DEVELOPMENT_GUIDE.md) - Full guide