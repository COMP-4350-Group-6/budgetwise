import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import PasswordRequirements, {
  requirements,
  isPasswordValid,
} from "@/components/validation/PasswordRequirement";

describe("PasswordRequirements (UI)", () => {
  it("renders all requirement labels", () => {
    render(<PasswordRequirements password="" />);
    for (const req of requirements) {
      expect(screen.getByText(req.label)).toBeInTheDocument();
    }
  });

  it("shows a mix of valid/invalid states for a typical password", () => {
    // Has number + uppercase, but no symbol
    render(<PasswordRequirements password="Abcdef12" />);
    const list = screen.getByTestId("pw-req-list");
    const items = within(list).getAllByRole("listitem");

    const states = items.map((li) => li.getAttribute("data-state"));
    expect(states).toContain("valid");
    expect(states).toContain("invalid");

    //  checks by label
    expect(
      screen.getByText("Contains at least one number").closest("li")
    ).toHaveAttribute("data-state", "valid");

    expect(
      screen.getByText("Contains at least one uppercase letter").closest("li")
    ).toHaveAttribute("data-state", "valid");

    expect(
      screen.getByText("Contains at least one special symbol").closest("li")
    ).toHaveAttribute("data-state", "invalid");
  });
});

// Note: Test case password namings assisted with chatGPT
describe("isPasswordValid (logic)", () => {
  const cases: Array<[string, boolean, string]> = [
    ["short1!", false, "too short"],
    ["alllowercase1!", false, "no uppercase"],
    ["NoNumber!", false, "no number"],
    ["NoSymbol123", false, "no symbol"],
    ["ThisIsWayTooLongPassword123!", false, "longer than 25"],
    ["GoodPass1!", true, "meets all requirements"],
  ];

  it.each(cases)("'%s' -> %s (%s)", (pwd, expected) => {
    expect(isPasswordValid(pwd)).toBe(expected);
  });
});