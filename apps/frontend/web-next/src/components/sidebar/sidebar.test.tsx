"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sidebar from "./sidebar";
import { useSidebarState } from "@/app/(protected)/ProtectedLayoutClient";
import { authService } from "@/app/services/authService";

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

// Mock authService
vi.mock("@/app/services/authService", () => ({
  authService: {
    logout: vi.fn(),
  },
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

  it("calls toggleCollapse when toggle button is clicked", async () => {
    const mockToggle = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TestWrapper collapsed={false} toggleCollapse={mockToggle}>
        <Sidebar />
      </TestWrapper>
    );

    const toggleButton = screen.getByTestId("arrow-left").closest("button");
    await user.click(toggleButton!);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("handles logout correctly", async () => {
    vi.mocked(authService.logout).mockResolvedValue();
    const user = userEvent.setup();
    
    render(
      <TestWrapper collapsed={false}>
        <Sidebar />
      </TestWrapper>
    );

    // Click logout button - should show modal
    const logoutButton = screen.getByText("Logout").closest("button");
    await user.click(logoutButton!);

    // Modal should appear with confirmation message
    expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to log out/)).toBeInTheDocument();

    // Logout API should NOT be called yet
    expect(authService.logout).not.toHaveBeenCalled();
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();

    // Get all buttons with "Logout" text and find the modal confirm button (not the sidebar button)
    const allLogoutButtons = screen.getAllByRole("button", { name: /Logout/i });
    const confirmButton = allLogoutButtons.find(btn => 
      btn.className.includes("btnDanger")
    );
    await user.click(confirmButton!);

    // Wait for async operations
    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("bw_access");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("bw_refresh");
      expect(authService.logout).toHaveBeenCalledTimes(1);
      // Accept either localhost or production URL
      expect(locationMock.href).toMatch(/logout$/);
    });
  });

  it("cancels logout when cancel button is clicked", async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper collapsed={false}>
        <Sidebar />
      </TestWrapper>
    );

    // Click logout button - should show modal
    const logoutButton = screen.getByText("Logout").closest("button");
    await user.click(logoutButton!);

    // Modal should appear
    expect(screen.getByText("Confirm Logout")).toBeInTheDocument();

    // Click cancel button
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    await user.click(cancelButton);

    // Modal should disappear
    expect(screen.queryByText("Confirm Logout")).not.toBeInTheDocument();

    // Logout should not happen
    expect(authService.logout).not.toHaveBeenCalled();
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    expect(locationMock.href).toBe("");
  });

  it("handles logout API failure gracefully", async () => {
    // Mock API failure
    vi.mocked(authService.logout).mockRejectedValue(new Error("API Error"));
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();

    render(
      <TestWrapper collapsed={false}>
        <Sidebar />
      </TestWrapper>
    );

    // Click logout and confirm
    const logoutButton = screen.getByText("Logout").closest("button");
    await user.click(logoutButton!);
    
    // Get the modal confirm button (with danger styling)
    const allLogoutButtons = screen.getAllByRole("button", { name: /Logout/i });
    const confirmButton = allLogoutButtons.find(btn => 
      btn.className.includes("btnDanger")
    );
    await user.click(confirmButton!);

    // Even with API error, should still redirect
    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
      // Accept either localhost or production URL
      expect(locationMock.href).toMatch(/logout$/);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
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