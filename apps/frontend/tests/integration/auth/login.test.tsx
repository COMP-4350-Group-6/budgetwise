import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import LoginPage from "@/app/(public)/login/page";
import { authService } from "@/app/services/authService";
import { useRouter } from "next/navigation";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock auth service
vi.mock("@/app/services/authService", () => ({
  authService: {
    login: vi.fn(),
  },
}));

describe("LoginPage", () => {
  let mockPush: any;

  beforeEach(() => {
    mockPush = vi.fn();
    (useRouter as any).mockReturnValue({ push: mockPush });
    vi.clearAllMocks();
  });

  it("renders form elements correctly", () => {
    render(<LoginPage />);
    expect(screen.getByText(/BudgetWise/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    // ✅ Only select the input, not the toggle button
    expect(screen.getByLabelText(/Password/i, { selector: "input" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    render(<LoginPage />);
    const toggleButton = screen.getByRole("button", { name: /toggle password visibility/i });
    const passwordInput = screen.getByLabelText(/Password/i, { selector: "input" });

    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("calls authService.login with correct credentials", async () => {
    (authService.login as any).mockResolvedValueOnce(true);
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i, { selector: "input" }), {
      target: { value: "mypassword" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith("user@example.com", "mypassword");
      expect(mockPush).toHaveBeenCalledWith("/home");
    });
  });

  it("shows an error when login fails", async () => {
    (authService.login as any).mockRejectedValueOnce(new Error("Invalid credentials"));
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i, { selector: "input" }), {
      target: { value: "wrongpass" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /Sign In/i }));

    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
  });

  it("disables button while loading", async () => {
    (authService.login as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 500))
    );
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i, { selector: "input" }), {
      target: { value: "mypassword" },
    });

    const button = screen.getByRole("button", { name: /Sign In/i });
    fireEvent.submit(button);

    expect(button).toBeDisabled();

    await waitFor(() => expect(button).not.toBeDisabled());
  });
});
