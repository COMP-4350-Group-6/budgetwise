import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TransactionsPage from "@/app/(protected)/transactions/page";
import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { BudgetDTO, TransactionDTO, CategoryDTO } from "@budget/schemas";

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

// Mock service hooks
const mockTransactionService = {
  listTransactions: vi.fn(),
  addTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  categorizeTransaction: vi.fn(),
  parseInvoice: vi.fn(),
  bulkImportTransactions: vi.fn(),
};

const mockCategoryService = {
  listCategories: vi.fn(),
  seedDefaultCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
};

const mockBudgetService = {
  getDashboard: vi.fn(),
  getBudgetStatus: vi.fn(),
  listBudgets: vi.fn(),
  createBudget: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
};

vi.mock("@/hooks/useServices", () => ({
  useTransactionService: () => mockTransactionService,
  useCategoryService: () => mockCategoryService,
  useBudgetService: () => mockBudgetService,
}));

describe("TransactionsPage", () => {
  const mockCategories: CategoryDTO[] = [
    {
      id: "c1",
      userId: "u1",
      name: "Food",
      description: null,
      icon: null,
      color: null,
      isDefault: false,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "c2",
      userId: "u1",
      name: "Travel",
      description: null,
      icon: null,
      color: null,
      isDefault: false,
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockBudgets: BudgetDTO[] = [
    {
      id: "b1",
      userId: "u1",
      categoryId: "c1",
      name: "Monthly",
      amountCents: 100000,
      currency: "USD",
      period: "MONTHLY",
      startDate: new Date(),
      endDate: null,
      isActive: true,
      alertThreshold: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockTransactions: TransactionDTO[] = [
    {
      id: "t1",
      userId: "u1",
      budgetId: null,
      amountCents: -1200,
      occurredAt: new Date(),
      categoryId: "c1",
      note: "Starbucks Coffee",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    mockCategoryService.listCategories.mockResolvedValue(mockCategories);
    mockBudgetService.listBudgets.mockResolvedValue(mockBudgets);
    mockTransactionService.listTransactions.mockResolvedValue(mockTransactions);
  });

  it("renders loading state initially", async () => {
    render(<TransactionsPage />);
    expect(screen.getByRole("heading", { name: /^transactions$/i })).toBeInTheDocument();

    await waitFor(() =>
      expect(mockTransactionService.listTransactions).toHaveBeenCalledWith({ days: 90, limit: 500 })
    );
  });

  it("renders loaded transactions after fetch", async () => {
    render(<TransactionsPage />);

    await waitFor(() => screen.getByText(/Starbucks Coffee/i));
    expect(screen.getByTestId("month-summary")).toBeInTheDocument();
    expect(screen.getByTestId("top-categories")).toBeInTheDocument();
    expect(screen.getByText(/Starbucks Coffee/)).toBeInTheDocument();
  });

  it("shows empty state when no transactions", async () => {
    mockTransactionService.listTransactions.mockResolvedValue([]);

    render(<TransactionsPage />);
    await waitFor(() =>
      expect(screen.getByText(/no transactions logged/i)).toBeInTheDocument()
    );
  });

  it("opens and closes Add Transaction modal", async () => {
    mockTransactionService.listTransactions.mockResolvedValue([]);

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
    mockTransactionService.listTransactions.mockResolvedValue([]);

    global.alert = vi.fn();

    render(<TransactionsPage />);
    await waitFor(() => screen.getByText(/no transactions logged/i));

    const exportBtn = screen.getByRole("button", { name: /export csv/i });
    fireEvent.click(exportBtn);

    expect(global.alert).toHaveBeenCalledWith("No transactions to export.");
  });
});
