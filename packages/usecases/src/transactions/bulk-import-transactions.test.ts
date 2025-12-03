import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeBulkImportTransactions } from "./bulk-import-transactions";
import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo, ClockPort, IdPort } from "@budget/ports";

describe("Bulk Import Transactions Usecase", () => {
  let mockTxRepo: vi.MockedObject<TransactionsRepo>;
  let mockClock: vi.MockedObject<ClockPort>;
  let mockId: vi.MockedObject<IdPort>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTxRepo = {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      getByUserId: vi.fn(),
      count: vi.fn(),
    };

    mockClock = {
      now: vi.fn(),
    };

    mockId = {
      ulid: vi.fn(),
    };
  });

  const createUsecase = () => makeBulkImportTransactions({
    txRepo: mockTxRepo,
    clock: mockClock,
    id: mockId,
  });

  it("should successfully import multiple transactions", async () => {
    const now = new Date("2024-01-15T10:30:00Z");

    mockClock.now.mockReturnValue(now);
    mockId.ulid
      .mockReturnValueOnce("tx-1")
      .mockReturnValueOnce("tx-2")
      .mockReturnValueOnce("tx-3");
    mockTxRepo.create.mockResolvedValue(undefined);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      transactions: [
        {
          amountCents: 1000,
          note: "Coffee",
          occurredAt: new Date("2024-01-10T09:00:00Z"),
        },
        {
          budgetId: "budget-1",
          categoryId: "cat-1",
          amountCents: 2500,
          note: "Lunch",
          occurredAt: new Date("2024-01-10T12:00:00Z"),
        },
        {
          amountCents: -500,
          note: "ATM withdrawal",
          occurredAt: new Date("2024-01-10T15:00:00Z"),
        },
      ],
    });

    expect(result).toEqual({
      imported: 3,
      failed: 0,
      total: 3,
      success: [
        {
          id: "tx-1",
          userId: "user-123",
          budgetId: null,
          categoryId: null,
          amountCents: 1000,
          note: "Coffee",
          occurredAt: new Date("2024-01-10T09:00:00.000Z"),
          createdAt: new Date("2024-01-15T10:30:00.000Z"),
          updatedAt: new Date("2024-01-15T10:30:00.000Z"),
        },
        {
          id: "tx-2",
          userId: "user-123",
          budgetId: "budget-1",
          categoryId: "cat-1",
          amountCents: 2500,
          note: "Lunch",
          occurredAt: new Date("2024-01-10T12:00:00.000Z"),
          createdAt: new Date("2024-01-15T10:30:00.000Z"),
          updatedAt: new Date("2024-01-15T10:30:00.000Z"),
        },
        {
          id: "tx-3",
          userId: "user-123",
          budgetId: null,
          categoryId: null,
          amountCents: -500,
          note: "ATM withdrawal",
          occurredAt: new Date("2024-01-10T15:00:00.000Z"),
          createdAt: new Date("2024-01-15T10:30:00.000Z"),
          updatedAt: new Date("2024-01-15T10:30:00.000Z"),
        },
      ],
      errors: [],
    });

    expect(mockTxRepo.create).toHaveBeenCalledTimes(3);
  });

  it("should handle partial failures and continue processing", async () => {
    const now = new Date("2024-01-15T10:30:00Z");

    mockClock.now.mockReturnValue(now);
    mockId.ulid
      .mockReturnValueOnce("tx-1")
      .mockReturnValueOnce("tx-2")
      .mockReturnValueOnce("tx-3");

    // First transaction succeeds, second fails, third succeeds
    mockTxRepo.create
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Database constraint violation"))
      .mockResolvedValueOnce(undefined);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      transactions: [
        {
          amountCents: 1000,
          note: "Coffee",
          occurredAt: new Date("2024-01-10T09:00:00Z"),
        },
        {
          amountCents: 2500,
          note: "Lunch",
          occurredAt: new Date("2024-01-10T12:00:00Z"),
        },
        {
          amountCents: -500,
          note: "ATM withdrawal",
          occurredAt: new Date("2024-01-10T15:00:00Z"),
        },
      ],
    });

    expect(result.imported).toBe(2);
    expect(result.failed).toBe(1);
    expect(result.total).toBe(3);
    expect(result.success).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toEqual({
      index: 1,
      error: "Database constraint violation",
      data: {
        amountCents: 2500,
        note: "Lunch",
        occurredAt: new Date("2024-01-10T12:00:00Z"),
      },
    });
  });

  it("should auto-categorize transactions without category", async () => {
    const now = new Date("2024-01-15T10:30:00Z");
    const categorizedTransaction = new Transaction({
      id: "tx-1",
      userId: "user-123",
      categoryId: "cat-auto",
      amountCents: 1000,
      note: "Coffee",
      occurredAt: new Date("2024-01-10T09:00:00Z"),
      createdAt: now,
      updatedAt: now,
    });

    mockClock.now.mockReturnValue(now);
    mockId.ulid.mockReturnValue("tx-1");
    mockTxRepo.create.mockResolvedValue(undefined);
    mockTxRepo.getById.mockResolvedValue(categorizedTransaction);

    const mockAutoCategorize = vi.fn().mockResolvedValue({ categoryId: "cat-auto" });

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      transactions: [
        {
          amountCents: 1000,
          note: "Coffee",
          occurredAt: new Date("2024-01-10T09:00:00Z"),
        },
      ],
      autoCategorize: mockAutoCategorize,
    });

    expect(result.imported).toBe(1);
    expect(result.success[0].categoryId).toBe("cat-auto");
    expect(mockAutoCategorize).toHaveBeenCalledWith("tx-1", "user-123");
    expect(mockTxRepo.getById).toHaveBeenCalledWith("tx-1");
  });

  it("should skip auto-categorization for transactions with existing category", async () => {
    const now = new Date("2024-01-15T10:30:00Z");

    mockClock.now.mockReturnValue(now);
    mockId.ulid.mockReturnValue("tx-1");
    mockTxRepo.create.mockResolvedValue(undefined);

    const mockAutoCategorize = vi.fn();

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      transactions: [
        {
          categoryId: "cat-existing",
          amountCents: 1000,
          note: "Coffee",
          occurredAt: new Date("2024-01-10T09:00:00Z"),
        },
      ],
      autoCategorize: mockAutoCategorize,
    });

    expect(mockAutoCategorize).not.toHaveBeenCalled();
  });

  it("should skip auto-categorization for transactions without note", async () => {
    const now = new Date("2024-01-15T10:30:00Z");

    mockClock.now.mockReturnValue(now);
    mockId.ulid.mockReturnValue("tx-1");
    mockTxRepo.create.mockResolvedValue(undefined);

    const mockAutoCategorize = vi.fn();

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      transactions: [
        {
          amountCents: 1000,
          note: null,
          occurredAt: new Date("2024-01-10T09:00:00Z"),
        },
      ],
      autoCategorize: mockAutoCategorize,
    });

    expect(mockAutoCategorize).not.toHaveBeenCalled();
  });

  it("should handle auto-categorization failures gracefully", async () => {
    const now = new Date("2024-01-15T10:30:00Z");

    mockClock.now.mockReturnValue(now);
    mockId.ulid.mockReturnValue("tx-1");
    mockTxRepo.create.mockResolvedValue(undefined);
    mockTxRepo.getById.mockRejectedValue(new Error("Not found"));

    const mockAutoCategorize = vi.fn().mockRejectedValue(new Error("Categorization failed"));

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      transactions: [
        {
          amountCents: 1000,
          note: "Coffee",
          occurredAt: new Date("2024-01-10T09:00:00Z"),
        },
      ],
      autoCategorize: mockAutoCategorize,
    });

    // Should still succeed despite categorization failure
    expect(result.imported).toBe(1);
    expect(result.failed).toBe(0);
    expect(result.success[0].categoryId).toBeNull();
  });

  it("should handle empty transaction list", async () => {
    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      transactions: [],
    });

    expect(result).toEqual({
      imported: 0,
      failed: 0,
      total: 0,
      success: [],
      errors: [],
    });
  });

  it("should handle transaction creation errors", async () => {
    const now = new Date("2024-01-15T10:30:00Z");

    mockClock.now.mockReturnValue(now);
    mockId.ulid.mockReturnValue("tx-1");
    mockTxRepo.create.mockRejectedValue(new Error("Invalid amount"));

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      transactions: [
        {
          amountCents: -1000000, // Invalid amount
          note: "Invalid transaction",
          occurredAt: new Date("2024-01-10T09:00:00Z"),
        },
      ],
    });

    expect(result.imported).toBe(0);
    expect(result.failed).toBe(1);
    expect(result.errors[0]).toEqual({
      index: 0,
      error: "Invalid amount",
      data: {
        amountCents: -1000000,
        note: "Invalid transaction",
        occurredAt: new Date("2024-01-10T09:00:00Z"),
      },
    });
  });
});