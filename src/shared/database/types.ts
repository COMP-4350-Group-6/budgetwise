// Database types and interfaces
import { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";

// Base document interface
export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User document interface
export interface UserDocument extends BaseDocument {
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences?: UserPreferences;
}

// User preferences interface
export interface UserPreferences {
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    budgetAlerts: boolean;
  };
}

// Budget document interface
export interface BudgetDocument extends BaseDocument {
  userId: string;
  name: string;
  description?: string;
  totalAmount: number;
  spentAmount: number;
  startDate: Timestamp;
  endDate: Timestamp;
  categories: BudgetCategory[];
  isActive: boolean;
}

// Budget category interface
export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  color?: string;
}

// Transaction document interface
export interface TransactionDocument extends BaseDocument {
  userId: string;
  budgetId?: string;
  categoryId?: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: Timestamp;
  tags?: string[];
  receiptUrl?: string;
}

// Database operation types
export interface DatabaseOperation<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface DatabaseListOperation<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

// Query options interface
export interface QueryOptions {
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  startAfter?: QueryDocumentSnapshot<DocumentData>;
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  BUDGETS: 'budgets',
  TRANSACTIONS: 'transactions',
} as const;

// Database error types
export interface DatabaseError {
  code: string;
  message: string;
  details?: any;
}
