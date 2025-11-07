import { screen, waitFor, fireEvent } from "@testing-library/react";
import TransactionsPage from "@/app/(protected)/transactions/page";
import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Budget } from "@/services/budgetService";
import type { TransactionDTO } from "@/services/transactionsService";
import { renderWithQueryClient } from "../../../../tests/setup/testUtils";
import * as apiQueries from "@/hooks/apiQueries";

// mock CSS module
vi.mock("@/app/(protected)/transactions/transactions.module.css", () => ({
  __esModule: true,
  default: new Proxy({}, { get: (_, prop) => prop }),
}));

// mock child components
vi.mock("@/components/transactions/monthSummary", () => ({
  __esModule: true,
  default: ({ totalTransactions }: { totalTransactions: number }) => (
    <div data-testid="month-summary">Transactions: {totalTransactions}</div>
  ),
}));

vi.mock("@/components/transactions/categoryBreakdown", () => ({
  __esModule: true,
  default: () => <div data-testid="top-categories" />,
}));

vi.mock("@/components/transactions/financialSummary", () => ({
  __esModule: true,
  default: ({ totalTransactions }: { totalTransactions: number }) => (
    <div data-testid="month-summary">Transactions: {totalTransactions}</div>
  ),
}));

// Mock React Query hooks
vi.mock("@/hooks/apiQueries", () => ({
  useAllTransactions: vi.fn(),
  useCategories: vi.fn(),
  useBudgets: vi.fn(),
  useAddTransaction: vi.fn(),
  useUpdateTransaction: vi.fn(),
  useDeleteTransaction: vi.fn(),
  useBulkImportTransactions: vi.fn(),
}));

vi.mock("@/services/transactionsService", () => ({
  transactionsService: {
    categorizeTransaction: vi.fn(),
    parseInvoice: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("TransactionsPage", () => {
  const mockCategories = [
    {
      id: "c1",
      userId: "u1",
      name: "Food",
      description: undefined,
      icon: undefined,
      color: undefined,
      isDefault: false,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "c2",
      userId: "u1",
      name: "Travel",
      description: undefined,
      icon: undefined,
      color: undefined,
      isDefault: false,
      isActive: true,
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockBudgets: Budget[] = [
    {
      id: "b1",
      userId: "u1",
      categoryId: "c1",
      name: "Monthly",
      amountCents: 100000,
      currency: "USD",
      period: "MONTHLY",
      startDate: new Date().toISOString(),
      endDate: undefined,
      isActive: true,
      alertThreshold: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockTransactions: TransactionDTO[] = [
    {
      id: "t1",
      userId: "u1",
      amountCents: -1200,
      occurredAt: new Date().toISOString(),
      categoryId: "c1",
      note: "Starbucks Coffee",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Set up default mutation mocks - use the mocked functions from vi.mock
    const mockMutationReturn = {
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    };
    
    vi.mocked(apiQueries.useAddTransaction).mockReturnValue({
      ...mockMutationReturn,
      mutateAsync: vi.fn().mockResolvedValue({ transaction: {} }),
    } as any);
    
    vi.mocked(apiQueries.useUpdateTransaction).mockReturnValue({
      ...mockMutationReturn,
      mutateAsync: vi.fn().mockResolvedValue({}),
    } as any);
    
    vi.mocked(apiQueries.useDeleteTransaction).mockReturnValue({
      ...mockMutationReturn,
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    } as any);
    
    vi.mocked(apiQueries.useBulkImportTransactions).mockReturnValue({
      ...mockMutationReturn,
      mutateAsync: vi.fn().mockResolvedValue({ imported: 0, failed: 0, total: 0, success: [], errors: [] }),
    } as any);
  });

  it("renders loading state initially", async () => {
    vi.mocked(apiQueries.useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(apiQueries.useBudgets).mockReturnValue({
      data: mockBudgets,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(apiQueries.useAllTransactions).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderWithQueryClient(<TransactionsPage />);
    expect(screen.getByRole("heading", { name: /^transactions$/i })).toBeInTheDocument();
  });

  it("renders loaded transactions after fetch", async () => {
    vi.mocked(apiQueries.useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(apiQueries.useBudgets).mockReturnValue({
      data: mockBudgets,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(apiQueries.useAllTransactions).mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderWithQueryClient(<TransactionsPage />);

    await waitFor(() => screen.getByText(/Starbucks Coffee/i));
    expect(screen.getByTestId("month-summary")).toBeInTheDocument();
    expect(screen.getByTestId("top-categories")).toBeInTheDocument();
    expect(screen.getByText(/Starbucks Coffee/)).toBeInTheDocument();
  });

  it("shows empty state when no transactions", async () => {
    vi.mocked(apiQueries.useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(apiQueries.useBudgets).mockReturnValue({
      data: mockBudgets,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(apiQueries.useAllTransactions).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderWithQueryClient(<TransactionsPage />);
    await waitFor(() =>
      expect(screen.getByText(/no transactions logged/i)).toBeInTheDocument()
    );
  });

  it("opens and closes Add Transaction modal", async () => {
    vi.mocked(apiQueries.useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(apiQueries.useBudgets).mockReturnValue({
      data: mockBudgets,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(apiQueries.useAllTransactions).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderWithQueryClient(<TransactionsPage />);
    await waitFor(() =>
      expect(screen.queryByText(/no transactions logged/i)).toBeInTheDocument()
    );

    const addBtn = screen.getByRole("button", { name: /add transaction/i })
    fireEvent.click(addBtn);
    expect(screen.getByRole("heading", { name: /^add transaction$/i })).toBeInTheDocument();


    const closeBtn = screen.getByRole("button", { name: /✕/i });
    fireEvent.click(closeBtn);
    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: /^add transaction$/i })).not.toBeInTheDocument()
    );
  });

  it("handles export with no transactions", async () => {
    vi.mocked(apiQueries.useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(apiQueries.useBudgets).mockReturnValue({
      data: mockBudgets,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(apiQueries.useAllTransactions).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    global.alert = vi.fn();

    renderWithQueryClient(<TransactionsPage />);
    await waitFor(() => screen.getByText(/no transactions logged/i));

    const exportBtn = screen.getByRole("button", { name: /export csv/i });
    fireEvent.click(exportBtn);

    expect(global.alert).toHaveBeenCalledWith("No transactions to export.");
  });
});
