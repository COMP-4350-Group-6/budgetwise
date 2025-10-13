#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${1:-budgeting}"
NODE_VER_REQUIRED=18

echo "==> Creating repo: $APP_NAME"
mkdir -p "$APP_NAME" && cd "$APP_NAME"

echo "==> Git init"
git init -q

echo "==> Root files"
cat > .gitignore <<'EOF'
node_modules
dist
.next
.env*
.dev.vars
.DS_Store
.vscode
EOF

cat > .editorconfig <<'EOF'
root = true
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
EOF

cat > package.json <<'EOF'
{
  "name": "@root/budgeting",
  "private": true,
  "packageManager": "pnpm@9",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "typecheck": "turbo run typecheck",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "openapi:generate": "pnpm --filter @budget/schemas run openapi:generate && pnpm --filter @budget/sdk run generate"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.6.3",
    "eslint": "^9.11.0",
    "@types/node": "^20.14.12",
    "vitest": "^2.1.3",
    "zod": "^3.23.8",
    "hono": "^4.5.7"
  }
}
EOF

cat > pnpm-workspace.yaml <<'EOF'
packages:
  - "apps/*"
  - "packages/*"
  - "infra/*"
EOF

cat > turbo.json <<'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "dev": { "cache": false, "persistent": true },
    "build": { "outputs": ["dist/**"] },
    "typecheck": {},
    "lint": {},
    "test": {}
  }
}
EOF

cat > tsconfig.json <<'EOF'
{
  "extends": "./packages/config/tsconfig.base.json",
  "include": ["apps", "packages"]
}
EOF

# ---------------- packages/config ----------------
mkdir -p packages/config
cat > packages/config/package.json <<'EOF'
{
  "name": "@budget/config",
  "version": "0.0.0",
  "private": true
}
EOF

