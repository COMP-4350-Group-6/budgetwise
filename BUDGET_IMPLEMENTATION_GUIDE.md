# Budget System Implementation Guide

> **Complete guide for implementing the Budget System in BudgetWise**
> 
> Last Updated: 2025-10-15

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Integration](#frontend-integration)
5. [Testing](#testing)
6. [Deployment Checklist](#deployment-checklist)

---

## Overview

### Purpose

The Budget System allows users to:
- Define custom spending categories (or use defaults)
- Set budget limits per category with different time periods (daily/weekly/monthly/yearly)
- Track spending against budgets in real-time
- Receive alerts when approaching budget limits
- View comprehensive budget dashboards

### Key Features

- ✅ **Default Categories**: Auto-seed 16 predefined categories on user signup
- ✅ **Custom Categories**: Users can create, edit, and archive categories
- ✅ **Flexible Budgets**: Set budgets with daily/weekly/monthly/yearly periods
- ✅ **Real-time Tracking**: Calculate spending vs budget automatically
- ✅ **Smart Alerts**: Configurable thresholds (e.g., warn at 80%)
- ✅ **Visual Dashboard**: Color-coded progress bars and status indicators

---

## Architecture

### Data Flow

```
User → Categories → Budgets → Transactions → Budget Status → Dashboard
```

1. **Categories**: User-defined expense categories (Housing, Food, etc.)
2. **Budgets**: Spending limits assigned to categories with time periods
3. **Transactions**: Individual expenses linked to categories
4. **Budget Status**: Real-time calculation of spent vs budget
5. **Dashboard**: Aggregated view of all budget statuses

### Domain Model Relationships

```
User (1) ──→ (many) Categories
Category (1) ──→ (many) Budgets
Budget (1) ──→ (many) Transactions (via categoryId)
```

### Clean Architecture Layers

```
Frontend (Next.js)
    ↓
API Routes (Hono)
    ↓
Use Cases (Business Logic)
    ↓
Domain Entities (Budget, Category)
    ↓
Repositories (Data Access)
    ↓
Database (Firebase/In-Memory)
```

---

## Backend Implementation

### Phase 1: Domain Layer

#### Step 1.1: Create Category Domain Entity

**File**: `packages/domain/src/category.ts`

```typescript
export interface CategoryProps {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon?: string;          // Emoji or icon identifier
  color?: string;         // Hex color for UI (#RRGGBB)
  isDefault: boolean;     // Was this a seeded default?
  isActive: boolean;      // Can be archived (soft delete)
  sortOrder: number;      // Display order
  createdAt: Date;
  updatedAt: Date;
}

export class Category {
  constructor(public readonly props: CategoryProps) {
    // Validation
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Category name cannot be empty");
    }
    if (props.name.length > 50) {
      throw new Error("Category name too long");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get isDefault(): boolean {
    return this.props.isDefault;
  }
}
```

#### Step 1.2: Create Default Categories Configuration

**File**: `packages/domain/src/default-categories.ts`

```typescript
export interface DefaultCategoryConfig {
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const DEFAULT_CATEGORIES: DefaultCategoryConfig[] = [
  { name: "Housing", icon: "🏠", color: "#FF6B6B", description: "Rent, mortgage, property" },
  { name: "Transportation", icon: "🚗", color: "#4ECDC4", description: "Car, gas, public transit" },
  { name: "Food", icon: "🍔", color: "#95E1D3", description: "General food expenses" },
  { name: "Groceries", icon: "🛒", color: "#45B7D1", description: "Grocery shopping" },
  { name: "Dining Out", icon: "🍽️", color: "#F38181", description: "Restaurants, takeout" },
  { name: "Entertainment", icon: "🎬", color: "#AA96DA", description: "Movies, games, hobbies" },
  { name: "Shopping", icon: "🛍️", color: "#FCBAD3", description: "Clothing, personal items" },
  { name: "Utilities", icon: "💡", color: "#FFA07A", description: "Electric, water, internet" },
  { name: "Healthcare", icon: "⚕️", color: "#98D8C8", description: "Medical, insurance" },
  { name: "Education", icon: "📚", color: "#6C5CE7", description: "Tuition, courses, books" },
  { name: "Travel", icon: "✈️", color: "#00B894", description: "Trips, vacations" },
  { name: "Subscriptions", icon: "📱", color: "#FDCB6E", description: "Netflix, Spotify, etc." },
  { name: "Investments", icon: "💰", color: "#00CEC9", description: "Stocks, savings" },
  { name: "Salary", icon: "💵", color: "#55EFC4", description: "Income, wages" },
  { name: "Savings", icon: "🐷", color: "#81ECEC", description: "Emergency fund, goals" },
  { name: "Miscellaneous", icon: "📦", color: "#A29BFE", description: "Other expenses" },
];
```

**Update**: `packages/domain/src/index.ts`

```typescript
export * from "./category";
export * from "./default-categories";
// ... existing exports
```

#### Step 1.3: Update Budget Domain Entity

**Update**: `packages/domain/src/budget.ts`

```typescript
import { Money } from './money';
import type { Currency } from './money';

export type BudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface BudgetProps {
  id: string;
  userId: string;
  categoryId: string;        // REQUIRED - every budget must have a category
  name: string;              // Budget name (e.g., "Weekly Groceries")
  amountCents: number;       // Budget limit in cents
  currency: Currency;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;            // Optional end date
  isActive: boolean;         // Can be paused
  alertThreshold?: number;   // % to trigger warning (e.g., 80 = warn at 80%)
  createdAt: Date;
  updatedAt: Date;
}

export class Budget {
  constructor(public readonly props: BudgetProps) {
    if (!Number.isInteger(props.amountCents)) {
      throw new Error("amountCents must be integer");
    }
    if (props.amountCents < 0) {
      throw new Error("Budget amount cannot be negative");
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Budget name cannot be empty");
    }
    if (!props.categoryId) {
      throw new Error("Budget must have a category");
    }
    if (props.endDate && props.endDate < props.startDate) {
      throw new Error("End date cannot be before start date");
    }
    if (props.alertThreshold && (props.alertThreshold < 0 || props.alertThreshold > 100)) {
      throw new Error("Alert threshold must be between 0 and 100");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get amount(): Money {
    return Money.fromMinorDenomination(this.props.amountCents, this.props.currency);
  }

  get period(): BudgetPeriod {
    return this.props.period;
  }

  get categoryId(): string {
    return this.props.categoryId;
  }

  isActive(date: Date = new Date()): boolean {
    if (!this.props.isActive) return false;
    if (date < this.props.startDate) return false;
    if (this.props.endDate && date > this.props.endDate) return false;
    return true;
  }

  shouldAlert(spentCents: number): boolean {
    if (!this.props.alertThreshold) return false;
    const percentage = (spentCents / this.props.amountCents) * 100;
    return percentage >= this.props.alertThreshold;
  }
}
```

### Phase 2: Ports Layer (Interfaces)

#### Step 2.1: Create Category Repository Interface

**File**: `packages/ports/src/repositories/categories-repo.ts`

```typescript
import type { Category } from "@budget/domain/category";

export interface CategoriesRepo {
  getById(id: string): Promise<Category | null>;
  listByUser(userId: string): Promise<Category[]>;
  listActiveByUser(userId: string): Promise<Category[]>;
  create(category: Category): Promise<void>;
  update(category: Category): Promise<void>;
  delete(id: string): Promise<void>;
}
```

**Update**: `packages/ports/src/repositories/index.ts`

```typescript
export * from "./categories-repo";
export * from "./budgets-repo";
export * from "./transactions-repo";
export * from "./users-repo";
```

#### Step 2.2: Update Budgets Repository Interface

**Update**: `packages/ports/src/repositories/budgets-repo.ts`

```typescript
import type { Budget } from "@budget/domain/budget";

export interface BudgetsRepo {
  getById(id: string): Promise<Budget | null>;
  listByUser(userId: string): Promise<Budget[]>;
  listActiveByUser(userId: string, date?: Date): Promise<Budget[]>;
  listByCategory(userId: string, categoryId: string): Promise<Budget[]>;
  create(budget: Budget): Promise<void>;
  update(budget: Budget): Promise<void>;
  delete(id: string): Promise<void>;
}
```

#### Step 2.3: Update Transactions Repository Interface

**Update**: `packages/ports/src/repositories/transactions-repo.ts`

Add method for fetching transactions in a date range:

```typescript
import type { Transaction } from "@budget/domain/transaction";

export interface TransactionsRepo {
  // ... existing methods
  listByUserInPeriod(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
}
```

### Phase 3: Schemas Layer (Validation)

#### Step 3.1: Create Category Schemas

**File**: `packages/schemas/src/category.schema.ts`

```typescript
import { z } from "zod";

export const CreateCategoryInputSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(), // Hex color
  isActive: z.boolean().default(true),
});

export const UpdateCategoryInputSchema = CreateCategoryInputSchema.partial();

export const CategoryDTO = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.string(), // ISO date
  updatedAt: z.string(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategoryInputSchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryInputSchema>;
export type CategoryDTO = z.infer<typeof CategoryDTO>;
```

#### Step 3.2: Update Budget Schemas

**Update**: `packages/schemas/src/budget.schema.ts`

```typescript
import { z } from "zod";
import { CurrencySchema } from "./currency.schema";

export const BudgetPeriodSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);

export const CreateBudgetInputSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(1).max(100),
  amountCents: z.number().int().min(0),
  currency: CurrencySchema,
  period: BudgetPeriodSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  alertThreshold: z.number().min(0).max(100).optional(),
});

export const UpdateBudgetInputSchema = CreateBudgetInputSchema.partial();

export const BudgetDTO = z.object({
  id: z.string(),
  userId: z.string(),
  categoryId: z.string(),
  name: z.string(),
  amountCents: z.number().int(),
  currency: CurrencySchema,
  period: BudgetPeriodSchema,
  startDate: z.string(), // ISO date
  endDate: z.string().optional(),
  isActive: z.boolean(),
  alertThreshold: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateBudgetInput = z.infer<typeof CreateBudgetInputSchema>;
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetInputSchema>;
export type BudgetDTO = z.infer<typeof BudgetDTO>;
```

**Update**: `packages/schemas/src/index.ts`

```typescript
export * from "./category.schema";
export * from "./budget.schema";
// ... existing exports
```

### Phase 4: Use Cases Layer

#### Step 4.1: Category Use Cases

**File**: `packages/usecases/src/categories/create-category.ts`

```typescript
import { Category } from "@budget/domain";
import type { CategoriesRepo } from "@budget/ports";
import type { Clock, IdGenerator } from "@budget/ports/system";

export interface CreateCategoryInput {
  userId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

export function makeCreateCategory(deps: {
  categoriesRepo: CategoriesRepo;
  clock: Clock;
  id: IdGenerator;
}) {
  return async (input: CreateCategoryInput): Promise<Category> => {
    const now = deps.clock.now();
    
    // Check for duplicate category name
    const existing = await deps.categoriesRepo.listByUser(input.userId);
    if (existing.some(c => c.props.name.toLowerCase() === input.name.toLowerCase())) {
      throw new Error("Category with this name already exists");
    }
    
    const category = new Category({
      id: deps.id.generate(),
      userId: input.userId,
      name: input.name.trim(),
      description: input.description,
      icon: input.icon,
      color: input.color,
      isDefault: false,
      isActive: input.isActive ?? true,
      sortOrder: existing.length,
      createdAt: now,
      updatedAt: now,
    });
    
    await deps.categoriesRepo.create(category);
    return category;
  };
}
```

**File**: `packages/usecases/src/categories/seed-default-categories.ts`

```typescript
import { Category } from "@budget/domain";
import { DEFAULT_CATEGORIES } from "@budget/domain/default-categories";
import type { CategoriesRepo } from "@budget/ports";
import type { Clock, IdGenerator } from "@budget/ports/system";

export function makeSeedDefaultCategories(deps: {
  categoriesRepo: CategoriesRepo;
  clock: Clock;
  id: IdGenerator;
}) {
  return async (userId: string): Promise<Category[]> => {
    // Check if user already has categories
    const existing = await deps.categoriesRepo.listByUser(userId);
    if (existing.length > 0) {
      return existing; // Already seeded
    }

    const now = deps.clock.now();
    const categories: Category[] = [];

    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      const config = DEFAULT_CATEGORIES[i];
      const category = new Category({
        id: deps.id.generate(),
        userId,
        name: config.name,
        description: config.description,
        icon: config.icon,
        color: config.color,
        isDefault: true,
        isActive: true,
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
      });
      
      await deps.categoriesRepo.create(category);
      categories.push(category);
    }

    return categories;
  };
}
```

**Create additional category use cases**:
- `packages/usecases/src/categories/list-categories.ts`
- `packages/usecases/src/categories/update-category.ts`
- `packages/usecases/src/categories/delete-category.ts`

#### Step 4.2: Budget Use Cases

**File**: `packages/usecases/src/budgets/create-budget.ts`

```typescript
import { Budget } from "@budget/domain";
import type { BudgetsRepo } from "@budget/ports";
import type { Clock, IdGenerator } from "@budget/ports/system";
import type { Currency, BudgetPeriod } from "@budget/domain";

export interface CreateBudgetInput {
  userId: string;
  categoryId: string;
  name: string;
  amountCents: number;
  currency: Currency;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
  alertThreshold?: number;
}

export function makeCreateBudget(deps: {
  budgetsRepo: BudgetsRepo;
  clock: Clock;
  id: IdGenerator;
}) {
  return async (input: CreateBudgetInput): Promise<Budget> => {
    const now = deps.clock.now();
    
    const budget = new Budget({
      id: deps.id.generate(),
      userId: input.userId,
      categoryId: input.categoryId,
      name: input.name,
      amountCents: input.amountCents,
      currency: input.currency,
      period: input.period,
      startDate: input.startDate,
      endDate: input.endDate,
      isActive: true,
      alertThreshold: input.alertThreshold,
      createdAt: now,
      updatedAt: now,
    });
    
    await deps.budgetsRepo.create(budget);
    return budget;
  };
}
```

**File**: `packages/usecases/src/budgets/get-budget-status.ts`

```typescript
import type { BudgetsRepo, TransactionsRepo } from "@budget/ports";
import type { Clock } from "@budget/ports/system";
import type { Budget, BudgetPeriod } from "@budget/domain";

export interface BudgetStatus {
  budget: Budget;
  spentCents: number;
  remainingCents: number;
  percentageUsed: number;
  isOverBudget: boolean;
  shouldAlert: boolean;
  transactionCount: number;
}

export function makeGetBudgetStatus(deps: {
  budgetsRepo: BudgetsRepo;
  transactionsRepo: TransactionsRepo;
  clock: Clock;
}) {
  return async (budgetId: string, userId: string): Promise<BudgetStatus | null> => {
    const budget = await deps.budgetsRepo.getById(budgetId);
    if (!budget || budget.props.userId !== userId) {
      return null;
    }

    const now = deps.clock.now();
    const { startDate, endDate } = calculatePeriodDates(
      now,
      budget.props.period,
      budget.props.startDate
    );

    // Get transactions in this period for this category
    const transactions = await deps.transactionsRepo.listByUserInPeriod(
      userId,
      startDate,
      endDate
    );

    const categoryTransactions = transactions.filter(
      tx => tx.props.categoryId === budget.props.categoryId
    );
    
    const spentCents = categoryTransactions.reduce(
      (sum, tx) => sum + Math.abs(tx.props.amountCents),
      0
    );

    const remainingCents = budget.props.amountCents - spentCents;
    const percentageUsed = (spentCents / budget.props.amountCents) * 100;
    const isOverBudget = spentCents > budget.props.amountCents;
    const shouldAlert = budget.shouldAlert(spentCents);

    return {
      budget,
      spentCents,
      remainingCents,
      percentageUsed: Math.round(percentageUsed * 100) / 100,
      isOverBudget,
      shouldAlert,
      transactionCount: categoryTransactions.length,
    };
  };
}

function calculatePeriodDates(
  now: Date,
  period: BudgetPeriod,
  budgetStart: Date
): { startDate: Date; endDate: Date } {
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case 'DAILY':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'WEEKLY':
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'MONTHLY':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'YEARLY':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  if (start < budgetStart) {
    start.setTime(budgetStart.getTime());
  }

  return { startDate: start, endDate: end };
}
```

**File**: `packages/usecases/src/budgets/get-budget-dashboard.ts`

```typescript
import type { CategoriesRepo, BudgetsRepo, TransactionsRepo } from "@budget/ports";
import type { Clock } from "@budget/ports/system";
import type { BudgetStatus } from "./get-budget-status";
import { makeGetBudgetStatus } from "./get-budget-status";

export interface CategoryBudgetSummary {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  budgets: BudgetStatus[];
  totalBudgetCents: number;
  totalSpentCents: number;
  totalRemainingCents: number;
  overallPercentageUsed: number;
  hasOverBudget: boolean;
}

export interface BudgetDashboard {
  categories: CategoryBudgetSummary[];
  totalBudgetCents: number;
  totalSpentCents: number;
  overBudgetCount: number;
  alertCount: number;
}

export function makeGetBudgetDashboard(deps: {
  categoriesRepo: CategoriesRepo;
  budgetsRepo: BudgetsRepo;
  transactionsRepo: TransactionsRepo;
  clock: Clock;
}) {
  return async (userId: string): Promise<BudgetDashboard> => {
    const categories = await deps.categoriesRepo.listActiveByUser(userId);
    const allBudgets = await deps.budgetsRepo.listActiveByUser(userId);

    const getBudgetStatus = makeGetBudgetStatus(deps);
    
    const categorySummaries: CategoryBudgetSummary[] = [];
    let totalBudget = 0;
    let totalSpent = 0;
    let overBudgetCount = 0;
    let alertCount = 0;

    for (const category of categories) {
      const categoryBudgets = allBudgets.filter(
        b => b.props.categoryId === category.id
      );

      if (categoryBudgets.length === 0) continue;

      const budgetStatuses: BudgetStatus[] = [];
      let categoryBudgetTotal = 0;
      let categorySpentTotal = 0;

      for (const budget of categoryBudgets) {
        const status = await getBudgetStatus(budget.id, userId);
        if (status) {
          budgetStatuses.push(status);
          categoryBudgetTotal += status.budget.props.amountCents;
          categorySpentTotal += status.spentCents;
          totalBudget += status.budget.props.amountCents;
          totalSpent += status.spentCents;
          if (status.isOverBudget) overBudgetCount++;
          if (status.shouldAlert) alertCount++;
        }
      }

      if (budgetStatuses.length > 0) {
        categorySummaries.push({
          categoryId: category.id,
          categoryName: category.props.name,
          categoryIcon: category.props.icon,
          categoryColor: category.props.color,
          budgets: budgetStatuses,
          totalBudgetCents: categoryBudgetTotal,
          totalSpentCents: categorySpentTotal,
          totalRemainingCents: categoryBudgetTotal - categorySpentTotal,
          overallPercentageUsed: (categorySpentTotal / categoryBudgetTotal) * 100,
          hasOverBudget: budgetStatuses.some(b => b.isOverBudget),
        });
      }
    }

    return {
      categories: categorySummaries,
      totalBudgetCents: totalBudget,
      totalSpentCents: totalSpent,
      overBudgetCount,
      alertCount,
    };
  };
}
```

**Update**: `packages/usecases/src/index.ts`

```typescript
// Categories
export * from "./categories/create-category";
export * from "./categories/list-categories";
export * from "./categories/update-category";
export * from "./categories/delete-category";
export * from "./categories/seed-default-categories";

// Budgets
export * from "./budgets/create-budget";
export * from "./budgets/list-budgets";
export * from "./budgets/update-budget";
export * from "./budgets/delete-budget";
export * from "./budgets/get-budget-status";
export * from "./budgets/get-budget-dashboard";

// Existing
export * from "./transactions/add-transaction";
export * from "./auth";
```

### Phase 5: Adapters Layer (Repository Implementations)

#### Step 5.1: In-Memory Category Repository (for testing)

**File**: `packages/adapters/persistence/local/src/categories-repo.ts`

```typescript
import type { Category } from "@budget/domain/category";
import type { CategoriesRepo } from "@budget/ports";

export function makeInMemCategoriesRepo(): CategoriesRepo {
  const categories = new Map<string, Category>();

  return {
    async getById(id: string): Promise<Category | null> {
      return categories.get(id) || null;
    },

    async listByUser(userId: string): Promise<Category[]> {
      return Array.from(categories.values())
        .filter(c => c.props.userId === userId)
        .sort((a, b) => a.props.sortOrder - b.props.sortOrder);
    },

    async listActiveByUser(userId: string): Promise<Category[]> {
      return Array.from(categories.values())
        .filter(c => c.props.userId === userId && c.props.isActive)
        .sort((a, b) => a.props.sortOrder - b.props.sortOrder);
    },

    async create(category: Category): Promise<void> {
      categories.set(category.id, category);
    },

    async update(category: Category): Promise<void> {
      categories.set(category.id, category);
    },

    async delete(id: string): Promise<void> {
      categories.delete(id);
    },
  };
}
```

**Update**: `packages/adapters/persistence/local/src/index.ts`

```typescript
export * from "./categories-repo";
export * from "./budgets-repo"; // You'll need to create this
export * from "./transactions-repo";
```

#### Step 5.2: In-Memory Budget Repository

**File**: `packages/adapters/persistence/local/src/budgets-repo.ts`

```typescript
import type { Budget } from "@budget/domain/budget";
import type { BudgetsRepo } from "@budget/ports";

export function makeInMemBudgetsRepo(): BudgetsRepo {
  const budgets = new Map<string, Budget>();

  return {
    async getById(id: string): Promise<Budget | null> {
      return budgets.get(id) || null;
    },

    async listByUser(userId: string): Promise<Budget[]> {
      return Array.from(budgets.values())
        .filter(b => b.props.userId === userId);
    },

    async listActiveByUser(userId: string, date?: Date): Promise<Budget[]> {
      const checkDate = date || new Date();
      return Array.from(budgets.values())
        .filter(b => b.props.userId === userId && b.isActive(checkDate));
    },

    async listByCategory(userId: string, categoryId: string): Promise<Budget[]> {
      return Array.from(budgets.values())
        .filter(b => b.props.userId === userId && b.props.categoryId === categoryId);
    },

    async create(budget: Budget): Promise<void> {
      budgets.set(budget.id, budget);
    },

    async update(budget: Budget): Promise<void> {
      budgets.set(budget.id, budget);
    },

    async delete(id: string): Promise<void> {
      budgets.delete(id);
    },
  };
}
```

#### Step 5.3: Update Transactions Repository

**Update**: `packages/adapters/persistence/local/src/transactions-repo.ts`

Add the `listByUserInPeriod` method:

```typescript
async listByUserInPeriod(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> {
  return Array.from(transactions.values())
    .filter(tx => 
      tx.props.userId === userId &&
      tx.props.occurredAt >= startDate &&
      tx.props.occurredAt <= endDate
    );
}
```

### Phase 6: Composition Layer

#### Step 6.1: Update Container

**Update**: `packages/composition/cloudflare-worker/src/container.ts`

```typescript
import { makeSystemClock, makeUlid } from "@budget/adapters-system";
import { 
  makeInMemCategoriesRepo,
  makeInMemBudgetsRepo,
  makeInMemTransactionsRepo 
} from "@budget/adapters-persistence-local";
import {
  makeCreateCategory,
  makeListCategories,
  makeUpdateCategory,
  makeDeleteCategory,
  makeSeedDefaultCategories,
  makeCreateBudget,
  makeListBudgets,
  makeUpdateBudget,
  makeDeleteBudget,
  makeGetBudgetStatus,
  makeGetBudgetDashboard,
  makeAddTransaction,
} from "@budget/usecases";

export function makeContainer() {
  const clock = makeSystemClock();
  const id = makeUlid();
  
  // Repositories
  const categoriesRepo = makeInMemCategoriesRepo();
  const budgetsRepo = makeInMemBudgetsRepo();
  const txRepo = makeInMemTransactionsRepo();
  
  return {
    repos: {
      categoriesRepo,
      budgetsRepo,
      txRepo,
    },
    usecases: {
      // Category use cases
      createCategory: makeCreateCategory({ categoriesRepo, clock, id }),
      listCategories: makeListCategories({ categoriesRepo }),
      updateCategory: makeUpdateCategory({ categoriesRepo, clock }),
      deleteCategory: makeDeleteCategory({ categoriesRepo, budgetsRepo }),
      seedDefaultCategories: makeSeedDefaultCategories({ categoriesRepo, clock, id }),
      
      // Budget use cases
      createBudget: makeCreateBudget({ budgetsRepo, clock, id }),
      listBudgets: makeListBudgets({ budgetsRepo }),
      updateBudget: makeUpdateBudget({ budgetsRepo, clock }),
      deleteBudget: makeDeleteBudget({ budgetsRepo }),
      getBudgetStatus: makeGetBudgetStatus({ budgetsRepo, transactionsRepo: txRepo, clock }),
      getBudgetDashboard: makeGetBudgetDashboard({ 
        categoriesRepo, 
        budgetsRepo, 
        transactionsRepo: txRepo, 
        clock 
      }),
      
      // Transaction use cases
      addTransaction: makeAddTransaction({ clock, id, txRepo }),
    }
  };
}
```

### Phase 7: API Routes

#### Step 7.1: Create Category Routes

**File**: `apps/api/src/routes/categories.ts`

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CreateCategoryInputSchema, UpdateCategoryInputSchema } from "@budget/schemas";
import { makeContainer } from "@budget/composition-cloudflare-worker";
import { authMiddleware } from "../middleware/auth";

export const categories = new Hono();

categories.use("*", authMiddleware);

// GET /categories
categories.get("/categories", async (c) => {
  const userId = c.get("userId");
  const activeOnly = c.req.query("active") === "true";
  const { usecases } = makeContainer();
  
  const cats = await usecases.listCategories(userId, activeOnly);
  
  return c.json({
    categories: cats.map(cat => ({
      ...cat.props,
      createdAt: cat.props.createdAt.toISOString(),
      updatedAt: cat.props.updatedAt.toISOString(),
    }))
  });
});

// POST /categories/seed
categories.post("/categories/seed", async (c) => {
  const userId = c.get("userId");
  const { usecases } = makeContainer();
  
  const seeded = await usecases.seedDefaultCategories(userId);
  
  return c.json({
    categories: seeded.map(cat => ({
      ...cat.props,
      createdAt: cat.props.createdAt.toISOString(),
      updatedAt: cat.props.updatedAt.toISOString(),
    })),
    message: `Seeded ${seeded.length} default categories`
  }, 201);
});

// POST /categories
categories.post(
  "/categories",
  zValidator("json", CreateCategoryInputSchema),
  async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    const { usecases } = makeContainer();
    
    try {
      const category = await usecases.createCategory({
        ...input,
        userId,
      });
      
      return c.json({
        category: {
          ...category.props,
          createdAt: category.props.createdAt.toISOString(),
          updatedAt: category.props.updatedAt.toISOString(),
        }
      }, 201);
    } catch (err) {
      return c.json({ error: (err as Error).message }, 400);
    }
  }
);

// PUT /categories/:id
categories.put(
  "/categories/:id",
  zValidator("json", UpdateCategoryInputSchema),
  async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const updates = c.req.valid("json");
    const { usecases } = makeContainer();
    
    try {
      const category = await usecases.updateCategory(id, userId, updates);
      return c.json({
        category: {
          ...category.props,
          createdAt: category.props.createdAt.toISOString(),
          updatedAt: category.props.updatedAt.toISOString(),
        }
      });
    } catch (err) {
      return c.json({ error: (err as Error).message }, 404);
    }
  }
);

