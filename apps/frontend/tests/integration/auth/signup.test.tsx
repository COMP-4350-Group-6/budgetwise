import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, Mock } from "vitest";
import SignupPage from "@/app/(public)/signup/page";
import { authService } from "@/app/services/authService";
import { useRouter } from "next/navigation";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock auth service
vi.mock("@/app/services/authService", () => ({
  authService: {
    signup: vi.fn(),
  },
}));

// Mock password validation module & component
vi.mock("@/components/validation/PasswordRequirement", () => ({
  __esModule: true,
  default: ({ password }: { password: string }) => (
    <div data-testid="password-requirements">Password: {password}</div>
  ),
  isPasswordValid: vi.fn(),
}));

// Import after mocks for safe access
import { isPasswordValid } from "@/components/validation/PasswordRequirement";

describe("SignupPage", () => {
  let mockPush: Mock;

  beforeEach(() => {
    mockPush = vi.fn();
    (useRouter as Mock).mockReturnValue({ push: mockPush });
    vi.clearAllMocks();
    (isPasswordValid as Mock).mockReturnValue(true);
  });

  it("renders all fields correctly", () => {
    render(<SignupPage />);
    expect(screen.getByText(/Create Your Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i, { selector: "input" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i, { selector: "input" })).toBeInTheDocument();
  });

  it("shows error if passwords do not match", async () => {
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Bryce" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "bryce@test.com" } });
    fireEvent.change(screen.getByLabelText(/^Password$/i, { selector: "input" }), {
      target: { value: "abcdefg" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i, { selector: "input" }), {
      target: { value: "wrongpass" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Create Account/i }));

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it("shows error if password does not meet requirements", async () => {
    (isPasswordValid as Mock).mockReturnValue(false);
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Bryce" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "bryce@test.com" } });
    fireEvent.change(screen.getByLabelText(/^Password$/i, { selector: "input" }), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i, { selector: "input" }), {
      target: { value: "123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Create Account/i }));

    expect(await screen.findByText(/Password does not meet/i)).toBeInTheDocument();
  });

  it("calls authService.signup when valid", async () => {
    (authService.signup as Mock).mockResolvedValueOnce(true);
    render(<SignupPage />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Bryce" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "bryce@test.com" } });
    fireEvent.change(screen.getByLabelText(/^Password$/i, { selector: "input" }), {
      target: { value: "GoodPass123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i, { selector: "input" }), {
      target: { value: "GoodPass123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalledWith("bryce@test.com", "GoodPass123", "Bryce");
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("shows error when signup fails", async () => {
    (authService.signup as Mock).mockRejectedValueOnce(new Error("Server error"));
    render(<SignupPage />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Bryce" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "bryce@test.com" } });
    fireEvent.change(screen.getByLabelText(/^Password$/i, { selector: "input" }), {
      target: { value: "GoodPass123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i, { selector: "input" }), {
      target: { value: "GoodPass123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Create Account/i }));

    expect(await screen.findByText(/Signup failed/i)).toBeInTheDocument();
  });
});