cat > packages/config/tsconfig.base.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@budget/domain/*": ["../domain/src/*"],
      "@budget/usecases/*": ["../usecases/src/*"],
      "@budget/ports/*": ["../ports/src/*"],
      "@budget/schemas/*": ["../schemas/src/*"]
    }
  }
}
EOF

# ---------------- packages/domain ----------------
mkdir -p packages/domain/src
cat > packages/domain/package.json <<'EOF'
{
  "name": "@budget/domain",
  "version": "0.0.0",
  "type": "module",
  "main": "dist/index.js",
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "dev": "pnpm build -w",
    "lint": "echo skip",
    "test": "vitest run"
  }
}
EOF

cat > packages/domain/tsconfig.json <<'EOF'
{
  "extends": "../config/tsconfig.base.json",
  "compilerOptions": { "outDir": "dist" },
  "include": ["src"]
}
EOF

cat > packages/domain/src/money.ts <<'EOF'
export class Money {
  constructor(public readonly cents: number) {
    if (!Number.isInteger(cents)) throw new Error("Money expects integer cents");
  }
  static fromCents(c: number) { return new Money(c); }
  add(other: Money) { return new Money(this.cents + other.cents); }
}
EOF

cat > packages/domain/src/transaction.ts <<'EOF'
export interface TransactionProps {
  id: string;
  userId: string;
  budgetId: string;
  amountCents: number;
  categoryId?: string;
  note?: string;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
export class Transaction {
  constructor(public readonly props: TransactionProps) {
    if (!Number.isInteger(props.amountCents)) throw new Error("amountCents must be integer");
  }
}
EOF

cat > packages/domain/src/index.ts <<'EOF'
export * from "./money";
export * from "./transaction";
EOF

# ---------------- packages/ports ----------------
mkdir -p packages/ports/src/repositories
cat > packages/ports/package.json <<'EOF'
{
  "name": "@budget/ports",
  "version": "0.0.0",
  "type": "module",
  "exports": { ".": "./src/index.ts" }
}
EOF

cat > packages/ports/src/clock.ts <<'EOF'
export interface ClockPort { now(): Date }
EOF

cat > packages/ports/src/id.ts <<'EOF'
export interface IdPort { ulid(): string }
EOF

cat > packages/ports/src/repositories/transactions-repo.ts <<'EOF'
import type { Transaction } from "@budget/domain/transaction";
export interface TransactionsRepo {
  getById(id: string): Promise<Transaction | null>;
  listByBudget(budgetId: string, limit?: number): Promise<Transaction[]>;
  create(tx: Transaction): Promise<void>;
  update(tx: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
}
EOF

cat > packages/ports/src/index.ts <<'EOF'
export * from "./clock";
export * from "./id";
export * from "./repositories/transactions-repo";
EOF

# ---------------- packages/usecases ----------------
mkdir -p packages/usecases/src/transactions
cat > packages/usecases/package.json <<'EOF'
{
  "name": "@budget/usecases",
  "version": "0.0.0",
  "type": "module",
  "exports": { ".": "./src/index.ts" }
}
EOF

cat > packages/usecases/src/transactions/add-transaction.ts <<'EOF'
import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo } from "@budget/ports";
import type { ClockPort, IdPort } from "@budget/ports";

export function makeAddTransaction(deps: { clock: ClockPort; id: IdPort; txRepo: TransactionsRepo }) {
  return async (input: {
    userId: string; budgetId: string; amountCents: number;
    categoryId?: string; note?: string; occurredAt: Date;
  }) => {
    const now = deps.clock.now();
    const tx = new Transaction({
      id: deps.id.ulid(),
      userId: input.userId,
      budgetId: input.budgetId,
      amountCents: input.amountCents,
      categoryId: input.categoryId,
      note: input.note,
      occurredAt: input.occurredAt,
      createdAt: now,
      updatedAt: now
    });
    await deps.txRepo.create(tx);
    return tx;
  };
}
EOF

cat > packages/usecases/src/index.ts <<'EOF'
export * from "./transactions/add-transaction";
EOF

# ---------------- packages/schemas ----------------
mkdir -p packages/schemas/src
cat > packages/schemas/package.json <<'EOF'
{
  "name": "@budget/schemas",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "openapi:generate": "node ./src/openapi-stub.cjs"
  },
  "dependencies": { "zod": "^3.23.8" }
}
EOF

cat > packages/schemas/src/transaction.schema.ts <<'EOF'
import { z } from "zod";
export const TransactionDTO = z.object({
  id: z.string(),
  userId: z.string(),
  budgetId: z.string(),
  amountCents: z.number().int(),
  categoryId: z.string().optional(),
  note: z.string().max(280).optional(),
  occurredAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type TransactionDTO = z.infer<typeof TransactionDTO>;
EOF

cat > packages/schemas/src/openapi-stub.cjs <<'EOF'
console.log("Placeholder: wire zod-to-openapi here later");
EOF

# ---------------- packages/adapters: in-mem ----------------
mkdir -p packages/adapters/persistence-inmem/src
cat > packages/adapters/persistence-inmem/package.json <<'EOF'
{
  "name": "@budget/adapters-persistence-inmem",
  "version": "0.0.0",
  "type": "module",
  "exports": { ".": "./src/index.ts" }
}
EOF

cat > packages/adapters/persistence-inmem/src/transactions-repo.ts <<'EOF'
import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo } from "@budget/ports";

export function makeInMemTransactionsRepo(): TransactionsRepo {
  const byId = new Map<string, Transaction>();
  return {
    async getById(id) { return byId.get(id) ?? null; },
    async listByBudget(budgetId, lim = 50) {
      return Array.from(byId.values()).filter(t => t.props.budgetId === budgetId).slice(0, lim);
    },
    async create(tx) { byId.set(tx.props.id, tx); },
    async update(tx) { byId.set(tx.props.id, tx); },
    async delete(id) { byId.delete(id); }
  };
}
EOF

cat > packages/adapters/persistence-inmem/src/index.ts <<'EOF'
export * from "./transactions-repo";
EOF

# ---------------- packages/adapters: firebase (stub) ----------------
mkdir -p packages/adapters/persistence-firebase/src
cat > packages/adapters/persistence-firebase/package.json <<'EOF'
{
  "name": "@budget/adapters-persistence-firebase",
  "version": "0.0.0",
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "peerDependencies": {
    "firebase": "^10.0.0"
  }
}
EOF

cat > packages/adapters/persistence-firebase/src/transactions-repo.ts <<'EOF'
import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo } from "@budget/ports";

// TODO: wire Firestore SDK here; stubbed for scaffold
export function makeFirebaseTransactionsRepo(): TransactionsRepo {
  throw new Error("Implement Firestore repo (use emulator in dev)");
}
EOF

cat > packages/adapters/persistence-firebase/src/index.ts <<'EOF'
export * from "./transactions-repo";
EOF

# ---------------- packages/adapters: system (clock/id) ----------------
mkdir -p packages/adapters/system/src
cat > packages/adapters/system/package.json <<'EOF'
{
  "name": "@budget/adapters-system",
  "version": "0.0.0",
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "dependencies": { "ulid": "^2.3.0" }
}
EOF

cat > packages/adapters/system/src/clock.ts <<'EOF'
import type { ClockPort } from "@budget/ports";
export const makeSystemClock = (): ClockPort => ({ now: () => new Date() });
EOF

cat > packages/adapters/system/src/id.ts <<'EOF'
import type { IdPort } from "@budget/ports";
import { monotonicFactory } from "ulid";
const mono = monotonicFactory();
export const makeUlid = (): IdPort => ({ ulid: () => mono() });
EOF

cat > packages/adapters/system/src/index.ts <<'EOF'
export * from "./clock";
export * from "./id";
EOF

# ---------------- packages/composition: cloudflare-worker ----------------
mkdir -p packages/composition/cloudflare-worker/src
cat > packages/composition/cloudflare-worker/package.json <<'EOF'
{
  "name": "@budget/composition-cloudflare-worker",
  "version": "0.0.0",
  "type": "module",
  "exports": { ".": "./src/index.ts" }
}
EOF

cat > packages/composition/cloudflare-worker/src/container.ts <<'EOF'
import { makeSystemClock, makeUlid } from "@budget/adapters-system";
import { makeInMemTransactionsRepo } from "@budget/adapters-persistence-inmem";
import { makeAddTransaction } from "@budget/usecases";

export function makeContainer(/* env: Env */) {
  const clock = makeSystemClock();
  const id = makeUlid();
  // Swap to Firebase repo later:
  const txRepo = makeInMemTransactionsRepo();
  return {
    usecases: {
      addTransaction: makeAddTransaction({ clock, id, txRepo })
    }
  };
}
EOF

