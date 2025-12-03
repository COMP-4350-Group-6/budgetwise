"use client";

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TransactionList from "./transactionList";
import type { TransactionDTO, CategoryDTO } from "@budget/schemas";

// Mock lucide-react
vi.mock("lucide-react", () => ({
  Pencil: ({ size }: { size: number }) => <div data-testid="pencil-icon" data-size={size} />,
}));

describe("TransactionList", () => {
  const mockCategories: CategoryDTO[] = [
    { id: "cat1", name: "Food", color: "#ff0000" },
    { id: "cat2", name: "Transport", color: "#00ff00" },
  ];

  const mockTransactions: TransactionDTO[] = [
    {
      id: "tx1",
      amountCents: -2500, // $25.00 expense
      note: "Grocery shopping",
      occurredAt: "2024-01-15T10:00:00Z",
      categoryId: "cat1",
      userId: "user1",
    },
    {
      id: "tx2",
      amountCents: 50000, // $500.00 income
      note: "Salary",
      occurredAt: "2024-01-01T10:00:00Z",
      categoryId: null,
      userId: "user1",
    },
  ];

  it("renders loading state", () => {
    render(
      <TransactionList
        transactions={[]}
        loading={true}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders empty state when no transactions", () => {
    render(
      <TransactionList
        transactions={[]}
        loading={false}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText("No transactions logged.")).toBeInTheDocument();
  });

  it("renders transactions correctly", () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={vi.fn()}
        categories={mockCategories}
      />
    );

    expect(screen.getByText("Grocery shopping")).toBeInTheDocument();
    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Uncategorized")).toBeInTheDocument();
  });

  it("displays amounts with correct formatting and colors", () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={vi.fn()}
        categories={mockCategories}
      />
    );

    expect(screen.getByText("-$25.00")).toBeInTheDocument();
    expect(screen.getByText("+$500.00")).toBeInTheDocument();
  });

  it("displays dates in readable format", () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={vi.fn()}
        categories={mockCategories}
      />
    );

    // Should show formatted dates
    expect(screen.getByText("1/15/2024")).toBeInTheDocument();
    expect(screen.getByText("1/1/2024")).toBeInTheDocument();
  });

  it("shows edit buttons for each transaction", () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={vi.fn()}
        categories={mockCategories}
      />
    );

    const editButtons = screen.getAllByRole("button");
    expect(editButtons).toHaveLength(2);
    expect(screen.getAllByTestId("pencil-icon")).toHaveLength(2);
  });

  it("calls onEdit when edit button is clicked", () => {
    const mockOnEdit = vi.fn();
    render(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        categories={mockCategories}
      />
    );

    const editButtons = screen.getAllByRole("button");
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTransactions[0]);
  });

  it("shows categorizing state when transaction is being categorized", () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={vi.fn()}
        categories={mockCategories}
        categorizingId="tx1"
      />
    );

    expect(screen.getByText("Categorizing…")).toBeInTheDocument();
    expect(screen.queryByText("Food")).not.toBeInTheDocument();
  });

  it("handles missing transaction note gracefully", () => {
    const transactionWithoutNote: TransactionDTO[] = [
      {
        id: "tx1",
        amountCents: -1000,
        note: "",
        occurredAt: "2024-01-15T10:00:00Z",
        categoryId: null,
        userId: "user1",
      },
    ];

    render(
      <TransactionList
        transactions={transactionWithoutNote}
        loading={false}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText("Description")).toBeInTheDocument();
  });
});