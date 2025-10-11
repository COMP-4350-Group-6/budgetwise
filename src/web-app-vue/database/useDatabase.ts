// Vue Database Composable
import { ref, computed } from 'vue';
import { DatabaseService } from '../../shared/database/databaseService';
import {
  UserDocument,
  BudgetDocument,
  TransactionDocument,
  QueryOptions,
  DatabaseOperation,
  DatabaseListOperation
} from '../../shared/database/types';

export const useDatabase = () => {
  // User operations
  const getUser = async (userId: string): Promise<UserDocument | null> => {
    return DatabaseService.getUser(userId);
  };

  const createUser = async (userData: Omit<UserDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    return DatabaseService.createUser(userData);
  };

  const updateUser = async (userId: string, userData: Partial<UserDocument>): Promise<void> => {
    return DatabaseService.updateUser(userId, userData);
  };

  // Budget operations
  const getBudgets = async (userId: string, options?: QueryOptions): Promise<{ data: BudgetDocument[]; lastDoc?: any }> => {
    return DatabaseService.getBudgets(userId, options);
  };

  const getBudget = async (budgetId: string): Promise<BudgetDocument | null> => {
    return DatabaseService.getBudget(budgetId);
  };

  const createBudget = async (budgetData: Omit<BudgetDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    return DatabaseService.createBudget(budgetData);
  };

  const updateBudget = async (budgetId: string, budgetData: Partial<BudgetDocument>): Promise<void> => {
    return DatabaseService.updateBudget(budgetId, budgetData);
  };

  const deleteBudget = async (budgetId: string): Promise<void> => {
    return DatabaseService.deleteBudget(budgetId);
  };

  // Transaction operations
  const getTransactions = async (userId: string, budgetId?: string, options?: QueryOptions): Promise<{ data: TransactionDocument[]; lastDoc?: any }> => {
    return DatabaseService.getTransactions(userId, budgetId, options);
  };

  const getTransaction = async (transactionId: string): Promise<TransactionDocument | null> => {
    return DatabaseService.getTransaction(transactionId);
  };

  const createTransaction = async (transactionData: Omit<TransactionDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    return DatabaseService.createTransaction(transactionData);
  };

  const updateTransaction = async (transactionId: string, transactionData: Partial<TransactionDocument>): Promise<void> => {
    return DatabaseService.updateTransaction(transactionId, transactionData);
  };

  const deleteTransaction = async (transactionId: string): Promise<void> => {
    return DatabaseService.deleteTransaction(transactionId);
  };

  return {
    // User operations
    getUser,
    createUser,
    updateUser,

    // Budget operations
    getBudgets,
    getBudget,
    createBudget,
    updateBudget,
    deleteBudget,

    // Transaction operations
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};

// Vue plugin for global database access
export const databasePlugin = {
  install(app: any) {
    const database = useDatabase();
    app.provide('database', database);
    app.config.globalProperties.$database = database;
  }
};
