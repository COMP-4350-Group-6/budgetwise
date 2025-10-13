# Database Setup Guide

This document explains how to set up Firestore database operations for the BudgetWise project.

## Project Structure

```txt
src/
├── shared/
│   └── database/
│       ├── firestore.ts          # Firestore configuration and initialization
│       ├── databaseService.ts   # Core database operations (CRUD)
│       ├── types.ts              # TypeScript types and interfaces
│       ├── index.ts              # Module exports
│       ├── package.json           # Dependencies & metadata
│       ├── tsconfig.json         # TypeScript configuration
│       └── README.md             # This file
├── web-app-react/
│   └── database/
│       ├── DatabaseContext.tsx   # React context provider
│       └── hooks.ts             # React database hooks
└── web-app-vue/
    └── database/
        ├── useDatabase.ts       # Vue database composable
        └── composables.ts       # Vue database composables
```

## Database Schema

### Collections

#### Users Collection (`users`)
```typescript
interface UserDocument {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences?: UserPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Budgets Collection (`budgets`)
```typescript
interface BudgetDocument {
  id: string;
  userId: string;
  name: string;
  description?: string;
  totalAmount: number;
  spentAmount: number;
  startDate: Timestamp;
  endDate: Timestamp;
  categories: BudgetCategory[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Transactions Collection (`transactions`)
```typescript
interface TransactionDocument {
  id: string;
  userId: string;
  budgetId?: string;
  categoryId?: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: Timestamp;
  tags?: string[];
  receiptUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## React Integration

### 1. Install Dependencies
```bash
npm install firebase
```

### 2. Wrap your app with DatabaseProvider
```tsx
import { DatabaseProvider } from './src/web-app-react/database/DatabaseContext';

function App() {
  return (
    <DatabaseProvider>
      {/* Your app components */}
    </DatabaseProvider>
  );
}
```

### 3. Use database operations in components
```tsx
import { useBudgets, useCreateBudget } from './src/web-app-react/database/hooks';

function BudgetsComponent() {
  const { data: budgets, loading, error, execute: loadBudgets } = useBudgets(userId);
  const { execute: createBudget, loading: creating } = useCreateBudget();

  const handleCreateBudget = async (budgetData) => {
    try {
      await createBudget(budgetData);
      await loadBudgets(); // Refresh the list
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  };

  if (loading) return <div>Loading budgets...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {budgets.map(budget => (
        <div key={budget.id}>{budget.name}</div>
      ))}
    </div>
  );
}
```

## Vue Integration

### 1. Install Dependencies
```bash
npm install firebase
```

### 2. Install the database plugin
```ts
import { createApp } from 'vue';
import { databasePlugin } from './src/web-app-vue/database/useDatabase';

const app = createApp(App);
app.use(databasePlugin);
```

### 3. Use database operations in components
```vue
<template>
  <div v-if="loading">Loading budgets...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div v-else>
    <div v-for="budget in budgets" :key="budget.id">
      {{ budget.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBudgets, useCreateBudget } from './src/web-app-vue/database/composables';

const { data: budgets, loading, error, execute: loadBudgets } = useBudgets(userId);
const { execute: createBudget, loading: creating } = useCreateBudget();

const handleCreateBudget = async (budgetData) => {
  try {
    await createBudget(budgetData);
    await loadBudgets(); // Refresh the list
  } catch (error) {
    console.error('Failed to create budget:', error);
  }
};
</script>
```

## Available Operations

### Generic Operations
- `getDocument(collection, id)` - Get a single document
- `getDocuments(collection, options)` - Get multiple documents with pagination
- `createDocument(collection, data)` - Create a new document
- `updateDocument(collection, id, data)` - Update an existing document
- `deleteDocument(collection, id)` - Delete a document

### User Operations
- `getUser(userId)` - Get user document
- `createUser(userData)` - Create new user
- `updateUser(userId, userData)` - Update user data

### Budget Operations
- `getBudgets(userId, options)` - Get user's budgets
- `getBudget(budgetId)` - Get specific budget
- `createBudget(budgetData)` - Create new budget
- `updateBudget(budgetId, budgetData)` - Update budget
- `deleteBudget(budgetId)` - Delete budget

### Transaction Operations
- `getTransactions(userId, budgetId?, options)` - Get transactions
- `getTransaction(transactionId)` - Get specific transaction
- `createTransaction(transactionData)` - Create new transaction
- `updateTransaction(transactionId, transactionData)` - Update transaction
- `deleteTransaction(transactionId)` - Delete transaction

## React Hooks

### Data Fetching Hooks
- `useUser(userId)` - Get user data
- `useBudgets(userId, options)` - Get budgets list
- `useBudget(budgetId)` - Get single budget
- `useTransactions(userId, budgetId?, options)` - Get transactions list
- `useTransaction(transactionId)` - Get single transaction

### Mutation Hooks
- `useCreateUser()` - Create user
- `useUpdateUser()` - Update user
- `useCreateBudget()` - Create budget
- `useUpdateBudget()` - Update budget
- `useDeleteBudget()` - Delete budget
- `useCreateTransaction()` - Create transaction
- `useUpdateTransaction()` - Update transaction
- `useDeleteTransaction()` - Delete transaction

## Vue Composables

### Data Fetching Composables
- `useUser(userId)` - Get user data
- `useBudgets(userId, options)` - Get budgets list
- `useBudget(budgetId)` - Get single budget
- `useTransactions(userId, budgetId?, options)` - Get transactions list
- `useTransaction(transactionId)` - Get single transaction

### Mutation Composables
- `useCreateUser()` - Create user
- `useUpdateUser()` - Update user
- `useCreateBudget()` - Create budget
- `useUpdateBudget()` - Update budget
- `useDeleteBudget()` - Delete budget
- `useCreateTransaction()` - Create transaction
- `useUpdateTransaction()` - Update transaction
- `useDeleteTransaction()` - Delete transaction

## Query Options

```typescript
interface QueryOptions {
  limit?: number;                    // Number of documents to fetch
  orderBy?: string;                  // Field to order by
  orderDirection?: 'asc' | 'desc';   // Order direction
  startAfter?: QueryDocumentSnapshot; // For pagination
}
```


