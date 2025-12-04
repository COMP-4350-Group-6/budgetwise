import { render, screen, waitFor } from "@testing-library/react";
import { vi, Mock } from "vitest";
import SignupPage from "@/app/(public)/signup/page";
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
  getSignupUrl: () => "https://auth.example.com/signup",
}));

import { useAuth } from "@/hooks/useAuth";

describe("SignupPage", () => {
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

    render(<SignupPage />);
    expect(screen.getByText(/Redirecting.../i)).toBeInTheDocument();
  });

  it("redirects authenticated users to /home", async () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(<SignupPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/home");
    });
  });

  it("redirects unauthenticated users to auth app signup", async () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(<SignupPage />);

    await waitFor(() => {
      expect(window.location.href).toBe("https://auth.example.com/signup");
    });
  });

  it("does not redirect while loading", () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(<SignupPage />);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(window.location.href).toBe("");
  });
});
