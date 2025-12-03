import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import BudgetPage from "@/app/(protected)/budget/page";
import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";

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

// Mock service hooks
const mockBudgetService = {
  getDashboard: vi.fn(),
  createBudget: vi.fn(),
  listBudgets: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
};

const mockCategoryService = {
  listCategories: vi.fn(),
  deleteCategory: vi.fn(),
  seedDefaultCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
};

const mockTransactionService = {
  listTransactions: vi.fn(),
  addTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
};

vi.mock("@/hooks/useServices", () => ({
  useBudgetService: () => mockBudgetService,
  useCategoryService: () => mockCategoryService,
  useTransactionService: () => mockTransactionService,
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
    mockCategoryService.listCategories.mockResolvedValueOnce([]);
    mockBudgetService.getDashboard.mockResolvedValueOnce(mockDashboard);
    mockTransactionService.listTransactions.mockResolvedValueOnce(mockTransactions);

    render(<BudgetPage />);
    expect(screen.getByText(/loading budget data/i)).toBeInTheDocument();
  });

  it("renders dashboard data after loading", async () => {
    mockCategoryService.listCategories.mockResolvedValueOnce(mockCategories);
    mockBudgetService.getDashboard.mockResolvedValueOnce(mockDashboard);
    mockTransactionService.listTransactions.mockResolvedValueOnce(mockTransactions);

    render(<BudgetPage />);

    await waitFor(() =>
      expect(screen.queryByText(/loading budget data/i)).not.toBeInTheDocument()
    );

    expect(screen.getByText(/budget overview/i)).toBeInTheDocument();
    expect(screen.getByTestId("category-spending")).toBeInTheDocument();
    expect(screen.getByText(/spent out of/i)).toBeInTheDocument();
  });

  it("opens and closes the Add Category modal", async () => {
    mockCategoryService.listCategories.mockResolvedValueOnce(mockCategories);
    mockBudgetService.getDashboard.mockResolvedValueOnce(mockDashboard);
    mockTransactionService.listTransactions.mockResolvedValueOnce(mockTransactions);

    render(<BudgetPage />);

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

  it("shows error message if loading fails", async () => {
    mockCategoryService.listCategories.mockRejectedValueOnce(new Error("Network error"));
    mockBudgetService.getDashboard.mockResolvedValueOnce(mockDashboard);
    mockTransactionService.listTransactions.mockResolvedValueOnce(mockTransactions);

    render(<BudgetPage />);

    await waitFor(() =>
      expect(screen.getByText(/error:/i)).toBeInTheDocument()
    );
  });
});
