import { screen, waitFor, fireEvent } from "@testing-library/react";
import BudgetPage from "@/app/(protected)/budget/page";
import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderWithQueryClient } from "../../../../tests/setup/testUtils";

// mock CSS module import
vi.mock("@/app/(protected)/budget/budget.module.css", () => ({
  __esModule: true,
  default: new Proxy({}, { get: (_, prop) => prop }),
}));

// Mock child components
vi.mock("@/components/budgets/categorySpending", () => ({
  __esModule: true,
  default: () => <div data-testid="category-spending" />,
}));
vi.mock("@/components/budgets/savingsGoal", () => ({
  __esModule: true,
  default: () => <div data-testid="savings-goals" />,
}));

// Mock React Query hooks
vi.mock("@/hooks/apiQueries", () => ({
  useDashboard: vi.fn(),
  useCategories: vi.fn(),
  useAllTransactions: vi.fn(),
  useSeedDefaultCategories: vi.fn(),
  useCreateBudget: vi.fn(),
  useUpdateBudget: vi.fn(),
  useDeleteBudget: vi.fn(),
  useDeleteCategory: vi.fn(),
  useCreateCategory: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("BudgetPage", () => {
  const mockDashboard = {
    totalBudgetCents: 10000,
    totalSpentCents: 4000,
    categories: [
      { categoryId: "1", totalBudgetCents: 5000, totalSpentCents: 1000, categoryName: "Food", categoryIcon: undefined, categoryColor: "#4ECDC4", budgets: [], totalRemainingCents: 4000, overallPercentageUsed: 20, hasOverBudget: false },
    ],
    savingsGoals: [{ id: "goal1", name: "Vacation", targetCents: 500000, savedCents: 0 }],
    overBudgetCount: 0,
    alertCount: 0,
  };

  const mockCategories = [
    { id: "1", name: "Food", description: "Meals", color: "#4ECDC4", userId: "u1", isDefault: false, isActive: true, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const mockTransactions = [
    {
      id: "tx1",
      userId: "u1",
      amountCents: 2000,
      occurredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categoryId: "1",
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows loading state initially", async () => {
    const { useDashboard, useCategories, useAllTransactions, useSeedDefaultCategories } = await import("@/hooks/apiQueries");

    vi.mocked(useCategories).mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useSeedDefaultCategories).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as any);

    vi.mocked(useDashboard).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useAllTransactions).mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderWithQueryClient(<BudgetPage />);
    expect(screen.getByText(/loading budget data/i)).toBeInTheDocument();
  });

  it("renders dashboard data after loading", async () => {
    const { useDashboard, useCategories, useAllTransactions, useSeedDefaultCategories } = await import("@/hooks/apiQueries");

    vi.mocked(useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useSeedDefaultCategories).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as any);

    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useAllTransactions).mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderWithQueryClient(<BudgetPage />);

    await waitFor(() =>
      expect(screen.queryByText(/loading budget data/i)).not.toBeInTheDocument()
    );

    expect(screen.getByText(/budget overview/i)).toBeInTheDocument();
    expect(screen.getByTestId("category-spending")).toBeInTheDocument();
    expect(screen.getByText(/spent out of/i)).toBeInTheDocument();
  });

  it("opens and closes the Add Category modal", async () => {
    const { useDashboard, useCategories, useAllTransactions, useSeedDefaultCategories, useCreateCategory } = await import("@/hooks/apiQueries");

    vi.mocked(useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useSeedDefaultCategories).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as any);

    vi.mocked(useCreateCategory).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as any);

    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useAllTransactions).mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderWithQueryClient(<BudgetPage />);

    await waitFor(() =>
      expect(screen.queryByText(/loading budget data/i)).not.toBeInTheDocument()
    );

    const addCategoryButton = screen.getByRole("button", { name: /add category/i });
    fireEvent.click(addCategoryButton);
    expect(screen.getByText(/add new category/i)).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: /✕/i });
    fireEvent.click(closeButton);

    await waitFor(() =>
      expect(screen.queryByText(/add new category/i)).not.toBeInTheDocument()
    );
  });
});
