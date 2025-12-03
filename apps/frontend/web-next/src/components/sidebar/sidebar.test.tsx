"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "./sidebar";
import { useSidebarState } from "@/app/(protected)/ProtectedLayoutClient";

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid={`link-${href}`}>{children}</a>
  ),
}));

// Mock react-icons
vi.mock("react-icons/fi", () => ({
  FiArrowLeft: ({ size }: { size: number }) => <div data-testid="arrow-left" data-size={size} />,
  FiArrowRight: ({ size }: { size: number }) => <div data-testid="arrow-right" data-size={size} />,
}));

vi.mock("react-icons/fa", () => ({
  FaHome: () => <div data-testid="home-icon" />,
  FaChartLine: () => <div data-testid="chart-icon" />,
  FaWallet: () => <div data-testid="wallet-icon" />,
  FaSignOutAlt: () => <div data-testid="logout-icon" />,
}));

// Mock the sidebar state hook
vi.mock("@/app/(protected)/ProtectedLayoutClient", () => ({
  useSidebarState: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  removeItem: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.location
const locationMock = { href: '' };
Object.defineProperty(window, 'location', {
  value: locationMock
});

// Test wrapper component to provide context
function TestWrapper({ children, collapsed = false, toggleCollapse = vi.fn() }: {
  children: React.ReactNode;
  collapsed?: boolean;
  toggleCollapse?: () => void;
}) {
  // Set the mock return value for this test
  vi.mocked(useSidebarState).mockReturnValue({
    collapsed,
    toggleCollapse,
  });

  return <>{children}</>;
}

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.removeItem.mockClear();
    locationMock.href = '';
  });

  it("renders expanded sidebar with full logo and labels", () => {
    render(
      <TestWrapper collapsed={false}>
        <Sidebar />
      </TestWrapper>
    );

    expect(screen.getByText("BudgetWise")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Budget")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByTestId("arrow-left")).toBeInTheDocument();
  });

  it("renders collapsed sidebar with abbreviated logo and no labels", () => {
    render(
      <TestWrapper collapsed={true}>
        <Sidebar />
      </TestWrapper>
    );

    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByText("BudgetWise")).not.toBeInTheDocument();
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
    expect(screen.queryByText("Transactions")).not.toBeInTheDocument();
    expect(screen.queryByText("Budget")).not.toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    expect(screen.getByTestId("arrow-right")).toBeInTheDocument();
  });

  it("displays navigation links with correct icons", () => {
    render(
      <TestWrapper collapsed={false}>
        <Sidebar />
      </TestWrapper>
    );

    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    expect(screen.getByTestId("wallet-icon")).toBeInTheDocument();
    expect(screen.getByTestId("chart-icon")).toBeInTheDocument();
    expect(screen.getByTestId("logout-icon")).toBeInTheDocument();
  });

  it("calls toggleCollapse when toggle button is clicked", () => {
    const mockToggle = vi.fn();
    render(
      <TestWrapper collapsed={false} toggleCollapse={mockToggle}>
        <Sidebar />
      </TestWrapper>
    );

    const toggleButton = screen.getByTestId("arrow-left").closest("button");
    fireEvent.click(toggleButton);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("handles logout correctly", () => {
    render(
      <TestWrapper collapsed={false}>
        <Sidebar />
      </TestWrapper>
    );

    const logoutButton = screen.getByText("Logout").closest("button");
    fireEvent.click(logoutButton!);

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("bw_access");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("bw_refresh");
    expect(locationMock.href).toBe("http://localhost:5173/logout");
  });

  it("renders navigation links with correct hrefs", () => {
    render(
      <TestWrapper collapsed={false}>
        <Sidebar />
      </TestWrapper>
    );

    expect(screen.getByTestId("link-/home")).toBeInTheDocument();
    expect(screen.getByTestId("link-/transactions")).toBeInTheDocument();
    expect(screen.getByTestId("link-/budget")).toBeInTheDocument();
  });
});