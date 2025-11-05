import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TransactionsPage from "@/app/(protected)/transactions/page";
import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Budget } from "@/services/budgetService";
import type { TransactionDTO } from "@/services/transactionsService";

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

// Mock services
vi.mock("@/services/budgetService", () => ({
  budgetService: {
    listBudgets: vi.fn(),
  },
  categoryService: {
    listCategories: vi.fn(),
  },
}));

vi.mock("@/services/transactionsService", () => ({
  transactionsService: {
    addTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
    categorizeTransaction: vi.fn(),
    parseInvoice: vi.fn(),
  },
}));

vi.mock("@/lib/apiClient", () => ({
  apiFetch: vi.fn(),
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
  });

  it("renders loading state initially", async () => {
    const { categoryService, budgetService } = await import("@/services/budgetService");
    const { apiFetch } = await import("@/lib/apiClient");

  vi.mocked(categoryService.listCategories).mockResolvedValue(mockCategories);
  vi.mocked(budgetService.listBudgets).mockResolvedValue(mockBudgets);
  vi.mocked(apiFetch).mockResolvedValue({ transactions: mockTransactions });

    render(<TransactionsPage />);
    expect(screen.getByRole("heading", { name: /^transactions$/i })).toBeInTheDocument();


    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith(
        "/transactions?days=90&limit=500",
        {},
        true
      )
    );
  });

  it("renders loaded transactions after fetch", async () => {
    const { categoryService, budgetService } = await import("@/services/budgetService");
    const { apiFetch } = await import("@/lib/apiClient");

  vi.mocked(categoryService.listCategories).mockResolvedValue(mockCategories);
  vi.mocked(budgetService.listBudgets).mockResolvedValue(mockBudgets);
  vi.mocked(apiFetch).mockResolvedValue({ transactions: mockTransactions });

    render(<TransactionsPage />);

    await waitFor(() => screen.getByText(/Starbucks Coffee/i));
    expect(screen.getByTestId("month-summary")).toBeInTheDocument();
    expect(screen.getByTestId("top-categories")).toBeInTheDocument();
    expect(screen.getByText(/Starbucks Coffee/)).toBeInTheDocument();
  });

  it("shows empty state when no transactions", async () => {
    const { categoryService, budgetService } = await import("@/services/budgetService");
    const { apiFetch } = await import("@/lib/apiClient");

  vi.mocked(categoryService.listCategories).mockResolvedValue(mockCategories);
  vi.mocked(budgetService.listBudgets).mockResolvedValue(mockBudgets);
  vi.mocked(apiFetch).mockResolvedValue({ transactions: [] });

    render(<TransactionsPage />);
    await waitFor(() =>
      expect(screen.getByText(/no transactions logged/i)).toBeInTheDocument()
    );
  });

  it("opens and closes Add Transaction modal", async () => {
    const { categoryService, budgetService } = await import("@/services/budgetService");
    const { apiFetch } = await import("@/lib/apiClient");

  vi.mocked(categoryService.listCategories).mockResolvedValue(mockCategories);
  vi.mocked(budgetService.listBudgets).mockResolvedValue(mockBudgets);
  vi.mocked(apiFetch).mockResolvedValue({ transactions: [] });

    render(<TransactionsPage />);
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
    const { categoryService, budgetService } = await import("@/services/budgetService");
    const { apiFetch } = await import("@/lib/apiClient");

  vi.mocked(categoryService.listCategories).mockResolvedValue(mockCategories);
  vi.mocked(budgetService.listBudgets).mockResolvedValue(mockBudgets);
  vi.mocked(apiFetch).mockResolvedValue({ transactions: [] });

    global.alert = vi.fn();

    render(<TransactionsPage />);
    await waitFor(() => screen.getByText(/no transactions logged/i));

    const exportBtn = screen.getByRole("button", { name: /export csv/i });
    fireEvent.click(exportBtn);

    expect(global.alert).toHaveBeenCalledWith("No transactions to export.");
  });
});
