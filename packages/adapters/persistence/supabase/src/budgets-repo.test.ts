import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabaseBudgetsRepo } from "./budgets-repo";
import { Budget } from "@budget/domain";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("Supabase Budgets Repository", () => {
  let mockClient: vi.MockedObject<SupabaseClient>;
  let mockFrom: any;
  let mockSelect: any;
  let mockInsert: any;
  let mockUpdate: any;
  let mockDelete: any;
  let mockEq: any;
  let mockLte: any;
  let mockOr: any;
  let mockOrder: any;
  let mockLimit: any;
  let mockMaybeSingle: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMaybeSingle = vi.fn();
    mockLimit = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    mockOrder = vi.fn().mockReturnValue({ ascending: true });
    mockOr = vi.fn();
    mockLte = vi.fn().mockReturnValue({ or: mockOr });
    mockEq = vi.fn();
    mockDelete = vi.fn();
    mockUpdate = vi.fn();
    mockInsert = vi.fn();
    mockSelect = vi.fn();

    mockFrom = vi.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    });

    mockClient = {
      from: mockFrom,
    } as any;

    // Set up the chain for select queries
    mockSelect.mockReturnValue({
      eq: mockEq,
      lte: mockLte,
      order: mockOrder,
      limit: mockLimit,
    });

    mockEq.mockReturnValue({
      eq: mockEq,
      lte: mockLte,
      order: mockOrder,
      limit: mockLimit,
      maybeSingle: mockMaybeSingle,
    });

    mockLte.mockReturnValue({
      or: mockOr,
    });

    mockOr.mockReturnValue({
      // Final chain
    });

    mockOrder.mockReturnValue({
      // Final chain
    });
  });

  const createRepo = () => makeSupabaseBudgetsRepo({ client: mockClient });

  it("should get budget by id when found", async () => {
    const budgetRow = {
      id: "budget-123",
      user_id: "user-456",
      category_id: "cat-789",
      name: "Food Budget",
      amount_cents: 50000,
      spent_cents: 25000,
      start_date: "2024-01-01T00:00:00Z",
      end_date: "2024-01-31T23:59:59Z",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    mockMaybeSingle.mockResolvedValue({ data: budgetRow, error: null });

    const repo = createRepo();
    const result = await repo.getById("budget-123");

    expect(result).toBeInstanceOf(Budget);
    expect(result?.id).toBe("budget-123");
    expect(result?.props.userId).toBe("user-456");
    expect(result?.props.categoryId).toBe("cat-789");
    expect(result?.props.name).toBe("Food Budget");
    expect(result?.props.amountCents).toBe(50000);

    expect(mockFrom).toHaveBeenCalledWith("budgets");
    expect(mockSelect).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", "budget-123");
    expect(mockLimit).toHaveBeenCalledWith(1);
    expect(mockMaybeSingle).toHaveBeenCalled();
  });

  it("should return null when budget not found", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const repo = createRepo();
    const result = await repo.getById("budget-nonexistent");

    expect(result).toBeNull();
  });

  it("should throw error on database error", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: new Error("Database error") });

    const repo = createRepo();

    await expect(repo.getById("budget-123")).rejects.toThrow("Database error");
  });

  it("should list budgets by user", async () => {
    const budgetRows = [
      {
        id: "budget-1",
        user_id: "user-123",
        category_id: "cat-1",
        name: "Food Budget",
        amount_cents: 50000,
        spent_cents: 25000,
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-01-31T23:59:59Z",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "budget-2",
        user_id: "user-123",
        category_id: "cat-2",
        name: "Transport Budget",
        amount_cents: 30000,
        spent_cents: 15000,
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-01-31T23:59:59Z",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    mockEq.mockReturnValue({
      order: mockOrder,
    });

    mockOrder.mockResolvedValue({ data: budgetRows, error: null });

    const repo = createRepo();
    const result = await repo.listByUser("user-123");

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("budget-1");
    expect(result[1].id).toBe("budget-2");

    expect(mockFrom).toHaveBeenCalledWith("budgets");
    expect(mockSelect).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: true });
  });

  it("should list active budgets by user without date filter", async () => {
    const budgetRows = [
      {
        id: "budget-1",
        user_id: "user-123",
        category_id: "cat-1",
        name: "Active Budget",
        amount_cents: 50000,
        spent_cents: 25000,
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-01-31T23:59:59Z",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    const mockQueryResult = { data: budgetRows, error: null };
    const mockChainedQuery = {
      eq: vi.fn().mockResolvedValue(mockQueryResult),
    };

    mockEq.mockReturnValue(mockChainedQuery);

    const repo = createRepo();
    const result = await repo.listActiveByUser("user-123");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("budget-1");

    expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
    expect(mockChainedQuery.eq).toHaveBeenCalledWith("is_active", true);
  });

  it("should list active budgets by user with date filter", async () => {
    const budgetRows = [
      {
        id: "budget-1",
        user_id: "user-123",
        category_id: "cat-1",
        name: "Active Budget",
        amount_cents: 50000,
        spent_cents: 25000,
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-01-31T23:59:59Z",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    const date = new Date("2024-01-15T00:00:00Z");

    mockEq.mockReturnValue({
      eq: mockEq,
      lte: mockLte,
    });

    mockLte.mockReturnValue({
      or: mockOr,
    });

    mockOr.mockResolvedValue({ data: budgetRows, error: null });

    const repo = createRepo();
    const result = await repo.listActiveByUser("user-123", date);

    expect(result).toHaveLength(1);

    expect(mockLte).toHaveBeenCalledWith("start_date", date.toISOString());
    expect(mockOr).toHaveBeenCalledWith(`end_date.is.null,end_date.gte.${date.toISOString()}`);
  });

  it("should create a budget", async () => {
    const budget = new Budget({
      id: "budget-123",
      userId: "user-456",
      categoryId: "cat-789",
      name: "Test Budget",
      amountCents: 50000,
      currency: "USD",
      period: "MONTHLY",
      startDate: new Date("2024-01-01T00:00:00Z"),
      endDate: new Date("2024-01-31T23:59:59Z"),
      isActive: true,
      alertThreshold: 80,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    });

    mockInsert.mockResolvedValue({ error: null });

    const repo = createRepo();
    await repo.create(budget);

    expect(mockFrom).toHaveBeenCalledWith("budgets");
    expect(mockInsert).toHaveBeenCalledWith({
      id: "budget-123",
      user_id: "user-456",
      category_id: "cat-789",
      name: "Test Budget",
      amount_cents: 50000,
      currency: "USD",
      period: "MONTHLY",
      start_date: "2024-01-01T00:00:00.000Z",
      end_date: "2024-01-31T23:59:59.000Z",
      is_active: true,
      alert_threshold: 80,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    });
  });

  it("should update a budget", async () => {
    const budget = new Budget({
      id: "budget-123",
      userId: "user-456",
      categoryId: "cat-789",
      name: "Updated Budget",
      amountCents: 60000,
      currency: "EUR",
      period: "WEEKLY",
      startDate: new Date("2024-01-01T00:00:00Z"),
      endDate: new Date("2024-01-31T23:59:59Z"),
      isActive: true,
      alertThreshold: 90,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-15T00:00:00Z"),
    });

    const mockQueryResult = { error: null };
    const mockSecondEq = vi.fn().mockResolvedValue(mockQueryResult);
    const mockChainedQuery = {
      eq: vi.fn().mockReturnValue({
        eq: mockSecondEq,
      }),
    };

    mockUpdate.mockReturnValue(mockChainedQuery);

    const repo = createRepo();
    await repo.update(budget);

    expect(mockFrom).toHaveBeenCalledWith("budgets");
    expect(mockUpdate).toHaveBeenCalledWith({
      id: "budget-123",
      user_id: "user-456",
      category_id: "cat-789",
      name: "Updated Budget",
      amount_cents: 60000,
      currency: "EUR",
      period: "WEEKLY",
      start_date: "2024-01-01T00:00:00.000Z",
      end_date: "2024-01-31T23:59:59.000Z",
      is_active: true,
      alert_threshold: 90,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-15T00:00:00.000Z",
    });

    expect(mockChainedQuery.eq).toHaveBeenCalledWith("id", "budget-123");
    expect(mockSecondEq).toHaveBeenCalledWith("user_id", "user-456");
  });

  it("should delete a budget with user filter", async () => {
    const mockQueryResult = { error: null };
    const mockSecondEq = vi.fn().mockResolvedValue(mockQueryResult);
    const mockChainedQuery = {
      eq: vi.fn().mockReturnValue({
        eq: mockSecondEq,
      }),
    };

    mockDelete.mockReturnValue(mockChainedQuery);

    const repo = createRepo();
    await repo.delete("budget-123", "user-456");

    expect(mockFrom).toHaveBeenCalledWith("budgets");
    expect(mockDelete).toHaveBeenCalled();
    expect(mockChainedQuery.eq).toHaveBeenCalledWith("id", "budget-123");
    expect(mockSecondEq).toHaveBeenCalledWith("user_id", "user-456");
  });

  it("should delete a budget without user filter", async () => {
    mockDelete.mockReturnValue({
      eq: mockEq,
    });

    mockEq.mockResolvedValue({ error: null });

    const repo = createRepo();
    await repo.delete("budget-123");

    expect(mockFrom).toHaveBeenCalledWith("budgets");
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", "budget-123");
  });
});