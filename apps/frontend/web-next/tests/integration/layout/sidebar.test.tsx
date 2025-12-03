import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "@/components/sidebar/sidebar";
import { vi } from "vitest";
import { useSidebarState } from "@/app/(protected)/ProtectedLayoutClient";

// Mock sidebar state
vi.mock("@/app/(protected)/ProtectedLayoutClient", () => ({
  useSidebarState: vi.fn(),
}));

// Mock config
vi.mock("@/lib/config", () => ({
  getLogoutUrl: () => "https://auth.budgetwise.ca/logout",
}));

describe("Sidebar Component", () => {
  const mockToggle = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    (useSidebarState as any).mockReturnValue({
      collapsed: false,
      toggleCollapse: mockToggle,
    });
    localStorage.clear();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it("renders all navigation links", () => {
    render(<Sidebar />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Budget")).toBeInTheDocument();
    // expect(screen.getByText("Insights")).toBeInTheDocument();
  });

  it("calls toggleCollapse when collapse button is clicked", () => {
    render(<Sidebar />);
    const toggleBtn = screen.getByRole("button", { name: "" }); // the arrow button
    fireEvent.click(toggleBtn);
    expect(mockToggle).toHaveBeenCalled();
  });

  it("removes tokens and redirects to auth app on logout", () => {
    localStorage.setItem("bw_access", "token123");
    localStorage.setItem("bw_refresh", "refresh123");

    render(<Sidebar />);
    const logoutBtn = screen.getByText("Logout");
    fireEvent.click(logoutBtn);

    expect(localStorage.getItem("bw_access")).toBeNull();
    expect(localStorage.getItem("bw_refresh")).toBeNull();
    expect(window.location.href).toBe("https://auth.budgetwise.ca/logout");
  });

  it("renders collapsed version correctly", () => {
    (useSidebarState as any).mockReturnValue({
      collapsed: true,
      toggleCollapse: mockToggle,
    });

    render(<Sidebar />);
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument(); // collapsed logo
  });
});
