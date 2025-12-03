import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeParseInvoice } from "./parse-invoice";
import { Category } from "@budget/domain";
import type { CategoriesRepo, InvoiceParserPort } from "@budget/ports";

describe("Parse Invoice Usecase", () => {
  let mockCategoriesRepo: vi.MockedObject<CategoriesRepo>;
  let mockInvoiceParser: vi.MockedObject<InvoiceParserPort>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCategoriesRepo = {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      listActiveByUser: vi.fn(),
      seedDefaults: vi.fn(),
    };

    mockInvoiceParser = {
      parseInvoice: vi.fn(),
    };
  });

  const createUsecase = () => makeParseInvoice({
    categoriesRepo: mockCategoriesRepo,
    invoiceParser: mockInvoiceParser,
  });

  it("should successfully parse an invoice with categories", async () => {
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
        name: "Groceries",
        icon: "🛒",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      }),
    ];

    const parsedInvoice = {
      merchant: "Whole Foods Market",
      total: 89.50,
      confidence: 0.95,
      suggestedCategoryId: "cat-2",
      items: [
        { description: "Organic Bananas", amount: 4.99 },
        { description: "Almond Milk", amount: 3.49 },
      ],
    };

    mockCategoriesRepo.listActiveByUser.mockResolvedValue(categories);
    mockInvoiceParser.parseInvoice.mockResolvedValue(parsedInvoice);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      imageBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    });

    expect(result).toEqual(parsedInvoice);
    expect(mockCategoriesRepo.listActiveByUser).toHaveBeenCalledWith("user-123");
    expect(mockInvoiceParser.parseInvoice).toHaveBeenCalledWith(
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      [
        { id: "cat-1", name: "Food Dining", icon: "🍽️" },
        { id: "cat-2", name: "Groceries", icon: "🛒" },
      ],
      "user-123"
    );
  });

  it("should parse invoice without categories if none available", async () => {
    const parsedInvoice = {
      merchant: "Starbucks",
      total: 5.75,
      confidence: 0.88,
      items: [
        { description: "Coffee", amount: 5.75 },
      ],
    };

    mockCategoriesRepo.listActiveByUser.mockResolvedValue([]);
    mockInvoiceParser.parseInvoice.mockResolvedValue(parsedInvoice);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      imageBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    });

    expect(result).toEqual(parsedInvoice);
    expect(mockInvoiceParser.parseInvoice).toHaveBeenCalledWith(
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      [],
      "user-123"
    );
  });

  it("should return null if invoice parsing fails", async () => {
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

    mockCategoriesRepo.listActiveByUser.mockResolvedValue(categories);
    mockInvoiceParser.parseInvoice.mockResolvedValue(null);

    const usecase = createUsecase();
    const result = await usecase({
      userId: "user-123",
      imageBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    });

    expect(result).toBeNull();
  });

  it("should handle invoice parser errors", async () => {
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

    mockCategoriesRepo.listActiveByUser.mockResolvedValue(categories);
    mockInvoiceParser.parseInvoice.mockRejectedValue(new Error("OCR service unavailable"));

    const usecase = createUsecase();

    await expect(usecase({
      userId: "user-123",
      imageBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    })).rejects.toThrow("OCR service unavailable");
  });

  it("should handle categories repository errors", async () => {
    mockCategoriesRepo.listActiveByUser.mockRejectedValue(new Error("Database connection failed"));

    const usecase = createUsecase();

    await expect(usecase({
      userId: "user-123",
      imageBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    })).rejects.toThrow("Database connection failed");

    expect(mockInvoiceParser.parseInvoice).not.toHaveBeenCalled();
  });
});