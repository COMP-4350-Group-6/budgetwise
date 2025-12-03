import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAddTransaction } from "./add-transaction";
import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo, ClockPort, IdPort } from "@budget/ports";
import type { Currency } from "@budget/domain/money";

describe("Add Transaction Usecase", () => {
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

  const createUsecase = () => makeAddTransaction({
    txRepo: mockTxRepo,
    clock: mockClock,
    id: mockId,
  });

  it("should create a transaction with minimal data", async () => {
    const fixedDate = new Date("2024-01-15T10:30:00Z");
    const transactionId = "01HN1234567890ABCDEF";

    mockClock.now.mockReturnValue(fixedDate);
    mockId.ulid.mockReturnValue(transactionId);
    mockTxRepo.create.mockResolvedValue(undefined);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      amountCents: 2500,
      occurredAt: new Date("2024-01-10T15:00:00Z"),
    });

    expect(result).toEqual({
      id: transactionId,
      userId: "user-123",
      budgetId: null,
      categoryId: null,
      amountCents: 2500,
      note: null,
      occurredAt: new Date("2024-01-10T15:00:00Z"),
      createdAt: fixedDate,
      updatedAt: fixedDate,
    });

    expect(mockTxRepo.create).toHaveBeenCalledWith(
      expect.any(Transaction)
    );

    const calledWith = mockTxRepo.create.mock.calls[0][0] as Transaction;
    expect(calledWith.props).toEqual({
      id: transactionId,
      userId: "user-123",
      budgetId: undefined,
      amountCents: 2500,
      categoryId: undefined,
      note: undefined,
      occurredAt: new Date("2024-01-10T15:00:00Z"),
      createdAt: fixedDate,
      updatedAt: fixedDate,
    });
  });

  it("should create a transaction with all optional fields", async () => {
    const fixedDate = new Date("2024-01-15T10:30:00Z");
    const transactionId = "01HN1234567890ABCDEF";

    mockClock.now.mockReturnValue(fixedDate);
    mockId.ulid.mockReturnValue(transactionId);
    mockTxRepo.create.mockResolvedValue(undefined);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      budgetId: "budget-456",
      categoryId: "category-789",
      amountCents: 5000,
      note: "Coffee purchase",
      occurredAt: new Date("2024-01-10T15:00:00Z"),
      currency: "USD" as Currency,
    });

    expect(result).toEqual({
      id: transactionId,
      userId: "user-123",
      budgetId: "budget-456",
      categoryId: "category-789",
      amountCents: 5000,
      note: "Coffee purchase",
      occurredAt: new Date("2024-01-10T15:00:00Z"),
      createdAt: fixedDate,
      updatedAt: fixedDate,
    });

    expect(mockTxRepo.create).toHaveBeenCalledWith(
      expect.any(Transaction)
    );

    const calledWith = mockTxRepo.create.mock.calls[0][0] as Transaction;
    expect(calledWith.props).toEqual({
      id: transactionId,
      userId: "user-123",
      budgetId: "budget-456",
      amountCents: 5000,
      categoryId: "category-789",
      note: "Coffee purchase",
      occurredAt: new Date("2024-01-10T15:00:00Z"),
      createdAt: fixedDate,
      updatedAt: fixedDate,
    });
  });

  it("should handle repository errors", async () => {
    const fixedDate = new Date("2024-01-15T10:30:00Z");
    const transactionId = "01HN1234567890ABCDEF";

    mockClock.now.mockReturnValue(fixedDate);
    mockId.ulid.mockReturnValue(transactionId);
    mockTxRepo.create.mockRejectedValue(new Error("Database connection failed"));

    const usecase = createUsecase();

    await expect(usecase({
      userId: "user-123",
      amountCents: 2500,
      occurredAt: new Date("2024-01-10T15:00:00Z"),
    })).rejects.toThrow("Database connection failed");
  });

  it("should generate unique IDs for each transaction", async () => {
    const fixedDate = new Date("2024-01-15T10:30:00Z");

    mockClock.now.mockReturnValue(fixedDate);
    mockId.ulid
      .mockReturnValueOnce("01HN1234567890ABCDEF")
      .mockReturnValueOnce("01HN1234567890ABCDEG");
    mockTxRepo.create.mockResolvedValue(undefined);

    const usecase = createUsecase();

    await usecase({
      userId: "user-123",
      amountCents: 1000,
      occurredAt: new Date("2024-01-10T15:00:00Z"),
    });

    await usecase({
      userId: "user-456",
      amountCents: 2000,
      occurredAt: new Date("2024-01-11T15:00:00Z"),
    });

    expect(mockId.ulid).toHaveBeenCalledTimes(2);
    
    const firstCall = mockTxRepo.create.mock.calls[0][0] as Transaction;
    expect(firstCall.props).toEqual(expect.objectContaining({
      id: "01HN1234567890ABCDEF",
      userId: "user-123",
      amountCents: 1000,
    }));
    
    const secondCall = mockTxRepo.create.mock.calls[1][0] as Transaction;
    expect(secondCall.props).toEqual(expect.objectContaining({
      id: "01HN1234567890ABCDEG",
      userId: "user-456",
      amountCents: 2000,
    }));
  });

  it("should use current timestamp for createdAt and updatedAt", async () => {
    const fixedDate = new Date("2024-01-15T10:30:00Z");
    const transactionId = "01HN1234567890ABCDEF";

    mockClock.now.mockReturnValue(fixedDate);
    mockId.ulid.mockReturnValue(transactionId);
    mockTxRepo.create.mockResolvedValue(undefined);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      amountCents: 2500,
      occurredAt: new Date("2024-01-10T15:00:00Z"),
    });

    expect(result.createdAt).toEqual(fixedDate);
    expect(result.updatedAt).toEqual(fixedDate);
    
    const calledWith = mockTxRepo.create.mock.calls[0][0] as Transaction;
    expect(calledWith.props.createdAt).toEqual(fixedDate);
    expect(calledWith.props.updatedAt).toEqual(fixedDate);
  });
});