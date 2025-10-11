// React Database Hooks
import { useState, useCallback } from 'react';
import { useDatabase } from './DatabaseContext';
import {
  UserDocument,
  BudgetDocument,
  TransactionDocument,
  QueryOptions,
  DatabaseOperation,
  DatabaseListOperation
} from '../../shared/database/types';

// Generic hook for single document operations
export const useDocument = <T extends { id: string }>(
  operation: () => Promise<T | null>,
  dependencies: any[] = []
) => {
  const [state, setState] = useState<DatabaseOperation<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await operation();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, dependencies);

  return { ...state, execute };
};

// Generic hook for list operations
export const useDocumentList = <T extends { id: string }>(
  operation: () => Promise<{ data: T[]; lastDoc?: any }>,
  dependencies: any[] = []
) => {
  const [state, setState] = useState<DatabaseListOperation<T>>({
    data: [],
    loading: false,
    error: null,
    hasMore: false
  });

  const execute = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await operation();
      setState({
        data: result.data,
        loading: false,
        error: null,
        hasMore: !!result.lastDoc
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, dependencies);

  return { ...state, execute };
};

// User hooks
export const useUser = (userId: string) => {
  const { getUser } = useDatabase();
  return useDocument(() => getUser(userId), [userId]);
};

export const useCreateUser = () => {
  const { createUser } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (userData: Omit<UserDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const userId = await createUser(userData);
      return userId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createUser]);

  return { execute, loading, error };
};

export const useUpdateUser = () => {
  const { updateUser } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (userId: string, userData: Partial<UserDocument>) => {
    try {
      setLoading(true);
      setError(null);
      await updateUser(userId, userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  return { execute, loading, error };
};

// Budget hooks
export const useBudgets = (userId: string, options?: QueryOptions) => {
  const { getBudgets } = useDatabase();
  return useDocumentList(() => getBudgets(userId, options), [userId, options]);
};

export const useBudget = (budgetId: string) => {
  const { getBudget } = useDatabase();
  return useDocument(() => getBudget(budgetId), [budgetId]);
};

export const useCreateBudget = () => {
  const { createBudget } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (budgetData: Omit<BudgetDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const budgetId = await createBudget(budgetData);
      return budgetId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create budget');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createBudget]);

  return { execute, loading, error };
};

export const useUpdateBudget = () => {
  const { updateBudget } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (budgetId: string, budgetData: Partial<BudgetDocument>) => {
    try {
      setLoading(true);
      setError(null);
      await updateBudget(budgetId, budgetData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateBudget]);

  return { execute, loading, error };
};

export const useDeleteBudget = () => {
  const { deleteBudget } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (budgetId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteBudget(budgetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteBudget]);

  return { execute, loading, error };
};

// Transaction hooks
export const useTransactions = (userId: string, budgetId?: string, options?: QueryOptions) => {
  const { getTransactions } = useDatabase();
  return useDocumentList(() => getTransactions(userId, budgetId, options), [userId, budgetId, options]);
};

export const useTransaction = (transactionId: string) => {
  const { getTransaction } = useDatabase();
  return useDocument(() => getTransaction(transactionId), [transactionId]);
};

export const useCreateTransaction = () => {
  const { createTransaction } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (transactionData: Omit<TransactionDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const transactionId = await createTransaction(transactionData);
      return transactionId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createTransaction]);

  return { execute, loading, error };
};

export const useUpdateTransaction = () => {
  const { updateTransaction } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (transactionId: string, transactionData: Partial<TransactionDocument>) => {
    try {
      setLoading(true);
      setError(null);
      await updateTransaction(transactionId, transactionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateTransaction]);

  return { execute, loading, error };
};

export const useDeleteTransaction = () => {
  const { deleteTransaction } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (transactionId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteTransaction(transactionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteTransaction]);

  return { execute, loading, error };
};
