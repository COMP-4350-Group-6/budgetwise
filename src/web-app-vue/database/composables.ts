// Vue Database Composables
import { ref, computed } from 'vue';
import { useDatabase } from './useDatabase';
import {
  UserDocument,
  BudgetDocument,
  TransactionDocument,
  QueryOptions,
  DatabaseOperation,
  DatabaseListOperation
} from '../../shared/database/types';

// Generic composable for single document operations
export const useDocument = <T extends { id: string }>(
  operation: () => Promise<T | null>,
  dependencies: any[] = []
) => {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async () => {
    try {
      loading.value = true;
      error.value = null;
      data.value = await operation();
      return data.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { data, loading, error, execute };
};

// Generic composable for list operations
export const useDocumentList = <T extends { id: string }>(
  operation: () => Promise<{ data: T[]; lastDoc?: any }>,
  dependencies: any[] = []
) => {
  const data = ref<T[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const hasMore = ref(false);

  const execute = async () => {
    try {
      loading.value = true;
      error.value = null;
      const result = await operation();
      data.value = result.data;
      hasMore.value = !!result.lastDoc;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { data, loading, error, hasMore, execute };
};

// User composables
export const useUser = (userId: string) => {
  const { getUser } = useDatabase();
  return useDocument(() => getUser(userId), [userId]);
};

export const useCreateUser = () => {
  const { createUser } = useDatabase();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async (userData: Omit<UserDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true;
      error.value = null;
      const userId = await createUser(userData);
      return userId;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create user';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { execute, loading, error };
};

export const useUpdateUser = () => {
  const { updateUser } = useDatabase();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async (userId: string, userData: Partial<UserDocument>) => {
    try {
      loading.value = true;
      error.value = null;
      await updateUser(userId, userData);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update user';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { execute, loading, error };
};

// Budget composables
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
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async (budgetData: Omit<BudgetDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true;
      error.value = null;
      const budgetId = await createBudget(budgetData);
      return budgetId;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create budget';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { execute, loading, error };
};

export const useUpdateBudget = () => {
  const { updateBudget } = useDatabase();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async (budgetId: string, budgetData: Partial<BudgetDocument>) => {
    try {
      loading.value = true;
      error.value = null;
      await updateBudget(budgetId, budgetData);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update budget';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { execute, loading, error };
};

export const useDeleteBudget = () => {
  const { deleteBudget } = useDatabase();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async (budgetId: string) => {
    try {
      loading.value = true;
      error.value = null;
      await deleteBudget(budgetId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete budget';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { execute, loading, error };
};

// Transaction composables
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
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async (transactionData: Omit<TransactionDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true;
      error.value = null;
      const transactionId = await createTransaction(transactionData);
      return transactionId;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create transaction';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { execute, loading, error };
};

export const useUpdateTransaction = () => {
  const { updateTransaction } = useDatabase();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async (transactionId: string, transactionData: Partial<TransactionDocument>) => {
    try {
      loading.value = true;
      error.value = null;
      await updateTransaction(transactionId, transactionData);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update transaction';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { execute, loading, error };
};

export const useDeleteTransaction = () => {
  const { deleteTransaction } = useDatabase();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async (transactionId: string) => {
    try {
      loading.value = true;
      error.value = null;
      await deleteTransaction(transactionId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete transaction';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { execute, loading, error };
};
