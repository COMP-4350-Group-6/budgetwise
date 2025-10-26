import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "@/components/sidebar/sidebar";
import { vi } from "vitest";
import { useRouter } from "next/navigation";
import { useSidebarState } from "@/app/(protected)/ProtectedLayoutClient";

// Mock router and sidebar state
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));
vi.mock("@/app/(protected)/ProtectedLayoutClient", () => ({
  useSidebarState: vi.fn(),
}));

describe("Sidebar Component", () => {
  const mockPush = vi.fn();
  const mockToggle = vi.fn();

  beforeEach(() => {
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useSidebarState as any).mockReturnValue({
      collapsed: false,
      toggleCollapse: mockToggle,
    });
    localStorage.clear();
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

  it("removes tokens and redirects on logout", () => {
    localStorage.setItem("bw_access", "token123");
    localStorage.setItem("bw_refresh", "refresh123");

    render(<Sidebar />);
    const logoutBtn = screen.getByText("Logout");
    fireEvent.click(logoutBtn);

    expect(localStorage.getItem("bw_access")).toBeNull();
    expect(localStorage.getItem("bw_refresh")).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/login");
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
