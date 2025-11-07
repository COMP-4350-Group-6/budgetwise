import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenRouterCategorization, OpenRouterInvoiceParser } from './index';
import type { CategoryInfo, LLMTrackerPort } from '@budget/ports';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('OpenRouterCategorization', () => {
  const mockApiKey = 'test-api-key-123';
  const mockCategories: CategoryInfo[] = [
    { id: 'cat-1-uuid', name: 'Groceries', icon: '🛒' },
    { id: 'cat-2-uuid', name: 'Transportation', icon: '🚗' },
    { id: 'cat-3-uuid', name: 'Entertainment', icon: '🎬' },
  ];

  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('categorizeTransaction', () => {
    it('should return null if note is undefined', async () => {
      const service = new OpenRouterCategorization(mockApiKey);
      const result = await service.categorizeTransaction(undefined, 1000, mockCategories);
      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return null if categories array is empty', async () => {
      const service = new OpenRouterCategorization(mockApiKey);
      const result = await service.categorizeTransaction('test note', 1000, []);
      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should successfully categorize a transaction', async () => {
      const service = new OpenRouterCategorization(mockApiKey);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  categoryId: 'cat-1-uuid',
                  reasoning: 'This is a grocery purchase'
                })
              }
            }
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150
          }
        })
      });

      const result = await service.categorizeTransaction('Walmart groceries', 5000, mockCategories);

      expect(result).toEqual({
        categoryId: 'cat-1-uuid',
        reasoning: 'This is a grocery purchase'
      });

      expect(mockFetch).toHaveBeenCalledOnce();
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('https://openrouter.ai/api/v1/chat/completions');
      
      const fetchOptions = callArgs[1];
      expect(fetchOptions.method).toBe('POST');
      expect(fetchOptions.headers['Authorization']).toBe('Bearer test-api-key-123');
      
      const body = JSON.parse(fetchOptions.body);
      expect(body.model).toBe('mistralai/mistral-small');
      expect(body.temperature).toBe(0.5);
    });

    it('should return null if API response is not ok', async () => {
      const service = new OpenRouterCategorization(mockApiKey);
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'API Error'
      });

      const result = await service.categorizeTransaction('test note', 1000, mockCategories);
      expect(result).toBeNull();
    });

    it('should return null if LLM returns NONE', async () => {
      const service = new OpenRouterCategorization(mockApiKey);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  categoryId: 'NONE',
                  reasoning: 'Could not determine category'
                })
              }
            }
          ]
        })
      });

      const result = await service.categorizeTransaction('unknown transaction', 1000, mockCategories);
      expect(result).toBeNull();
    });

    it('should return null if LLM returns invalid category ID', async () => {
      const service = new OpenRouterCategorization(mockApiKey);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  categoryId: 'invalid-uuid',
                  reasoning: 'Test reasoning'
                })
              }
            }
          ]
        })
      });

      const result = await service.categorizeTransaction('test note', 1000, mockCategories);
      expect(result).toBeNull();
    });

    it('should handle invalid JSON response', async () => {
      const service = new OpenRouterCategorization(mockApiKey);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'This is not valid JSON'
              }
            }
          ]
        })
      });

      const result = await service.categorizeTransaction('test note', 1000, mockCategories);
      expect(result).toBeNull();
    });

    it('should handle empty content from API', async () => {
      const service = new OpenRouterCategorization(mockApiKey);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: ''
              }
            }
          ]
        })
      });

      const result = await service.categorizeTransaction('test note', 1000, mockCategories);
      expect(result).toBeNull();
    });

    it('should handle fetch errors', async () => {
      const service = new OpenRouterCategorization(mockApiKey);
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.categorizeTransaction('test note', 1000, mockCategories);
      expect(result).toBeNull();
    });

    it('should use tracker when provided', async () => {
      const mockTracker: LLMTrackerPort = {
        trackCall: vi.fn(async ({ operation }) => {
          const { result, usage } = await operation();
          return result;
        })
      };

      const service = new OpenRouterCategorization(mockApiKey, { 
        tracker: mockTracker, 
        userId: 'user-123' 
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  categoryId: 'cat-1-uuid',
                  reasoning: 'Grocery purchase'
                })
              }
            }
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150
          }
        })
      });

      const result = await service.categorizeTransaction('Walmart', 5000, mockCategories);

      expect(result).toEqual({
        categoryId: 'cat-1-uuid',
        reasoning: 'Grocery purchase'
      });

      expect(mockTracker.trackCall).toHaveBeenCalledOnce();
      expect(mockTracker.trackCall).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          provider: 'openrouter',
          model: 'mistralai/mistral-small',
          callType: 'auto_categorize',
          requestPayload: {
            note: 'Walmart',
            amountCents: 5000,
            categoriesCount: 3
          }
        })
      );
    });

    it('should use userId parameter over constructor userId', async () => {
      const mockTracker: LLMTrackerPort = {
        trackCall: vi.fn(async ({ operation }) => {
          const { result } = await operation();
          return result;
        })
      };

      const service = new OpenRouterCategorization(mockApiKey, { 
        tracker: mockTracker, 
        userId: 'user-from-constructor' 
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  categoryId: 'cat-1-uuid',
                  reasoning: 'Test'
                })
              }
            }
          ]
        })
      });

      await service.categorizeTransaction('test', 1000, mockCategories, 'user-from-param');

      expect(mockTracker.trackCall).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-from-param'
        })
      );
    });

    it('should convert amount from cents to dollars correctly', async () => {
      const service = new OpenRouterCategorization(mockApiKey);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  categoryId: 'cat-1-uuid',
                  reasoning: 'Test'
                })
              }
            }
          ]
        })
      });

      await service.categorizeTransaction('test', 12345, mockCategories);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const userMessage = body.messages.find((m: any) => m.role === 'user');
      expect(userMessage.content).toContain('$123.45');
    });
  });
});

