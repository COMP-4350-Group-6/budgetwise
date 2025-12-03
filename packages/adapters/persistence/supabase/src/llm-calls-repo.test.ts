import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseLLMCallsRepository } from "./llm-calls-repo";
import { LLMCall } from "@budget/domain";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("Supabase LLM Calls Repository", () => {
  let mockClient: vi.MockedObject<SupabaseClient>;
  let mockFrom: any;
  let mockSelect: any;
  let mockInsert: any;
  let mockEq: any;
  let mockSingle: any;
  let mockOrder: any;
  let mockLimit: any;
  let mockRange: any;
  let mockGte: any;
  let mockLte: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockLte = vi.fn();
    mockGte = vi.fn();
    mockRange = vi.fn();
    mockLimit = vi.fn();
    mockOrder = vi.fn();
    mockSingle = vi.fn();
    mockEq = vi.fn();
    mockInsert = vi.fn();
    mockSelect = vi.fn();

    mockFrom = vi.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    });

    mockClient = {
      from: mockFrom,
    } as any;

    // Set up query chains
    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      single: mockSingle,
    });

    mockEq.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
      single: mockSingle,
    });

    mockOrder.mockReturnValue({
      limit: mockLimit,
      range: mockRange,
    });

    mockLimit.mockReturnValue({
      range: mockRange,
    });

    mockGte.mockReturnValue({
      lte: mockLte,
    });

    mockLte.mockReturnValue({
      // Final chain
    });
  });

  const createRepo = () => new SupabaseLLMCallsRepository(mockClient);

  it("should save an LLM call", async () => {
    const llmCall = new LLMCall({
      id: "call-123",
      userId: "user-456",
      provider: "openai",
      model: "gpt-4",
      callType: "auto_categorize",
      requestPayload: { prompt: "test prompt" },
      responsePayload: { result: "test result" },
      promptTokens: 100,
      completionTokens: 50,
      totalTokens: 150,
      estimatedCostCents: 5,
      status: "success",
      errorMessage: undefined,
      durationMs: 1000,
      createdAt: new Date("2024-01-15T10:30:00Z"),
    });

    mockInsert.mockResolvedValue({ error: null });

    const repo = createRepo();
    await repo.save(llmCall);

    expect(mockFrom).toHaveBeenCalledWith("llm_calls");
    expect(mockInsert).toHaveBeenCalledWith({
      id: "call-123",
      user_id: "user-456",
      provider: "openai",
      model: "gpt-4",
      call_type: "auto_categorize",
      request_payload: { prompt: "test prompt" },
      response_payload: { result: "test result" },
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150,
      estimated_cost_cents: 5,
      status: "success",
      error_message: undefined,
      duration_ms: 1000,
      created_at: "2024-01-15T10:30:00.000Z",
    });
  });

  it("should throw error when save fails", async () => {
    const llmCall = new LLMCall({
      id: "call-123",
      userId: "user-456",
      provider: "openai",
      model: "gpt-4",
      callType: "auto_categorize",
      requestPayload: { prompt: "test prompt" },
      status: "success",
      createdAt: new Date("2024-01-15T10:30:00Z"),
    });

    mockInsert.mockResolvedValue({ error: { message: "Database error" } });

    const repo = createRepo();

    await expect(repo.save(llmCall)).rejects.toThrow("Failed to save LLM call: Database error");
  });

  it("should get LLM call by id", async () => {
    const callRow = {
      id: "call-123",
      user_id: "user-456",
      provider: "openai",
      model: "gpt-4",
      call_type: "auto_categorize",
      request_payload: { prompt: "test prompt" },
      response_payload: { result: "test result" },
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150,
      estimated_cost_cents: 5,
      status: "success",
      error_message: null,
      duration_ms: 1000,
      created_at: "2024-01-15T10:30:00Z",
    };

    mockSingle.mockResolvedValue({ data: callRow, error: null });

    const repo = createRepo();
    const result = await repo.getById("call-123");

    expect(result).toBeInstanceOf(LLMCall);
    expect(result?.props.id).toBe("call-123");
    expect(result?.props.userId).toBe("user-456");
    expect(result?.props.provider).toBe("openai");
    expect(result?.props.model).toBe("gpt-4");
    expect(result?.props.callType).toBe("auto_categorize");
    expect(result?.props.status).toBe("success");

    expect(mockFrom).toHaveBeenCalledWith("llm_calls");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("id", "call-123");
    expect(mockSingle).toHaveBeenCalled();
  });

  it("should return null when LLM call not found", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: "PGRST116" } });

    const repo = createRepo();
    const result = await repo.getById("call-nonexistent");

    expect(result).toBeNull();
  });

  it("should throw error on database error during get", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: "OTHER", message: "Database error" } });

    const repo = createRepo();

    await expect(repo.getById("call-123")).rejects.toThrow("Failed to get LLM call: Database error");
  });

  it("should list LLM calls by user with default options", async () => {
    const callRows = [
      {
        id: "call-1",
        user_id: "user-123",
        provider: "openai",
        model: "gpt-4",
        call_type: "auto_categorize",
        request_payload: {},
        response_payload: {},
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
        estimated_cost_cents: 5,
        status: "success",
        error_message: null,
        duration_ms: 1000,
        created_at: "2024-01-15T10:30:00Z",
      },
    ];

    mockOrder.mockResolvedValue({ data: callRows, error: null });

    const repo = createRepo();
    const result = await repo.listByUserId("user-123");

    expect(result).toHaveLength(1);
    expect(result[0].props.id).toBe("call-1");

    expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("should list LLM calls with filters", async () => {
    const callRows = [
      {
        id: "call-1",
        user_id: "user-123",
        provider: "openai",
        model: "gpt-4",
        call_type: "auto_categorize",
        request_payload: {},
        response_payload: {},
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
        estimated_cost_cents: 5,
        status: "success",
        error_message: null,
        duration_ms: 1000,
        created_at: "2024-01-15T10:30:00Z",
      },
    ];

    const mockQueryResult = { data: callRows, error: null };
    
    // Set up the chain to resolve properly
    mockRange.mockResolvedValue(mockQueryResult);
    mockLimit.mockReturnValue({
      range: mockRange,
    });

    const mockAfterCallTypeEq = {
      limit: mockLimit,
      range: mockRange,
    };

    const mockAfterOrder = {
      eq: vi.fn().mockReturnValue(mockAfterCallTypeEq),
      limit: mockLimit,
      range: mockRange,
    };

    const mockChainedQuery = {
      order: vi.fn().mockReturnValue(mockAfterOrder),
    };

    mockEq.mockReturnValue(mockChainedQuery);

    const repo = createRepo();
    const result = await repo.listByUserId("user-123", {
      limit: 10,
      offset: 5,
      callType: "auto_categorize",
    });

    expect(result).toHaveLength(1);

    expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
    expect(mockChainedQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(mockAfterOrder.eq).toHaveBeenCalledWith("call_type", "auto_categorize");
    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(mockRange).toHaveBeenCalledWith(5, 14);
  });

  it("should get user stats", async () => {
    const callRows = [
      {
        status: "success",
        total_tokens: 150,
        estimated_cost_cents: 5,
      },
      {
        status: "error",
        total_tokens: 100,
        estimated_cost_cents: 3,
      },
      {
        status: "success",
        total_tokens: 200,
        estimated_cost_cents: 8,
      },
    ];

    mockEq.mockReturnValue({
      eq: mockEq,
      gte: mockGte,
      lte: mockLte,
    });

    mockLte.mockResolvedValue({ data: callRows, error: null });

    const repo = createRepo();
    const result = await repo.getUserStats("user-123", {
      startDate: new Date("2024-01-01T00:00:00Z"),
      endDate: new Date("2024-01-31T23:59:59Z"),
      callType: "auto_categorize",
    });

    expect(result).toEqual({
      totalCalls: 3,
      totalTokens: 450,
      totalCostCents: 16,
      successfulCalls: 2,
      failedCalls: 1,
    });

    expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
    expect(mockEq).toHaveBeenCalledWith("call_type", "auto_categorize");
    expect(mockGte).toHaveBeenCalledWith("created_at", "2024-01-01T00:00:00.000Z");
    expect(mockLte).toHaveBeenCalledWith("created_at", "2024-01-31T23:59:59.000Z");
  });

  it("should get global stats", async () => {
    const callRows = [
      {
        user_id: "user-1",
        status: "success",
        total_tokens: 150,
        estimated_cost_cents: 5,
      },
      {
        user_id: "user-2",
        status: "error",
        total_tokens: 100,
        estimated_cost_cents: 3,
      },
      {
        user_id: "user-1",
        status: "success",
        total_tokens: 200,
        estimated_cost_cents: 8,
      },
    ];

    mockSelect.mockReturnValue({
      eq: mockEq,
      gte: mockGte,
      lte: mockLte,
    });

    mockLte.mockResolvedValue({ data: callRows, error: null });

    const repo = createRepo();
    const result = await repo.getGlobalStats({
      startDate: new Date("2024-01-01T00:00:00Z"),
      endDate: new Date("2024-01-31T23:59:59Z"),
      callType: "auto_categorize",
    });

    expect(result).toEqual({
      totalCalls: 3,
      totalTokens: 450,
      totalCostCents: 16,
      successfulCalls: 2,
      failedCalls: 1,
      uniqueUsers: 2,
    });

    expect(mockSelect).toHaveBeenCalledWith("user_id, status, total_tokens, estimated_cost_cents");
    expect(mockEq).toHaveBeenCalledWith("call_type", "auto_categorize");
    expect(mockGte).toHaveBeenCalledWith("created_at", "2024-01-01T00:00:00.000Z");
    expect(mockLte).toHaveBeenCalledWith("created_at", "2024-01-31T23:59:59.000Z");
  });
});