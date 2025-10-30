import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import BudgetPage from "@/app/(protected)/budget/page";
import React from "react";
import { vi } from "vitest";

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
vi.mock("@/components/budgets/savingsGoals", () => ({
  __esModule: true,
  default: () => <div data-testid="savings-goals" />,
}));

// mock service modules
vi.mock("@/services/budgetService", () => ({
  budgetService: {
    getDashboard: vi.fn(),
    createBudget: vi.fn(),
  },
  categoryService: {
    listCategories: vi.fn(),
    deleteCategory: vi.fn(),
    seedDefaultCategories: vi.fn(),
    createCategory: vi.fn(),
  },
}));

vi.mock("@/services/transactionsService", () => ({
  transactionsService: {
    listTransactions: vi.fn(),
  },
}));

describe("BudgetPage", () => {
  const mockDashboard = {
    totalBudgetCents: 10000,
    totalSpentCents: 4000,
    categories: [
      { categoryId: "1", totalBudgetCents: 5000, totalSpentCents: 1000 },
    ],
    savingsGoals: [{ id: "goal1", name: "Vacation", target: 500000 }],
  };

  const mockCategories = [
    { id: "1", name: "Food", description: "Meals", color: "#4ECDC4" },
  ];

  const mockTransactions = [
    {
      id: "tx1",
      amountCents: 2000,
      occurredAt: new Date().toISOString(),
      categoryId: "1",
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows loading state initially", async () => {
    const { budgetService, categoryService } = await import("@/services/budgetService");
    const { transactionsService } = await import("@/services/transactionsService");

    (categoryService.listCategories as any).mockResolvedValueOnce([]);
    (budgetService.getDashboard as any).mockResolvedValueOnce(mockDashboard);
    (transactionsService.listTransactions as any).mockResolvedValueOnce(mockTransactions);

    render(<BudgetPage />);
    expect(screen.getByText(/loading budget data/i)).toBeInTheDocument();
  });

  it("renders dashboard data after loading", async () => {
    const { budgetService, categoryService } = await import("@/services/budgetService");
    const { transactionsService } = await import("@/services/transactionsService");

    (categoryService.listCategories as any).mockResolvedValueOnce(mockCategories);
    (budgetService.getDashboard as any).mockResolvedValueOnce(mockDashboard);
    (transactionsService.listTransactions as any).mockResolvedValueOnce(mockTransactions);

    render(<BudgetPage />);

    await waitFor(() =>
      expect(screen.queryByText(/loading budget data/i)).not.toBeInTheDocument()
    );

    expect(screen.getByText(/budget overview/i)).toBeInTheDocument();
    expect(screen.getByTestId("category-spending")).toBeInTheDocument();
    expect(screen.getByText(/spent out of/i)).toBeInTheDocument();
  });

  it("opens and closes the Add Category modal", async () => {
    const { budgetService, categoryService } = await import("@/services/budgetService");
    const { transactionsService } = await import("@/services/transactionsService");

    (categoryService.listCategories as any).mockResolvedValueOnce(mockCategories);
    (budgetService.getDashboard as any).mockResolvedValueOnce(mockDashboard);
    (transactionsService.listTransactions as any).mockResolvedValueOnce(mockTransactions);

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
    const { budgetService, categoryService } = await import("@/services/budgetService");
    const { transactionsService } = await import("@/services/transactionsService");

    (categoryService.listCategories as any).mockRejectedValueOnce(
      new Error("Network error")
    );
    (budgetService.getDashboard as any).mockResolvedValueOnce(mockDashboard);
    (transactionsService.listTransactions as any).mockResolvedValueOnce(mockTransactions);

    render(<BudgetPage />);

    await waitFor(() =>
      expect(screen.getByText(/error:/i)).toBeInTheDocument()
    );
  });
});
