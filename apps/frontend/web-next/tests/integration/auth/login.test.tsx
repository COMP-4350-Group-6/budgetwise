import { render, screen, waitFor } from "@testing-library/react";
import { vi, Mock } from "vitest";
import LoginPage from "@/app/(public)/login/page";
import { useRouter } from "next/navigation";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Mock config
vi.mock("@/lib/config", () => ({
  getLoginUrl: () => "https://auth.example.com/login",
}));

import { useAuth } from "@/hooks/useAuth";

describe("LoginPage", () => {
  let mockReplace: Mock;
  const originalLocation = window.location;

  beforeEach(() => {
    mockReplace = vi.fn();
    (useRouter as Mock).mockReturnValue({ replace: mockReplace });
    
    // Mock window.location
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("shows loading spinner while checking auth", () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(<LoginPage />);
    expect(screen.getByText(/Redirecting.../i)).toBeInTheDocument();
  });

  it("redirects authenticated users to /home", async () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/home");
    });
  });

  it("redirects unauthenticated users to auth app", async () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(window.location.href).toBe("https://auth.example.com/login");
    });
  });

  it("does not redirect while loading", () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(<LoginPage />);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(window.location.href).toBe("");
  });
});
