// React Database Context and Provider
import React, { createContext, useContext, ReactNode } from 'react';
import { DatabaseService } from '../../shared/database/databaseService';
import {
  UserDocument,
  BudgetDocument,
  TransactionDocument,
  QueryOptions,
  DatabaseOperation,
  DatabaseListOperation
} from '../../shared/database/types';

interface DatabaseContextType {
  // User operations
  getUser: (userId: string) => Promise<UserDocument | null>;
  createUser: (userData: Omit<UserDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateUser: (userId: string, userData: Partial<UserDocument>) => Promise<void>;

  // Budget operations
  getBudgets: (userId: string, options?: QueryOptions) => Promise<{ data: BudgetDocument[]; lastDoc?: any }>;
  getBudget: (budgetId: string) => Promise<BudgetDocument | null>;
  createBudget: (budgetData: Omit<BudgetDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBudget: (budgetId: string, budgetData: Partial<BudgetDocument>) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<void>;

  // Transaction operations
  getTransactions: (userId: string, budgetId?: string, options?: QueryOptions) => Promise<{ data: TransactionDocument[]; lastDoc?: any }>;
  getTransaction: (transactionId: string) => Promise<TransactionDocument | null>;
  createTransaction: (transactionData: Omit<TransactionDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTransaction: (transactionId: string, transactionData: Partial<TransactionDocument>) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const value: DatabaseContextType = {
    // User operations
    getUser: DatabaseService.getUser,
    createUser: DatabaseService.createUser,
    updateUser: DatabaseService.updateUser,

    // Budget operations
    getBudgets: DatabaseService.getBudgets,
    getBudget: DatabaseService.getBudget,
    createBudget: DatabaseService.createBudget,
    updateBudget: DatabaseService.updateBudget,
    deleteBudget: DatabaseService.deleteBudget,

    // Transaction operations
    getTransactions: DatabaseService.getTransactions,
    getTransaction: DatabaseService.getTransaction,
    createTransaction: DatabaseService.createTransaction,
    updateTransaction: DatabaseService.updateTransaction,
    deleteTransaction: DatabaseService.deleteTransaction,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

// Custom hook to use the database context
export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
