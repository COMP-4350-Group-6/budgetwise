import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeGetTransaction } from "./get-transaction";
import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo } from "@budget/ports";

describe("Get Transaction Usecase", () => {
  let mockTxRepo: vi.MockedObject<TransactionsRepo>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTxRepo = {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      listByBudget: vi.fn(),
      listByBudgetInPeriod: vi.fn(),
      listByUserInPeriod: vi.fn(),
      sumSpentByBudgetInPeriod: vi.fn(),
      sumSpentByCategoryWithoutBudget: vi.fn(),
    };
  });

  const createUsecase = () => makeGetTransaction({
    txRepo: mockTxRepo,
  });

  it("should return transaction when found", async () => {
    const transaction = new Transaction({
      id: "tx-123",
      userId: "user-456",
      budgetId: "budget-789",
      categoryId: "cat-101",
      amountCents: 2500,
      note: "Coffee at Starbucks",
      occurredAt: new Date("2024-01-10T15:30:00Z"),
      createdAt: new Date("2024-01-10T15:30:00Z"),
      updatedAt: new Date("2024-01-10T15:30:00Z"),
    });

    mockTxRepo.getById.mockResolvedValue(transaction);

    const usecase = createUsecase();
    const result = await usecase("tx-123");

    expect(result).toEqual({
      id: "tx-123",
      userId: "user-456",
      budgetId: "budget-789",
      categoryId: "cat-101",
      amountCents: 2500,
      note: "Coffee at Starbucks",
      occurredAt: new Date("2024-01-10T15:30:00Z"),
      createdAt: new Date("2024-01-10T15:30:00Z"),
      updatedAt: new Date("2024-01-10T15:30:00Z"),
    });

    expect(mockTxRepo.getById).toHaveBeenCalledWith("tx-123");
  });

  it("should return null when transaction not found", async () => {
    mockTxRepo.getById.mockResolvedValue(null);

    const usecase = createUsecase();
    const result = await usecase("tx-nonexistent");

    expect(result).toBeNull();
    expect(mockTxRepo.getById).toHaveBeenCalledWith("tx-nonexistent");
  });

  it("should handle repository errors", async () => {
    mockTxRepo.getById.mockRejectedValue(new Error("Database connection failed"));

    const usecase = createUsecase();

    await expect(usecase("tx-123")).rejects.toThrow("Database connection failed");
  });
});