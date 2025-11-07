/**
 * @vitest-environment jsdom
 */
import { screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/(protected)/home/page";
import { vi, describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { renderWithQueryClient } from "../../../../tests/setup/testUtils";

// Mock router 
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock React Query hooks
vi.mock("@/hooks/apiQueries", () => ({
  useDashboard: vi.fn(),
  useRecentTransactions: vi.fn(),
}));

// Mock child dashboard components
vi.mock("@/components/dashboard/statCard", () => ({
  __esModule: true,
  default: ({ title, value }: { title: string; value: string }) => (
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
  const mockDashboard = { totalBudgetCents: 10000, totalSpentCents: 4000, categories: [], overBudgetCount: 0, alertCount: 0 };
  const mockTransactions = [
    { id: "1", amountCents: 200, note: "Coffee", occurredAt: new Date().toISOString(), userId: "1", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "2", amountCents: 300, note: "Groceries", occurredAt: new Date().toISOString(), userId: "1", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows loading text initially", async () => {
    const { useDashboard, useRecentTransactions } = await import("@/hooks/apiQueries");

    vi.mocked(useDashboard).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useRecentTransactions).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderWithQueryClient(<HomePage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders stats and charts after data loads", async () => {
    const { useDashboard, useRecentTransactions } = await import("@/hooks/apiQueries");

    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useRecentTransactions).mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderWithQueryClient(<HomePage />);

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
    const { useDashboard, useRecentTransactions } = await import("@/hooks/apiQueries");

    vi.mocked(useDashboard).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Failed"),
      refetch: vi.fn(),
    } as any);

    vi.mocked(useRecentTransactions).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderWithQueryClient(<HomePage />);
    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );
    expect(screen.getByTestId("spending-overview")).toBeInTheDocument();
  });
});
