import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabaseUsersRepo } from "./users-repo";
import { User } from "@budget/domain";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("Supabase Users Repository", () => {
  let mockClient: vi.MockedObject<SupabaseClient>;
  let mockFrom: any;
  let mockSelect: any;
  let mockInsert: any;
  let mockUpdate: any;
  let mockDelete: any;
  let mockEq: any;
  let mockLimit: any;
  let mockMaybeSingle: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMaybeSingle = vi.fn();
    mockLimit = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
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
      limit: mockLimit,
    });

    mockEq.mockReturnValue({
      eq: mockEq,
      limit: mockLimit,
      maybeSingle: mockMaybeSingle,
    });

    mockLimit.mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });
  });

  const createRepo = () => makeSupabaseUsersRepo({ client: mockClient });

  it("should get user by id when found", async () => {
    const userRow = {
      id: "user-123",
      email: "user@example.com",
      name: "John Doe",
      default_currency: "USD",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    mockMaybeSingle.mockResolvedValue({ data: userRow, error: null });

    const repo = createRepo();
    const result = await repo.getById("user-123");

    expect(result).toBeInstanceOf(User);
    expect(result?.id).toBe("user-123");
    expect(result?.props.email).toBe("user@example.com");
    expect(result?.props.name).toBe("John Doe");
    expect(result?.props.defaultCurrency).toBe("USD");

    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockSelect).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", "user-123");
    expect(mockLimit).toHaveBeenCalledWith(1);
    expect(mockMaybeSingle).toHaveBeenCalled();
  });

  it("should return null when user not found by id", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const repo = createRepo();
    const result = await repo.getById("user-nonexistent");

    expect(result).toBeNull();
  });

  it("should get user by email when found", async () => {
    const userRow = {
      id: "user-123",
      email: "user@example.com",
      name: "John Doe",
      default_currency: "USD",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    mockMaybeSingle.mockResolvedValue({ data: userRow, error: null });

    const repo = createRepo();
    const result = await repo.getByEmail("user@example.com");

    expect(result).toBeInstanceOf(User);
    expect(result?.id).toBe("user-123");
    expect(result?.props.email).toBe("user@example.com");

    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockSelect).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("email", "user@example.com");
    expect(mockLimit).toHaveBeenCalledWith(1);
    expect(mockMaybeSingle).toHaveBeenCalled();
  });

  it("should return null when user not found by email", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const repo = createRepo();
    const result = await repo.getByEmail("nonexistent@example.com");

    expect(result).toBeNull();
  });

  it("should throw error on database error", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: new Error("Database error") });

    const repo = createRepo();

    await expect(repo.getById("user-123")).rejects.toThrow("Database error");
  });

  it("should create a user", async () => {
    const user = new User({
      id: "user-123",
      email: "user@example.com",
      name: "John Doe",
      defaultCurrency: "USD",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    });

    mockInsert.mockResolvedValue({ error: null });

    const repo = createRepo();
    await repo.create(user);

    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockInsert).toHaveBeenCalledWith({
      id: "user-123",
      email: "user@example.com",
      name: "John Doe",
      default_currency: "USD",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    });
  });

  it("should update a user", async () => {
    const user = new User({
      id: "user-123",
      email: "updated@example.com",
      name: "Jane Doe",
      defaultCurrency: "EUR",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-15T00:00:00Z"),
    });

    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    mockEq.mockResolvedValue({ error: null });

    const repo = createRepo();
    await repo.update(user);

    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockUpdate).toHaveBeenCalledWith({
      id: "user-123",
      email: "updated@example.com",
      name: "Jane Doe",
      default_currency: "EUR",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-15T00:00:00.000Z",
    });

    expect(mockEq).toHaveBeenCalledWith("id", "user-123");
  });

  it("should delete a user", async () => {
    mockDelete.mockReturnValue({
      eq: mockEq,
    });

    mockEq.mockResolvedValue({ error: null });

    const repo = createRepo();
    await repo.delete("user-123");

    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", "user-123");
  });

  it("should check if user exists - true", async () => {
    const userRow = { id: "user-123" };

    mockMaybeSingle.mockResolvedValue({ data: userRow, error: null });

    const repo = createRepo();
    const result = await repo.exists("user-123");

    expect(result).toBe(true);

    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockSelect).toHaveBeenCalledWith("id");
    expect(mockEq).toHaveBeenCalledWith("id", "user-123");
    expect(mockLimit).toHaveBeenCalledWith(1);
    expect(mockMaybeSingle).toHaveBeenCalled();
  });

  it("should check if user exists - false", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: { code: "PGRST116" } });

    const repo = createRepo();
    const result = await repo.exists("user-nonexistent");

    expect(result).toBe(false);
  });

  it("should throw error on exists check database error", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: { code: "OTHER", message: "Database error" } });

    const repo = createRepo();

    await expect(repo.exists("user-123")).rejects.toThrow("Database error");
  });
});