// DELETE /categories/:id
categories.delete("/categories/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const { usecases } = makeContainer();
  
  try {
    await usecases.deleteCategory(id, userId);
    return c.json({ message: "Category deleted" });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
});
```

#### Step 7.2: Create Budget Routes

**File**: `apps/api/src/routes/budgets.ts`

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CreateBudgetInputSchema, UpdateBudgetInputSchema } from "@budget/schemas";
import { makeContainer } from "@budget/composition-cloudflare-worker";
import { authMiddleware } from "../middleware/auth";

export const budgets = new Hono();
budgets.use("*", authMiddleware);

// GET /budgets/dashboard
budgets.get("/budgets/dashboard", async (c) => {
  const userId = c.get("userId");
  const { usecases } = makeContainer();
  
  const dashboard = await usecases.getBudgetDashboard(userId);
  
  return c.json({ dashboard });
});

// GET /budgets/:id/status
budgets.get("/budgets/:id/status", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const { usecases } = makeContainer();
  
  const status = await usecases.getBudgetStatus(id, userId);
  
  if (!status) {
    return c.json({ error: "Budget not found" }, 404);
  }
  
  return c.json({ status });
});

// GET /budgets
budgets.get("/budgets", async (c) => {
  const userId = c.get("userId");
  const categoryId = c.req.query("categoryId");
  const activeOnly = c.req.query("active") === "true";
  const { usecases } = makeContainer();
  
  // Implementation for filtering budgets
  const budgetList = await usecases.listBudgets(userId);
  
  return c.json({
    budgets: budgetList.map(b => ({
      ...b.props,
      startDate: b.props.startDate.toISOString(),
      endDate: b.props.endDate?.toISOString(),
      createdAt: b.props.createdAt.toISOString(),
      updatedAt: b.props.updatedAt.toISOString(),
    }))
  });
});

// POST /budgets
budgets.post(
  "/budgets",
  zValidator("json", CreateBudgetInputSchema),
  async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");
    const { usecases, repos } = makeContainer();
    
    // Validate category
    const category = await repos.categoriesRepo.getById(input.categoryId);
    if (!category || category.props.userId !== userId) {
      return c.json({ error: "Invalid category" }, 400);
    }
    
    const budget = await usecases.createBudget({
      ...input,
      userId,
    });
    
    return c.json({
      budget: {
        ...budget.props,
        startDate: budget.props.startDate.toISOString(),
        endDate: budget.props.endDate?.toISOString(),
        createdAt: budget.props.createdAt.toISOString(),
        updatedAt: budget.props.updatedAt.toISOString(),
      }
    }, 201);
  }
);

// PUT /budgets/:id
budgets.put(
  "/budgets/:id",
  zValidator("json", UpdateBudgetInputSchema),
  async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const updates = c.req.valid("json");
    const { usecases } = makeContainer();
    
    try {
      const budget = await usecases.updateBudget(id, userId, updates);
      return c.json({
        budget: {
          ...budget.props,
          startDate: budget.props.startDate.toISOString(),
          endDate: budget.props.endDate?.toISOString(),
          createdAt: budget.props.createdAt.toISOString(),
          updatedAt: budget.props.updatedAt.toISOString(),
        }
      });
    } catch (err) {
      return c.json({ error: (err as Error).message }, 404);
    }
  }
);

// DELETE /budgets/:id
budgets.delete("/budgets/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const { usecases } = makeContainer();
  
  try {
    await usecases.deleteBudget(id, userId);
    return c.json({ message: "Budget deleted" });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 404);
  }
});
```

