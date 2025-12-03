import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { createTransactionRoutes } from "../routes/transactions";
import type { TransactionDeps } from "../types";
import type { TransactionDTO } from "@budget/schemas";

describe("Transaction Routes", () => {
  let mockDeps: vi.MockedObject<TransactionDeps>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockDeps = {
      addTransaction: vi.fn(),
      updateTransaction: vi.fn(),
      deleteTransaction: vi.fn(),
      listTransactions: vi.fn(),
      getTransaction: vi.fn(),
      bulkImportTransactions: vi.fn(),
      categorizeTransaction: vi.fn(),
      parseInvoice: vi.fn(),
    };
  });

  const createApp = () => {
    const app = new Hono<{ Variables: { userId: string } }>();
    // Simulate auth middleware by setting userId
    app.use("*", async (c, next) => {
      c.set("userId", "user-123");
      await next();
    });
    // Mount the transaction routes (as they would be in the real app)
    app.route("/", createTransactionRoutes(mockDeps));
    return app;
  };

  describe("POST /transactions", () => {
    it("should create a transaction successfully", async () => {
      const mockTransaction: TransactionDTO = {
        id: "tx-1",
        userId: "user-123",
        budgetId: null,
        categoryId: null,
        amountCents: 1000,
        note: "Test transaction",
        occurredAt: "2024-01-01T00:00:00.000Z",
        createdAt: "2025-12-03T20:52:33.667Z",
        updatedAt: "2025-12-03T20:52:33.667Z",
      };

      mockDeps.addTransaction.mockResolvedValue(mockTransaction);

      const app = createApp();
      const req = new Request("http://localhost/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: 1000,
          note: "Test transaction",
          occurredAt: "2024-01-01",
        })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual({ transaction: mockTransaction });
      expect(mockDeps.addTransaction).toHaveBeenCalledWith({
        userId: "user-123",
        budgetId: undefined,
        categoryId: undefined,
        amountCents: 1000,
        note: "Test transaction",
        occurredAt: new Date("2024-01-01"),
      });
    });

    it("should handle validation errors", async () => {
      const app = createApp();
      const req = new Request("http://localhost/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: "invalid",
          occurredAt: "2024-01-01",
        })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
      expect(data.error).toBe("Validation failed");
    });
  });

  describe("PATCH /transactions/:id", () => {
    it("should update a transaction successfully", async () => {
      const mockTransaction: TransactionDTO = {
        id: "tx-1",
        userId: "user-123",
        budgetId: "budget-1",
        categoryId: "category-1",
        amountCents: 2000,
        note: "Updated transaction",
        occurredAt: "2024-01-01T00:00:00.000Z",
        createdAt: "2025-12-03T20:52:33.710Z",
        updatedAt: "2025-12-03T20:52:33.710Z",
      };

      mockDeps.updateTransaction.mockResolvedValue(mockTransaction);

      const app = createApp();
      const req = new Request("http://localhost/transactions/tx-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: 2000,
          note: "Updated transaction",
        })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ transaction: mockTransaction });
      expect(mockDeps.updateTransaction).toHaveBeenCalledWith({
        transactionId: "tx-1",
        userId: "user-123",
        budgetId: undefined,
        categoryId: undefined,
        amountCents: 2000,
        note: "Updated transaction",
        occurredAt: undefined,
      });
    });

    it("should return 404 when transaction not found", async () => {
      mockDeps.updateTransaction.mockResolvedValue(null);

      const app = createApp();
      const req = new Request("http://localhost/transactions/tx-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: "Updated note",
        })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toEqual({ error: "Transaction not found" });
    });
  });

  describe("DELETE /transactions/:id", () => {
    it("should delete a transaction successfully", async () => {
      mockDeps.deleteTransaction.mockResolvedValue(true);

      const app = createApp();
      const req = new Request("http://localhost/transactions/tx-1", {
        method: "DELETE"
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(204);
      expect(mockDeps.deleteTransaction).toHaveBeenCalledWith({
        transactionId: "tx-1",
        userId: "user-123",
      });
    });

    it("should return 404 when transaction not found", async () => {
      mockDeps.deleteTransaction.mockResolvedValue(false);

      const app = createApp();
      const req = new Request("http://localhost/transactions/tx-1", {
        method: "DELETE"
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toEqual({ error: "Transaction not found" });
    });
  });

  describe("GET /transactions", () => {
    it("should list transactions successfully", async () => {
      const mockTransactions: TransactionDTO[] = [
        {
          id: "tx-1",
          userId: "user-123",
          budgetId: null,
          categoryId: null,
          amountCents: 1000,
          note: "Transaction 1",
          occurredAt: "2024-01-01T00:00:00.000Z",
          createdAt: "2025-12-03T20:52:33.718Z",
          updatedAt: "2025-12-03T20:52:33.718Z",
        }
      ];

      mockDeps.listTransactions.mockResolvedValue(mockTransactions);

      const app = createApp();
      const req = new Request("http://localhost/transactions");

      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ transactions: mockTransactions });
      expect(mockDeps.listTransactions).toHaveBeenCalledWith({
        userId: "user-123",
        startDate: undefined,
        endDate: undefined,
        days: undefined,
        limit: undefined,
      });
    });

    it("should handle query parameters", async () => {
      const mockTransactions: TransactionDTO[] = [];

      mockDeps.listTransactions.mockResolvedValue(mockTransactions);

      const app = createApp();
      const req = new Request("http://localhost/transactions?days=30&limit=10&start=2024-01-01&end=2024-01-31");

      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      expect(mockDeps.listTransactions).toHaveBeenCalledWith({
        userId: "user-123",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
        days: 30,
        limit: 10,
      });
    });
  });

  describe("POST /transactions/:id/categorize", () => {
    it("should categorize transaction successfully", async () => {
      mockDeps.categorizeTransaction = vi.fn().mockResolvedValue({
        categoryId: "category-1",
        reasoning: "Based on transaction amount and merchant"
      });

      const app = createApp();
      const req = new Request("http://localhost/transactions/tx-1/categorize", {
        method: "POST"
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        categoryId: "category-1",
        reasoning: "Based on transaction amount and merchant"
      });
      expect(mockDeps.categorizeTransaction).toHaveBeenCalledWith({
        transactionId: "tx-1",
        userId: "user-123",
      });
    });

    it("should return message when categorization not possible", async () => {
      mockDeps.categorizeTransaction = vi.fn().mockResolvedValue(null);

      const app = createApp();
      const req = new Request("http://localhost/transactions/tx-1/categorize", {
        method: "POST"
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ message: "Could not categorize transaction" });
    });

    it("should return 503 when categorization service not available", async () => {
      mockDeps.categorizeTransaction = undefined;

      const app = createApp();
      const req = new Request("http://localhost/transactions/tx-1/categorize", {
        method: "POST"
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data).toEqual({ error: "Auto-categorization not available" });
    });
  });

  describe("POST /transactions/parse-invoice", () => {
    it("should parse invoice successfully", async () => {
      mockDeps.parseInvoice = vi.fn().mockResolvedValue({
        merchant: "Test Store",
        total: 29.99,
        confidence: 0.95
      });

      const app = createApp();
      const req = new Request("http://localhost/transactions/parse-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: "base64-image-data"
        })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        invoice: {
          merchant: "Test Store",
          total: 29.99,
          confidence: 0.95
        }
      });
      expect(mockDeps.parseInvoice).toHaveBeenCalledWith({
        userId: "user-123",
        imageBase64: "base64-image-data"
      });
    });

    it("should return 400 when image data missing", async () => {
      mockDeps.parseInvoice = vi.fn();

      const app = createApp();
      const req = new Request("http://localhost/transactions/parse-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toEqual({ error: "Missing image data" });
    });

    it("should return 503 when invoice parsing not available", async () => {
      mockDeps.parseInvoice = undefined;

      const app = createApp();
      const req = new Request("http://localhost/transactions/parse-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: "base64-image-data"
        })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data).toEqual({ error: "Invoice parsing not available" });
    });
  });

  describe("POST /transactions/bulk-import", () => {
    it("should import transactions successfully", async () => {
      const mockResult = {
        imported: 1,
        failed: 0,
        total: 1,
        success: [
          {
            id: "tx-1",
            userId: "user-123",
            budgetId: null,
            categoryId: null,
            amountCents: 1000,
            note: "Imported transaction",
            occurredAt: "2024-01-01T00:00:00.000Z",
            createdAt: "2025-12-03T20:52:33.667Z",
            updatedAt: "2025-12-03T20:52:33.667Z",
          }
        ],
        errors: []
      };

      mockDeps.bulkImportTransactions.mockResolvedValue(mockResult);

      const app = createApp();
      const req = new Request("http://localhost/transactions/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: [
            {
              amountCents: 1000,
              note: "Imported transaction",
              occurredAt: "2024-01-01"
            }
          ]
        })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual(mockResult);
      expect(mockDeps.bulkImportTransactions).toHaveBeenCalledWith({
        userId: "user-123",
        transactions: [
          {
            amountCents: 1000,
            note: "Imported transaction",
            occurredAt: new Date("2024-01-01")
          }
        ],
        autoCategorize: expect.any(Function)
      });
    });

    it("should return 207 when some transactions fail", async () => {
      const mockResult = {
        imported: 0,
        failed: 1,
        total: 1,
        success: [],
        errors: [{ index: 0, error: "Invalid amount", data: {} }]
      };

      mockDeps.bulkImportTransactions.mockResolvedValue(mockResult);

      const app = createApp();
      const req = new Request("http://localhost/transactions/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: [
            {
              amountCents: 1000,
              note: "Valid transaction",
              occurredAt: "2024-01-01"
            }
          ]
        })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(207);
      const data = await res.json();
      expect(data).toEqual(mockResult);
    });
  });
});