cat > packages/composition/cloudflare-worker/src/index.ts <<'EOF'
export * from "./container";
EOF

# ---------------- apps/api (Cloudflare Worker, delivery adapter) ----------------
mkdir -p apps/api/src/routes apps/api/src/middleware
cat > apps/api/package.json <<'EOF'
{
  "name": "api",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "build": "tsc -p tsconfig.json && wrangler deploy --dry-run",
    "typecheck": "tsc -p tsconfig.json",
    "lint": "echo skip",
    "test": "vitest run"
  },
  "devDependencies": {
    "wrangler": "^3.99.0"
  },
  "dependencies": {
    "hono": "^4.5.7",
    "zod": "^3.23.8",
    "@budget/composition-cloudflare-worker": "workspace:*",
    "@budget/schemas": "workspace:*"
  }
}
EOF

cat > apps/api/tsconfig.json <<'EOF'
{
  "extends": "../../packages/config/tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "types": ["@cloudflare/workers-types"] },
  "include": ["src"]
}
EOF

cat > apps/api/wrangler.toml <<'EOF'
name = "budget-api"
main = "dist/index.js"
compatibility_date = "2025-05-05"
EOF

cat > apps/api/src/middleware/errors.ts <<'EOF'
import type { Context, Next } from "hono";
export async function errors(c: Context, next: Next) {
  try { await next(); }
  catch (e:any) {
    const status = e?.status ?? 500;
    return c.json({ error: e?.message ?? "Internal Error" }, status);
  }
}
EOF

cat > apps/api/src/routes/health.ts <<'EOF'
import { Hono } from "hono";
export const health = new Hono().get("/health", (c) => c.json({ ok: true }));
EOF

cat > apps/api/src/routes/transactions.ts <<'EOF'
import { Hono } from "hono";
import { z } from "zod";
import { makeContainer } from "@budget/composition-cloudflare-worker";

const schema = z.object({
  userId: z.string(),
  budgetId: z.string(),
  amountCents: z.number().int(),
  occurredAt: z.coerce.date(),
  note: z.string().max(280).optional(),
  categoryId: z.string().optional()
});

export const transactions = new Hono().post("/transactions", async (c) => {
  const input = schema.parse(await c.req.json());
  const { usecases } = makeContainer();
  const tx = await usecases.addTransaction(input);
  return c.json({ transaction: { ...tx.props, occurredAt: tx.props.occurredAt.toISOString(),
    createdAt: tx.props.createdAt.toISOString(), updatedAt: tx.props.updatedAt.toISOString() } }, 201);
});
EOF

cat > apps/api/src/app.ts <<'EOF'
import { Hono } from "hono";
import { errors } from "./middleware/errors";
import { health } from "./routes/health";
import { transactions } from "./routes/transactions";

export const app = new Hono();
app.use("*", errors);
app.route("/", health);
app.route("/", transactions);
EOF

cat > apps/api/src/index.ts <<'EOF'
import { app } from "./app";
export default app;
EOF

# ---------------- apps/web (placeholder, no UI) ----------------
mkdir -p apps/web/src/app
cat > apps/web/package.json <<'EOF'
{
  "name": "web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "echo 'Integrate OpenNext (@opennextjs/cloudflare) here later'",
    "build": "echo 'Handled by OpenNext adapter during deploy'",
    "typecheck": "tsc -p tsconfig.json",
    "lint": "echo skip"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}
EOF

cat > apps/web/tsconfig.json <<'EOF'
{
  "extends": "../../packages/config/tsconfig.base.json",
  "compilerOptions": { "outDir": "dist" },
  "include": ["src"]
}
EOF

cat > apps/web/src/app/page.tsx <<'EOF'
export default function Page(){ return null }
EOF

# ---------------- infra placeholders ----------------
mkdir -p infra/firebase infra/cloudflare
cat > infra/firebase/README.md <<'EOF'
# Firebase infra
- Add firebase.json, firestore.rules, storage.rules, and emulator config here.
EOF

cat > infra/cloudflare/README.md <<'EOF'
# Cloudflare infra
- Wrangler config lives in apps/api/wrangler.toml
- Bindings (KV/Queues/DO) and secrets can be added per environment.
EOF

echo "==> Done! Next steps:
1) cd $APP_NAME
2) pnpm install
3) pnpm --filter api dev    # runs the Cloudflare Worker locally
4) (Later) integrate OpenNext in apps/web using @opennextjs/cloudflare"
