import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeListTransactions } from "./list-transactions";
import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo } from "@budget/ports";

describe("List Transactions Usecase", () => {
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

  const createUsecase = () => makeListTransactions({
    txRepo: mockTxRepo,
  });

  it("should list transactions with default parameters", async () => {
    const now = new Date("2024-01-15T10:30:00Z");
    const thirtyDaysAgo = new Date("2023-12-16T10:30:00Z");

    const transactions = [
      new Transaction({
        id: "tx-1",
        userId: "user-123",
        amountCents: 1000,
        note: "Coffee",
        occurredAt: new Date("2024-01-10T09:00:00Z"),
        createdAt: new Date("2024-01-10T09:00:00Z"),
        updatedAt: new Date("2024-01-10T09:00:00Z"),
      }),
      new Transaction({
        id: "tx-2",
        userId: "user-123",
        amountCents: 2500,
        note: "Lunch",
        occurredAt: new Date("2024-01-12T12:00:00Z"),
        createdAt: new Date("2024-01-12T12:00:00Z"),
        updatedAt: new Date("2024-01-12T12:00:00Z"),
      }),
    ];

    mockTxRepo.listByUserInPeriod.mockResolvedValue(transactions);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: "tx-1",
      userId: "user-123",
      budgetId: null,
      categoryId: null,
      amountCents: 1000,
      note: "Coffee",
      occurredAt: new Date("2024-01-10T09:00:00.000Z"),
      createdAt: new Date("2024-01-10T09:00:00.000Z"),
      updatedAt: new Date("2024-01-10T09:00:00.000Z"),
    });

    expect(mockTxRepo.listByUserInPeriod).toHaveBeenCalledWith(
      "user-123",
      expect.any(Date),
      expect.any(Date)
    );

    const [userId, startDate, endDate] = mockTxRepo.listByUserInPeriod.mock.calls[0];
    expect(endDate.getTime()).toBeGreaterThan(startDate.getTime());
    expect((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)).toBeCloseTo(30, 0);
  });

  it("should list transactions with custom date range", async () => {
    const startDate = new Date("2024-01-01T00:00:00Z");
    const endDate = new Date("2024-01-31T23:59:59Z");

    const transactions = [
      new Transaction({
        id: "tx-1",
        userId: "user-123",
        amountCents: 1000,
        note: "Coffee",
        occurredAt: new Date("2024-01-10T09:00:00Z"),
        createdAt: new Date("2024-01-10T09:00:00Z"),
        updatedAt: new Date("2024-01-10T09:00:00Z"),
      }),
    ];

    mockTxRepo.listByUserInPeriod.mockResolvedValue(transactions);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      startDate,
      endDate,
    });

    expect(result).toHaveLength(1);
    expect(mockTxRepo.listByUserInPeriod).toHaveBeenCalledWith(
      "user-123",
      startDate,
      endDate
    );
  });

  it("should list transactions with custom days", async () => {
    const transactions = [
      new Transaction({
        id: "tx-1",
        userId: "user-123",
        amountCents: 1000,
        note: "Coffee",
        occurredAt: new Date("2024-01-10T09:00:00Z"),
        createdAt: new Date("2024-01-10T09:00:00Z"),
        updatedAt: new Date("2024-01-10T09:00:00Z"),
      }),
    ];

    mockTxRepo.listByUserInPeriod.mockResolvedValue(transactions);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      days: 7,
    });

    expect(result).toHaveLength(1);
    const [userId, startDate, endDate] = mockTxRepo.listByUserInPeriod.mock.calls[0];
    expect((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)).toBeCloseTo(7, 0);
  });

  it("should respect limit parameter", async () => {
    const transactions = Array.from({ length: 10 }, (_, i) =>
      new Transaction({
        id: `tx-${i + 1}`,
        userId: "user-123",
        amountCents: 1000 + i * 100,
        note: `Transaction ${i + 1}`,
        occurredAt: new Date(`2024-01-${10 + i}T09:00:00Z`),
        createdAt: new Date(`2024-01-${10 + i}T09:00:00Z`),
        updatedAt: new Date(`2024-01-${10 + i}T09:00:00Z`),
      })
    );

    mockTxRepo.listByUserInPeriod.mockResolvedValue(transactions);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      limit: 5,
    });

    expect(result).toHaveLength(5);
    expect(result[0].id).toBe("tx-1");
    expect(result[4].id).toBe("tx-5");
  });

  it("should use default limit when not specified", async () => {
    const transactions = Array.from({ length: 60 }, (_, i) =>
      new Transaction({
        id: `tx-${i + 1}`,
        userId: "user-123",
        amountCents: 1000 + i * 100,
        note: `Transaction ${i + 1}`,
        occurredAt: new Date(`2024-01-${10 + i}T09:00:00Z`),
        createdAt: new Date(`2024-01-${10 + i}T09:00:00Z`),
        updatedAt: new Date(`2024-01-${10 + i}T09:00:00Z`),
      })
    );

    mockTxRepo.listByUserInPeriod.mockResolvedValue(transactions);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
    });

    expect(result).toHaveLength(50); // Default limit
  });

  it("should return empty array when no transactions found", async () => {
    mockTxRepo.listByUserInPeriod.mockResolvedValue([]);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
    });

    expect(result).toEqual([]);
  });

  it("should handle repository errors", async () => {
    mockTxRepo.listByUserInPeriod.mockRejectedValue(new Error("Database connection failed"));

    const usecase = createUsecase();

    await expect(usecase({
      userId: "user-123",
    })).rejects.toThrow("Database connection failed");
  });

  it("should prioritize explicit startDate/endDate over days", async () => {
    const startDate = new Date("2024-01-01T00:00:00Z");
    const endDate = new Date("2024-01-31T23:59:59Z");

    const transactions = [
      new Transaction({
        id: "tx-1",
        userId: "user-123",
        amountCents: 1000,
        note: "Coffee",
        occurredAt: new Date("2024-01-10T09:00:00Z"),
        createdAt: new Date("2024-01-10T09:00:00Z"),
        updatedAt: new Date("2024-01-10T09:00:00Z"),
      }),
    ];

    mockTxRepo.listByUserInPeriod.mockResolvedValue(transactions);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      startDate,
      endDate,
      days: 7, // Should be ignored
    });

    expect(mockTxRepo.listByUserInPeriod).toHaveBeenCalledWith(
      "user-123",
      startDate,
      endDate
    );
  });
});