#### Step 7.3: Register Routes in App

**Update**: `apps/api/src/app.ts`

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { errors } from "./middleware/errors";
import { health } from "./routes/health";
import { transactions } from "./routes/transactions";
import { auth } from "./routes/auth";
import { categories } from "./routes/categories";
import { budgets } from "./routes/budgets";
import { authMiddleware } from "./middleware/auth";

export const app = new Hono();

app.use("*", cors({
  origin: "http://localhost:3000",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

app.use("*", errors);
app.route("/", health);
app.route("/", auth);
app.use("/auth/me", authMiddleware);
app.route("/", transactions);
app.route("/", categories);
app.route("/", budgets);
```

---

## Frontend Integration

### Phase 8: Frontend Services

#### Step 8.1: Create Budget Service

**File**: `apps/frontend/src/services/budgetService.ts`

[See full implementation in previous response - includes all TypeScript types and API functions]

### Phase 9: Update Budget Page

#### Step 9.1: Update Budget Page Component

**Update**: `apps/frontend/src/app/(protected)/budget/page.tsx`

[See full implementation in previous response - includes dashboard loading, category cards, modals]

---

## Testing

### Unit Tests

Test each use case independently:

```typescript
// Example: test create-category.test.ts
describe('CreateCategory', () => {
  it('should create a category', async () => {
    const categoriesRepo = makeInMemCategoriesRepo();
    const clock = makeSystemClock();
    const id = makeUlid();
    
    const createCategory = makeCreateCategory({ categoriesRepo, clock, id });
    
    const category = await createCategory({
      userId: 'user-123',
      name: 'Test Category',
      icon: '🧪',
      color: '#FF0000',
    });
    
    expect(category.name).toBe('Test Category');
    expect(category.props.icon).toBe('🧪');
  });

  it('should reject duplicate category names', async () => {
    // ... test implementation
  });
});
```

### Integration Tests

Test API routes:

```bash
# Run integration tests
cd apps/api
pnpm test
```

### E2E Tests

Test frontend flows:

```bash
# Run E2E tests
cd apps/frontend
pnpm test:e2e
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] TypeScript compilation successful (`pnpm typecheck`)
- [ ] Linting passing (`pnpm lint`)
- [ ] Environment variables configured
- [ ] Database migrations ready (if using Firebase)

### Backend Deployment

```bash
cd apps/api
pnpm build
wrangler deploy
```

### Frontend Deployment

```bash
cd apps/frontend
pnpm build
# Deploy to Cloudflare Pages
```

### Post-Deployment

- [ ] API routes accessible
- [ ] Frontend can connect to API
- [ ] Default categories seed on first login
- [ ] Budget creation works
- [ ] Dashboard displays correctly

---

## API Reference

### Categories

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/categories` | GET | List user's categories |
| `/categories/seed` | POST | Seed default categories |
| `/categories` | POST | Create custom category |
| `/categories/:id` | PUT | Update category |
| `/categories/:id` | DELETE | Delete category |

### Budgets

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/budgets/dashboard` | GET | Get budget dashboard |
| `/budgets/:id/status` | GET | Get budget status |
| `/budgets` | GET | List budgets |
| `/budgets` | POST | Create budget |
| `/budgets/:id` | PUT | Update budget |
| `/budgets/:id` | DELETE | Delete budget |

---

## Troubleshooting

### Common Issues

**Issue**: Categories not seeding
**Solution**: Check user authentication and call `/categories/seed` endpoint

**Issue**: Budget status not calculating
**Solution**: Ensure transactions have `categoryId` field populated

**Issue**: Dashboard showing 0 budgets
**Solution**: Create budgets with valid category IDs

---

## Next Steps

After basic implementation:

1. **Add Firebase persistence** (replace in-memory repos)
2. **Implement budget alerts** (email/push notifications)
3. **Add budget forecasting** (predict overspending)
4. **Create budget reports** (monthly summaries)
5. **Add budget sharing** (family budgets)

---

## Support

For questions or issues:
- Check [DESIGN.md](./DESIGN.md) for architecture details
- Review existing code in `packages/` directories
- Consult API documentation
- Check course-work folder for sprint requirements

---

**Last Updated**: 2025-10-15
**Version**: 1.0.0