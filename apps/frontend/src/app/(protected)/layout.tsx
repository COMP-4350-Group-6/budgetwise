"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProtectedLayoutClient from "./ProtectedLayoutClient";
import { useEffect } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persistOptions } from "@/lib/queryClient";
import { budgetService, categoryService } from "@/services/budgetService";
import { apiFetch } from "@/lib/apiClient";
import type { TransactionDTO } from "@/services/transactionsService";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || loading) return;

    // Prefetch all main queries immediately after authentication
    const prefetchAllData = async () => {
      try {
        // Prefetch in parallel for faster loading
        await Promise.all([
          // Dashboard data
          queryClient.prefetchQuery({
            queryKey: ["dashboard"],
            queryFn: () => budgetService.getDashboard(),
            staleTime: 5 * 60 * 1000,
          }),

          // Recent transactions (90 days)
          queryClient.prefetchQuery({
            queryKey: ["transactions", "recent", 90],
            queryFn: async () => {
              const resp = await apiFetch<{ transactions: TransactionDTO[] }>(
                "/transactions?days=90",
                {},
                true
              );
              return resp.transactions ?? [];
            },
            staleTime: 5 * 60 * 1000,
          }),

          // All transactions (for transactions page)
          queryClient.prefetchQuery({
            queryKey: ["transactions", "all", 90, 500],
            queryFn: async () => {
              const resp = await apiFetch<{ transactions: TransactionDTO[] }>(
                "/transactions?days=90&limit=500",
                {},
                true
              );
              return resp.transactions ?? [];
            },
            staleTime: 5 * 60 * 1000,
          }),

          // Categories
          queryClient.prefetchQuery({
            queryKey: ["categories", true],
            queryFn: () => categoryService.listCategories(true),
            staleTime: 10 * 60 * 1000,
          }),

          // Budgets
          queryClient.prefetchQuery({
            queryKey: ["budgets", true],
            queryFn: () => budgetService.listBudgets(true),
            staleTime: 5 * 60 * 1000,
          }),
        ]);

        // Auto-seed categories if none exist (after prefetching)
        const categories = await categoryService.listCategories(true);
        if (!categories || categories.length === 0) {
          await categoryService.seedDefaultCategories();
          // Invalidate categories query to refetch after seeding
          queryClient.invalidateQueries({ queryKey: ["categories"] });
        }
      } catch (err) {
        console.warn("Data prefetch failed:", err);
        // Don't block the UI if prefetch fails - queries will load on demand
      }
    };

    prefetchAllData();
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-green-dark">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <ProtectedLayoutClient>{children}</ProtectedLayoutClient>
    </PersistQueryClientProvider>
  );
}
