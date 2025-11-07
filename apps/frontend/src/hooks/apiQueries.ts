import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetService, categoryService, type Category, type Budget } from "@/services/budgetService";
import { apiFetch } from "@/lib/apiClient";
import { transactionsService, type TransactionDTO, type AddTransactionInput } from "@/services/transactionsService";
import type { CreateBudgetInput, UpdateBudgetInput } from "@budget/schemas";

// ===== QUERY HOOKS =====

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => budgetService.getDashboard(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentTransactions(days = 90) {
  return useQuery<TransactionDTO[]>({
    queryKey: ["transactions", "recent", days],
    queryFn: async () => {
      const resp = await apiFetch<{ transactions: TransactionDTO[] }>(
        `/transactions?days=${days}`,
        {},
        true
      );
      return resp.transactions ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllTransactions(days = 90, limit = 500) {
  return useQuery<TransactionDTO[]>({
    queryKey: ["transactions", "all", days, limit],
    queryFn: async () => {
      const resp = await apiFetch<{ transactions: TransactionDTO[] }>(
        `/transactions?days=${days}&limit=${limit}`,
        {},
        true
      );
      return resp.transactions ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategories(activeOnly = false) {
  return useQuery<Category[]>({
    queryKey: ["categories", activeOnly],
    queryFn: () => categoryService.listCategories(activeOnly),
    staleTime: 10 * 60 * 1000, // Categories change less frequently
  });
}

export function useBudgets(activeOnly = false) {
  return useQuery<Budget[]>({
    queryKey: ["budgets", activeOnly],
    queryFn: () => budgetService.listBudgets(activeOnly),
    staleTime: 5 * 60 * 1000,
  });
}

// ===== MUTATION HOOKS =====

export function useAddTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddTransactionInput) => transactionsService.addTransaction(input),
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AddTransactionInput> }) =>
      transactionsService.updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useBulkImportTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transactions: AddTransactionInput[]) =>
      transactionsService.bulkImportTransactions(transactions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBudgetInput) => budgetService.createBudget(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateBudgetInput }) =>
      budgetService.updateBudget(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof categoryService.createCategory>[0]) =>
      categoryService.createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof categoryService.updateCategory>[1] }) =>
      categoryService.updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useSeedDefaultCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => categoryService.seedDefaultCategories(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
