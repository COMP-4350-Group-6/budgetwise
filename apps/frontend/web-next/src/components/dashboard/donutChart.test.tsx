"use client";

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DonutChart from "./donutChart";

// Mock recharts components
vi.mock("recharts", () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: ({ fill }: { fill: string }) => (
    <div data-testid="cell" style={{ backgroundColor: fill }} />
  ),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe("DonutChart", () => {
  const mockDashboard = {
    categories: [
      { categoryName: "Food", totalSpentCents: 5000 },
      { categoryName: "Transport", totalSpentCents: 3000 },
      { categoryName: "Entertainment", totalSpentCents: 2000 },
    ],
  };

  it("renders with data correctly", () => {
    render(<DonutChart dashboard={mockDashboard} />);

    expect(screen.getByText("Top Categories")).toBeInTheDocument();
    expect(screen.getByText("This month")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getAllByTestId("cell")).toHaveLength(3);
  });

  it("displays category names and percentages in legend", () => {
    render(<DonutChart dashboard={mockDashboard} />);

    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Transport")).toBeInTheDocument();
    expect(screen.getByText("Entertainment")).toBeInTheDocument();

    // Check that percentages are displayed (approximately)
    expect(screen.getByText(/50\.0%/)).toBeInTheDocument();
    expect(screen.getByText(/30\.0%/)).toBeInTheDocument();
    expect(screen.getByText(/20\.0%/)).toBeInTheDocument();
  });

  it("renders empty state when no categories", () => {
    render(<DonutChart dashboard={{ categories: [] }} />);

    expect(screen.getByText("No category data yet")).toBeInTheDocument();
  });

  it("renders empty state when dashboard is null", () => {
    render(<DonutChart dashboard={null} />);

    expect(screen.getByText("No category data yet")).toBeInTheDocument();
  });

  it("handles zero values correctly", () => {
    const zeroData = {
      categories: [
        { categoryName: "Food", totalSpentCents: 0 },
        { categoryName: "Transport", totalSpentCents: 5000 },
      ],
    };

    render(<DonutChart dashboard={zeroData} />);

    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Transport")).toBeInTheDocument();
    expect(screen.getAllByTestId("cell")).toHaveLength(2);
  });

  it("calculates percentages correctly", () => {
    const testData = {
      categories: [
        { categoryName: "A", totalSpentCents: 5000 },
        { categoryName: "B", totalSpentCents: 5000 },
      ],
    };

    render(<DonutChart dashboard={testData} />);

    const percentages = screen.getAllByText("50.0%");
    expect(percentages).toHaveLength(2);
  });
});