describe('OpenRouterInvoiceParser', () => {
  const mockApiKey = 'test-api-key-456';
  const mockCategories = [
    { id: 'cat-1-uuid', name: 'Groceries', icon: '🛒' },
    { id: 'cat-2-uuid', name: 'Dining', icon: '🍽️' }
  ];

  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('parseInvoice', () => {
    const mockBase64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    it('should successfully parse an invoice', async () => {
      const parser = new OpenRouterInvoiceParser(mockApiKey);
      
      const mockInvoiceData = {
        merchant: 'Test Store',
        date: '2024-11-07',
        total: 5000,
        tax: 500,
        subtotal: 4500,
        items: [
          { description: 'Item 1', quantity: 2, price: 2000, categoryId: 'cat-1-uuid' }
        ],
        suggestedCategory: 'cat-1-uuid',
        description: 'Groceries from Test Store including Item 1',
        confidence: 0.95
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockInvoiceData)
              }
            }
          ],
          usage: {
            prompt_tokens: 500,
            completion_tokens: 200,
            total_tokens: 700
          }
        })
      });

      const result = await parser.parseInvoice(mockBase64Image, mockCategories);

      expect(result).toEqual(mockInvoiceData);
      expect(mockFetch).toHaveBeenCalledOnce();

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('https://openrouter.ai/api/v1/chat/completions');
      
      const fetchOptions = callArgs[1];
      expect(fetchOptions.headers['Authorization']).toBe('Bearer test-api-key-456');
      
      const body = JSON.parse(fetchOptions.body);
      expect(body.model).toBe('google/gemini-2.0-flash-lite-001');
      expect(body.temperature).toBe(0.1);
    });

    it('should handle data URI prefix in image', async () => {
      const parser = new OpenRouterInvoiceParser(mockApiKey);
      
      const imageWithPrefix = `data:image/jpeg;base64,${mockBase64Image}`;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  merchant: 'Store',
                  date: '2024-11-07',
                  total: 1000,
                  description: 'Test',
                  confidence: 0.9
                })
              }
            }
          ]
        })
      });

      await parser.parseInvoice(imageWithPrefix, mockCategories);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const imageUrl = body.messages[0].content[1].image_url.url;
      expect(imageUrl).toBe(`data:image/jpeg;base64,${mockBase64Image}`);
    });

    it('should handle markdown code blocks in response', async () => {
      const parser = new OpenRouterInvoiceParser(mockApiKey);
      
      const mockInvoiceData = {
        merchant: 'Test Store',
        date: '2024-11-07',
        total: 5000,
        description: 'Test purchase',
        confidence: 0.9
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: '```json\n' + JSON.stringify(mockInvoiceData) + '\n```'
              }
            }
          ]
        })
      });

      const result = await parser.parseInvoice(mockBase64Image, mockCategories);
      expect(result).toEqual(mockInvoiceData);
    });

    it('should return null if required fields are missing', async () => {
      const parser = new OpenRouterInvoiceParser(mockApiKey);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  merchant: 'Test Store',
                  // Missing date and total
                  description: 'Test',
                  confidence: 0.9
                })
              }
            }
          ]
        })
      });

      const result = await parser.parseInvoice(mockBase64Image, mockCategories);
      expect(result).toBeNull();
    });

    it('should return null if API response is not ok', async () => {
      const parser = new OpenRouterInvoiceParser(mockApiKey);
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'API Error'
      });

      const result = await parser.parseInvoice(mockBase64Image, mockCategories);
      expect(result).toBeNull();
    });

    it('should handle invalid JSON in response', async () => {
      const parser = new OpenRouterInvoiceParser(mockApiKey);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'This is not valid JSON'
              }
            }
          ]
        })
      });

      const result = await parser.parseInvoice(mockBase64Image, mockCategories);
      expect(result).toBeNull();
    });

    it('should handle empty content from API', async () => {
      const parser = new OpenRouterInvoiceParser(mockApiKey);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: ''
              }
            }
          ]
        })
      });

      const result = await parser.parseInvoice(mockBase64Image, mockCategories);
      expect(result).toBeNull();
    });

    it('should handle fetch errors', async () => {
      const parser = new OpenRouterInvoiceParser(mockApiKey);
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await parser.parseInvoice(mockBase64Image, mockCategories);
      expect(result).toBeNull();
    });

    it('should use tracker when provided', async () => {
      const mockTracker: LLMTrackerPort = {
        trackCall: vi.fn(async ({ operation }) => {
          const { result } = await operation();
          return result;
        })
      };

      const parser = new OpenRouterInvoiceParser(mockApiKey, { 
        tracker: mockTracker, 
        userId: 'user-456' 
      });

      const mockInvoiceData = {
        merchant: 'Test Store',
        date: '2024-11-07',
        total: 5000,
        description: 'Test',
        confidence: 0.9
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockInvoiceData)
              }
            }
          ],
          usage: {
            prompt_tokens: 500,
            completion_tokens: 200,
            total_tokens: 700
          }
        })
      });

      const result = await parser.parseInvoice(mockBase64Image, mockCategories);

      expect(result).toEqual(mockInvoiceData);
      expect(mockTracker.trackCall).toHaveBeenCalledOnce();
      expect(mockTracker.trackCall).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-456',
          provider: 'openrouter',
          model: 'google/gemini-2.0-flash-lite-001',
          callType: 'auto_invoice',
          requestPayload: {
            imageSize: mockBase64Image.length,
            categoriesCount: 2
          }
        })
      );
    });

    it('should use userId parameter over constructor userId', async () => {
      const mockTracker: LLMTrackerPort = {
        trackCall: vi.fn(async ({ operation }) => {
          const { result } = await operation();
          return result;
        })
      };

      const parser = new OpenRouterInvoiceParser(mockApiKey, { 
        tracker: mockTracker, 
        userId: 'user-from-constructor' 
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  merchant: 'Store',
                  date: '2024-11-07',
                  total: 1000,
                  description: 'Test',
                  confidence: 0.9
                })
              }
            }
          ]
        })
      });

      await parser.parseInvoice(mockBase64Image, mockCategories, 'user-from-param');

      expect(mockTracker.trackCall).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-from-param'
        })
      );
    });

    it('should include categories in the prompt', async () => {
      const parser = new OpenRouterInvoiceParser(mockApiKey);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  merchant: 'Store',
                  date: '2024-11-07',
                  total: 1000,
                  description: 'Test',
                  confidence: 0.9
                })
              }
            }
          ]
        })
      });

      await parser.parseInvoice(mockBase64Image, mockCategories);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const textContent = body.messages[0].content[0].text;
      
      expect(textContent).toContain('Groceries (ID: cat-1-uuid)');
      expect(textContent).toContain('Dining (ID: cat-2-uuid)');
    });
  });
});
