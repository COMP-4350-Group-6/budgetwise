/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/(protected)/home/page";
import { vi } from "vitest";
import React from "react";

// Mock router 
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock services
vi.mock("@/services/budgetService", () => ({
  budgetService: {
    getDashboard: vi.fn(),
  },
}));

vi.mock("@/lib/apiClient", () => ({
  apiFetch: vi.fn(),
}));

// Mock child dashboard components
vi.mock("@/components/dashboard/statCard", () => ({
  __esModule: true,
  default: ({ title, value }: any) => (
    <div data-testid={`stat-${title}`}>{`${title}: ${value}`}</div>
  ),
}));
vi.mock("@/components/dashboard/spendingOverview", () => ({
  __esModule: true,
  default: () => <div data-testid="spending-overview" />,
}));
vi.mock("@/components/dashboard/trendChart", () => ({
  __esModule: true,
  default: () => <div data-testid="trend-chart" />,
}));
vi.mock("@/components/dashboard/donutChart", () => ({
  __esModule: true,
  default: () => <div data-testid="donut-chart" />,
}));
vi.mock("@/components/dashboard/quickActions", () => ({
  __esModule: true,
  default: () => <div data-testid="quick-actions" />,
}));

describe("HomePage", () => {
  const mockDashboard = { totalBudgetCents: 10000, totalSpentCents: 4000 };
  const mockTransactions = [
    { id: "1", amountCents: 200, note: "Coffee" },
    { id: "2", amountCents: 300, note: "Groceries" },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows loading text initially", async () => {
    const { budgetService } = await import("@/services/budgetService");
    const { apiFetch } = await import("@/lib/apiClient");

    (budgetService.getDashboard as any).mockResolvedValueOnce(mockDashboard);
    (apiFetch as any).mockResolvedValueOnce({ transactions: mockTransactions });

    render(<HomePage />);
    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
  });

  it("renders stats and charts after data loads", async () => {
    const { budgetService } = await import("@/services/budgetService");
    const { apiFetch } = await import("@/lib/apiClient");

    (budgetService.getDashboard as any).mockResolvedValueOnce(mockDashboard);
    (apiFetch as any).mockResolvedValueOnce({ transactions: mockTransactions });

    render(<HomePage />);

    await waitFor(() =>
      expect(screen.getByTestId("stat-Total Budget")).toBeInTheDocument()
    );

    expect(screen.getByTestId("stat-Total Budget")).toHaveTextContent("$100.00");
    expect(screen.getByTestId("stat-Total Spent")).toHaveTextContent("$40.00");
    expect(screen.getByTestId("stat-Remaining")).toHaveTextContent("$60.00");
    expect(screen.getByTestId("spending-overview")).toBeInTheDocument();
    expect(screen.getByTestId("trend-chart")).toBeInTheDocument();
    expect(screen.getByTestId("donut-chart")).toBeInTheDocument();
    expect(screen.getByTestId("quick-actions")).toBeInTheDocument();
  });

  it("handles service failure gracefully", async () => {
    const { budgetService } = await import("@/services/budgetService");
    const { apiFetch } = await import("@/lib/apiClient");

    (budgetService.getDashboard as any).mockRejectedValueOnce(new Error("Failed"));
    (apiFetch as any).mockResolvedValueOnce({ transactions: [] });

    render(<HomePage />);
    await waitFor(() =>
      expect(screen.queryByText(/loading dashboard/i)).not.toBeInTheDocument()
    );
    expect(screen.getByTestId("spending-overview")).toBeInTheDocument();
  });
});
