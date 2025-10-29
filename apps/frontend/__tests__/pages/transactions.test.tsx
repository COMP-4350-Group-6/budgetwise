import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TransactionsPage from "@/app/(protected)/transactions/page";
import React from "react";
import { vi } from "vitest";

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

vi.mock("@/components/transactions/topCategories", () => ({
  __esModule: true,
  default: () => <div data-testid="top-categories" />,
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
    { id: "c1", name: "Food" },
    { id: "c2", name: "Travel" },
  ];

  const mockBudgets = [
    { id: "b1", name: "Monthly", totalBudgetCents: 100000 },
  ];

  const mockTransactions = [
    {
      id: "t1",
      amountCents: -1200,
      occurredAt: new Date().toISOString(),
      categoryId: "c1",
      note: "Starbucks Coffee",
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders loading state initially", async () => {
    const { categoryService, budgetService } = await import("@/services/budgetService");
    const { apiFetch } = await import("@/lib/apiClient");

    (categoryService.listCategories as any).mockResolvedValue(mockCategories);
    (budgetService.listBudgets as any).mockResolvedValue(mockBudgets);
    (apiFetch as any).mockResolvedValue({ transactions: mockTransactions });

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

    (categoryService.listCategories as any).mockResolvedValue(mockCategories);
    (budgetService.listBudgets as any).mockResolvedValue(mockBudgets);
    (apiFetch as any).mockResolvedValue({ transactions: mockTransactions });

    render(<TransactionsPage />);

    await waitFor(() => screen.getByText(/Starbucks Coffee/i));
    expect(screen.getByTestId("month-summary")).toBeInTheDocument();
    expect(screen.getByTestId("top-categories")).toBeInTheDocument();
    expect(screen.getByText(/Starbucks Coffee/)).toBeInTheDocument();
  });

  it("shows empty state when no transactions", async () => {
    const { categoryService, budgetService } = await import("@/services/budgetService");
    const { apiFetch } = await import("@/lib/apiClient");

    (categoryService.listCategories as any).mockResolvedValue(mockCategories);
    (budgetService.listBudgets as any).mockResolvedValue(mockBudgets);
    (apiFetch as any).mockResolvedValue({ transactions: [] });

    render(<TransactionsPage />);
    await waitFor(() =>
      expect(screen.getByText(/no transactions found/i)).toBeInTheDocument()
    );
  });

  it("opens and closes Add Transaction modal", async () => {
    const { categoryService, budgetService } = await import("@/services/budgetService");
    const { apiFetch } = await import("@/lib/apiClient");

    (categoryService.listCategories as any).mockResolvedValue(mockCategories);
    (budgetService.listBudgets as any).mockResolvedValue(mockBudgets);
    (apiFetch as any).mockResolvedValue({ transactions: [] });

    render(<TransactionsPage />);
    await waitFor(() =>
      expect(screen.queryByText(/no transactions found/i)).toBeInTheDocument()
    );

    const addBtn = screen.getByRole("button", { name: /\+ add transaction/i });
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

    (categoryService.listCategories as any).mockResolvedValue(mockCategories);
    (budgetService.listBudgets as any).mockResolvedValue(mockBudgets);
    (apiFetch as any).mockResolvedValue({ transactions: [] });

    global.alert = vi.fn();

    render(<TransactionsPage />);
    await waitFor(() => screen.getByText(/no transactions found/i));

    const exportBtn = screen.getByRole("button", { name: /export csv/i });
    fireEvent.click(exportBtn);

    expect(global.alert).toHaveBeenCalledWith("No transactions to export.");
  });
});