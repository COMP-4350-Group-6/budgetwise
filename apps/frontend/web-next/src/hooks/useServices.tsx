"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { useApiFetch } from "@/hooks/useApi";
import { createTransactionService, type TransactionService } from "@/services/transactionService";
import { createCategoryService, type CategoryService } from "@/services/categoryService";
import { createBudgetService, type BudgetService } from "@/services/budgetService";

// ============================================================================
// Services Context
// ============================================================================

interface ServicesContextValue {
  transactionService: TransactionService;
  categoryService: CategoryService;
  budgetService: BudgetService;
}

const ServicesContext = createContext<ServicesContextValue | null>(null);

/**
 * Provider that creates memoized service instances.
 * Services are stable across renders - safe to use in useEffect dependencies.
 */
export function ServicesProvider({ children }: { children: ReactNode }) {
  const apiFetch = useApiFetch();

  // Memoize all services - they're stable as long as apiFetch is stable
  const services = useMemo(() => ({
    transactionService: createTransactionService(apiFetch),
    categoryService: createCategoryService(apiFetch),
    budgetService: createBudgetService(apiFetch),
  }), [apiFetch]);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

/**
 * Hook to access all services.
 */
export function useServices(): ServicesContextValue {
  const context = useContext(ServicesContext);
  
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }

  return context;
}

/**
 * Hook to get the transaction service.
 */
export function useTransactionService(): TransactionService {
  return useServices().transactionService;
}

/**
 * Hook to get the category service.
 */
export function useCategoryService(): CategoryService {
  return useServices().categoryService;
}

/**
 * Hook to get the budget service.
 */
export function useBudgetService(): BudgetService {
  return useServices().budgetService;
}

// Re-export types for convenience
export type { TransactionService } from "@/services/transactionService";
export type { CategoryService } from "@/services/categoryService";
export type { BudgetService } from "@/services/budgetService";
