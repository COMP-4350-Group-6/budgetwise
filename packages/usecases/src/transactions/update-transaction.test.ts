import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeUpdateTransaction } from "./update-transaction";
import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo, ClockPort } from "@budget/ports";

describe("Update Transaction Usecase", () => {
  let mockTxRepo: vi.MockedObject<TransactionsRepo>;
  let mockClock: vi.MockedObject<ClockPort>;

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

    mockClock = {
      now: vi.fn(),
    };
  });

  const createUsecase = () => makeUpdateTransaction({
    txRepo: mockTxRepo,
    clock: mockClock,
  });

  it("should update transaction with partial data", async () => {
    const existingTransaction = new Transaction({
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

    const now = new Date("2024-01-15T10:30:00Z");

    mockTxRepo.getById.mockResolvedValue(existingTransaction);
    mockClock.now.mockReturnValue(now);
    mockTxRepo.update.mockResolvedValue(undefined);

    const usecase = createUsecase();
    const result = await usecase({
      transactionId: "tx-123",
      userId: "user-456",
      note: "Updated coffee purchase",
      amountCents: 3000,
    });

    expect(result).toEqual({
      id: "tx-123",
      userId: "user-456",
      budgetId: "budget-789",
      categoryId: "cat-101",
      amountCents: 3000,
      note: "Updated coffee purchase",
      occurredAt: new Date("2024-01-10T15:30:00Z"),
      createdAt: new Date("2024-01-10T15:30:00Z"),
      updatedAt: new Date("2024-01-15T10:30:00Z"),
    });

    expect(mockTxRepo.getById).toHaveBeenCalledWith("tx-123");
    expect(mockTxRepo.update).toHaveBeenCalledWith(
      expect.any(Transaction)
    );

    const updatedTx = mockTxRepo.update.mock.calls[0][0] as Transaction;
    expect(updatedTx.props).toEqual({
      id: "tx-123",
      userId: "user-456",
      budgetId: "budget-789",
      categoryId: "cat-101",
      amountCents: 3000,
      note: "Updated coffee purchase",
      occurredAt: new Date("2024-01-10T15:30:00Z"),
      createdAt: new Date("2024-01-10T15:30:00Z"),
      updatedAt: now,
    });
  });

  it("should update all fields when provided", async () => {
    const existingTransaction = new Transaction({
      id: "tx-123",
      userId: "user-456",
      budgetId: "budget-old",
      categoryId: "cat-old",
      amountCents: 2500,
      note: "Old note",
      occurredAt: new Date("2024-01-10T15:30:00Z"),
      createdAt: new Date("2024-01-10T15:30:00Z"),
      updatedAt: new Date("2024-01-10T15:30:00Z"),
    });

    const now = new Date("2024-01-15T10:30:00Z");
    const newOccurredAt = new Date("2024-01-12T14:20:00Z");

    mockTxRepo.getById.mockResolvedValue(existingTransaction);
    mockClock.now.mockReturnValue(now);
    mockTxRepo.update.mockResolvedValue(undefined);

    const usecase = createUsecase();
    const result = await usecase({
      transactionId: "tx-123",
      userId: "user-456",
      budgetId: "budget-new",
      categoryId: "cat-new",
      amountCents: 5000,
      note: "New note",
      occurredAt: newOccurredAt,
    });

    expect(result?.budgetId).toBe("budget-new");
    expect(result?.categoryId).toBe("cat-new");
    expect(result?.amountCents).toBe(5000);
    expect(result?.note).toBe("New note");
    expect(result?.occurredAt).toEqual(new Date("2024-01-12T14:20:00Z"));
    expect(result?.updatedAt).toEqual(new Date("2024-01-15T10:30:00Z"));
  });

  it("should return null if transaction not found", async () => {
    mockTxRepo.getById.mockResolvedValue(null);

    const usecase = createUsecase();
    const result = await usecase({
      transactionId: "tx-nonexistent",
      userId: "user-456",
      note: "Updated note",
    });

    expect(result).toBeNull();
    expect(mockTxRepo.update).not.toHaveBeenCalled();
  });

  it("should return null if transaction belongs to different user", async () => {
    const existingTransaction = new Transaction({
      id: "tx-123",
      userId: "user-456",
      amountCents: 2500,
      note: "Coffee",
      occurredAt: new Date("2024-01-10T15:30:00Z"),
      createdAt: new Date("2024-01-10T15:30:00Z"),
      updatedAt: new Date("2024-01-10T15:30:00Z"),
    });

    mockTxRepo.getById.mockResolvedValue(existingTransaction);

    const usecase = createUsecase();
    const result = await usecase({
      transactionId: "tx-123",
      userId: "user-different", // Different user
      note: "Updated note",
    });

    expect(result).toBeNull();
    expect(mockTxRepo.update).not.toHaveBeenCalled();
  });

  it("should handle repository errors during get", async () => {
    mockTxRepo.getById.mockRejectedValue(new Error("Database connection failed"));

    const usecase = createUsecase();

    await expect(usecase({
      transactionId: "tx-123",
      userId: "user-456",
      note: "Updated note",
    })).rejects.toThrow("Database connection failed");
  });

  it("should handle repository errors during update", async () => {
    const existingTransaction = new Transaction({
      id: "tx-123",
      userId: "user-456",
      amountCents: 2500,
      note: "Coffee",
      occurredAt: new Date("2024-01-10T15:30:00Z"),
      createdAt: new Date("2024-01-10T15:30:00Z"),
      updatedAt: new Date("2024-01-10T15:30:00Z"),
    });

    mockTxRepo.getById.mockResolvedValue(existingTransaction);
    mockTxRepo.update.mockRejectedValue(new Error("Update failed"));

    const usecase = createUsecase();

    await expect(usecase({
      transactionId: "tx-123",
      userId: "user-456",
      note: "Updated note",
    })).rejects.toThrow("Update failed");
  });

  it("should preserve existing values when not provided in update", async () => {
    const existingTransaction = new Transaction({
      id: "tx-123",
      userId: "user-456",
      budgetId: "budget-789",
      categoryId: "cat-101",
      amountCents: 2500,
      note: "Original note",
      occurredAt: new Date("2024-01-10T15:30:00Z"),
      createdAt: new Date("2024-01-10T15:30:00Z"),
      updatedAt: new Date("2024-01-10T15:30:00Z"),
    });

    const now = new Date("2024-01-15T10:30:00Z");

    mockTxRepo.getById.mockResolvedValue(existingTransaction);
    mockClock.now.mockReturnValue(now);
    mockTxRepo.update.mockResolvedValue(undefined);

    const usecase = createUsecase();
    const result = await usecase({
      transactionId: "tx-123",
      userId: "user-456",
      // Only updating note, others should remain the same
      note: "Updated note",
    });

    expect(result?.budgetId).toBe("budget-789");
    expect(result?.categoryId).toBe("cat-101");
    expect(result?.amountCents).toBe(2500);
    expect(result?.note).toBe("Updated note");
    expect(result?.occurredAt).toEqual(new Date("2024-01-10T15:30:00Z"));
    expect(result?.updatedAt).toEqual(new Date("2024-01-15T10:30:00Z"));
  });
});