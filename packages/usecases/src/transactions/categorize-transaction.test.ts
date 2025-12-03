import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeCategorizeTransaction } from "./categorize-transaction";
import { Transaction, Category } from "@budget/domain";
import type { TransactionsRepo, CategoriesRepo, CategorizationPort, ClockPort } from "@budget/ports";

describe("Categorize Transaction Usecase", () => {
  let mockTxRepo: vi.MockedObject<TransactionsRepo>;
  let mockCategoriesRepo: vi.MockedObject<CategoriesRepo>;
  let mockCategorization: vi.MockedObject<CategorizationPort>;
  let mockClock: vi.MockedObject<ClockPort>;

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

    mockCategoriesRepo = {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      listActiveByUser: vi.fn(),
      seedDefaults: vi.fn(),
    };

    mockCategorization = {
      categorizeTransaction: vi.fn(),
    };

    mockClock = {
      now: vi.fn(),
    };
  });

  const createUsecase = () => makeCategorizeTransaction({
    txRepo: mockTxRepo,
    categoriesRepo: mockCategoriesRepo,
    categorization: mockCategorization,
    clock: mockClock,
  });

  it("should successfully categorize a transaction", async () => {
    const transaction = new Transaction({
      id: "tx-123",
      userId: "user-123",
      amountCents: 2500,
      note: "Coffee at Starbucks",
      occurredAt: new Date("2024-01-10T15:00:00Z"),
      createdAt: new Date("2024-01-10T15:00:00Z"),
      updatedAt: new Date("2024-01-10T15:00:00Z"),
    });

    const categories = [
      new Category({
        id: "cat-1",
        userId: "user-123",
        name: "Food Dining",
        icon: "🍽️",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      }),
      new Category({
        id: "cat-2",
        userId: "user-123",
        name: "Transportation",
        icon: "🚗",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      }),
    ];

    const categorizationResult = {
      categoryId: "cat-1",
      reasoning: "This appears to be a food purchase",
    };

    const now = new Date("2024-01-15T10:30:00Z");

    mockTxRepo.getById.mockResolvedValue(transaction);
    mockCategoriesRepo.listActiveByUser.mockResolvedValue(categories);
    mockCategorization.categorizeTransaction.mockResolvedValue(categorizationResult);
    mockClock.now.mockReturnValue(now);
    mockTxRepo.update.mockResolvedValue(undefined);

    const usecase = createUsecase();
    const result = await usecase({
      transactionId: "tx-123",
      userId: "user-123",
    });

    expect(result).toEqual(categorizationResult);
    expect(mockTxRepo.getById).toHaveBeenCalledWith("tx-123");
    expect(mockCategoriesRepo.listActiveByUser).toHaveBeenCalledWith("user-123");
    expect(mockCategorization.categorizeTransaction).toHaveBeenCalledWith(
      "Coffee at Starbucks",
      2500,
      [
        { id: "cat-1", name: "Food Dining", icon: "🍽️" },
        { id: "cat-2", name: "Transportation", icon: "🚗" },
      ],
      "user-123"
    );

    expect(mockTxRepo.update).toHaveBeenCalledWith(
      expect.any(Transaction)
    );

    const updatedTx = mockTxRepo.update.mock.calls[0][0] as Transaction;
    expect(updatedTx.props.categoryId).toBe("cat-1");
    expect(updatedTx.props.updatedAt).toEqual(now);
  });

  it("should return null if transaction is already categorized", async () => {
    const transaction = new Transaction({
      id: "tx-123",
      userId: "user-123",
      categoryId: "cat-existing",
      amountCents: 2500,
      note: "Coffee at Starbucks",
      occurredAt: new Date("2024-01-10T15:00:00Z"),
      createdAt: new Date("2024-01-10T15:00:00Z"),
      updatedAt: new Date("2024-01-10T15:00:00Z"),
    });

    mockTxRepo.getById.mockResolvedValue(transaction);

    const usecase = createUsecase();
    const result = await usecase({
      transactionId: "tx-123",
      userId: "user-123",
    });

    expect(result).toBeNull();
    expect(mockCategoriesRepo.listActiveByUser).not.toHaveBeenCalled();
    expect(mockCategorization.categorizeTransaction).not.toHaveBeenCalled();
    expect(mockTxRepo.update).not.toHaveBeenCalled();
  });

  it("should return null if transaction has no note", async () => {
    const transaction = new Transaction({
      id: "tx-123",
      userId: "user-123",
      amountCents: 2500,
      note: null,
      occurredAt: new Date("2024-01-10T15:00:00Z"),
      createdAt: new Date("2024-01-10T15:00:00Z"),
      updatedAt: new Date("2024-01-10T15:00:00Z"),
    });

    mockTxRepo.getById.mockResolvedValue(transaction);

    const usecase = createUsecase();
    const result = await usecase({
      transactionId: "tx-123",
      userId: "user-123",
    });

    expect(result).toBeNull();
    expect(mockCategoriesRepo.listActiveByUser).not.toHaveBeenCalled();
    expect(mockCategorization.categorizeTransaction).not.toHaveBeenCalled();
    expect(mockTxRepo.update).not.toHaveBeenCalled();
  });

  it("should return null if no categories are available", async () => {
    const transaction = new Transaction({
      id: "tx-123",
      userId: "user-123",
      amountCents: 2500,
      note: "Coffee at Starbucks",
      occurredAt: new Date("2024-01-10T15:00:00Z"),
      createdAt: new Date("2024-01-10T15:00:00Z"),
      updatedAt: new Date("2024-01-10T15:00:00Z"),
    });

    mockTxRepo.getById.mockResolvedValue(transaction);
    mockCategoriesRepo.listActiveByUser.mockResolvedValue([]);

    const usecase = createUsecase();
    const result = await usecase({
      transactionId: "tx-123",
      userId: "user-123",
    });

    expect(result).toBeNull();
    expect(mockCategorization.categorizeTransaction).not.toHaveBeenCalled();
    expect(mockTxRepo.update).not.toHaveBeenCalled();
  });

  it("should return null if categorization service returns null", async () => {
    const transaction = new Transaction({
      id: "tx-123",
      userId: "user-123",
      amountCents: 2500,
      note: "Coffee at Starbucks",
      occurredAt: new Date("2024-01-10T15:00:00Z"),
      createdAt: new Date("2024-01-10T15:00:00Z"),
      updatedAt: new Date("2024-01-10T15:00:00Z"),
    });

    const categories = [
      new Category({
        id: "cat-1",
        userId: "user-123",
        name: "Food Dining",
        icon: "🍽️",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      }),
    ];

    mockTxRepo.getById.mockResolvedValue(transaction);
    mockCategoriesRepo.listActiveByUser.mockResolvedValue(categories);
    mockCategorization.categorizeTransaction.mockResolvedValue(null);

    const usecase = createUsecase();
    const result = await usecase({
      transactionId: "tx-123",
      userId: "user-123",
    });

    expect(result).toBeNull();
    expect(mockTxRepo.update).not.toHaveBeenCalled();
  });

  it("should throw error if transaction not found", async () => {
    mockTxRepo.getById.mockResolvedValue(null);

    const usecase = createUsecase();

    await expect(usecase({
      transactionId: "tx-123",
      userId: "user-123",
    })).rejects.toThrow("Transaction not found");
  });

  it("should throw error if transaction belongs to different user", async () => {
    const transaction = new Transaction({
      id: "tx-123",
      userId: "user-456", // Different user
      amountCents: 2500,
      note: "Coffee at Starbucks",
      occurredAt: new Date("2024-01-10T15:00:00Z"),
      createdAt: new Date("2024-01-10T15:00:00Z"),
      updatedAt: new Date("2024-01-10T15:00:00Z"),
    });

    mockTxRepo.getById.mockResolvedValue(transaction);

    const usecase = createUsecase();

    await expect(usecase({
      transactionId: "tx-123",
      userId: "user-123",
    })).rejects.toThrow("Transaction not found");
  });

  it("should handle categorization service errors", async () => {
    const transaction = new Transaction({
      id: "tx-123",
      userId: "user-123",
      amountCents: 2500,
      note: "Coffee at Starbucks",
      occurredAt: new Date("2024-01-10T15:00:00Z"),
      createdAt: new Date("2024-01-10T15:00:00Z"),
      updatedAt: new Date("2024-01-10T15:00:00Z"),
    });

    const categories = [
      new Category({
        id: "cat-1",
        userId: "user-123",
        name: "Food Dining",
        icon: "🍽️",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      }),
    ];

    mockTxRepo.getById.mockResolvedValue(transaction);
    mockCategoriesRepo.listActiveByUser.mockResolvedValue(categories);
    mockCategorization.categorizeTransaction.mockRejectedValue(new Error("LLM service unavailable"));

    const usecase = createUsecase();

    await expect(usecase({
      transactionId: "tx-123",
      userId: "user-123",
    })).rejects.toThrow("LLM service unavailable");
  });
});