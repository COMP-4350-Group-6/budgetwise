import type {
  CategorizationPort,
  CategoryInfo,
  CategorizationResult,
  InvoiceParserPort,
  ParsedInvoice
} from '@budget/ports';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenRouter adapter for invoice parsing using Claude Sonnet 4.5 with vision
 */
export class OpenRouterInvoiceParser implements InvoiceParserPort {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async parseInvoice(
    imageBase64: string,
    userCategories: Array<{ id: string; name: string; icon?: string }>
  ): Promise<ParsedInvoice | null> {
    // Remove data URI prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    // Build category list for suggestion
    const categoryList = userCategories
      .map(cat => `- ${cat.name} (ID: ${cat.id})`)
      .join('\n');

    const systemPrompt = `You are an invoice/receipt parser. Analyze the image and extract transaction details in JSON format.

CRITICAL RULES:
1. Return ONLY a JSON object, no other text
2. All monetary amounts must be in CENTS (multiply by 100)
3. Date must be in ISO format (YYYY-MM-DD)
4. If you can't find a field, omit it or use null
5. Suggest a category from the available list if possible
6. Include a confidence score (0-1) for the overall parse quality

Required JSON format:
{
  "merchant": "string",
  "date": "YYYY-MM-DD",
  "total": number (in cents),
  "tax": number (in cents, optional),
  "subtotal": number (in cents, optional),
  "invoiceNumber": "string (optional)",
  "items": [
    {
      "description": "string",
      "quantity": number (optional),
      "price": number (in cents, optional)
    }
  ],
  "paymentMethod": "string (optional)",
  "suggestedCategory": "category name or null",
  "confidence": number (0-1)
}

Available categories for suggestion:
${categoryList}`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://budgetwise.app',
          'X-Title': 'BudgetWise'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-lite-001', // Fast vision-capable model
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: systemPrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Data}`
                  }
                }
              ]
            }
          ],
          temperature: 0.1, // Very low for consistent parsing
          max_tokens: 800 // Enough for detailed invoice data
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenRouter invoice parsing error:', error);
        return null;
      }

      const data = await response.json() as OpenRouterResponse;
      const content = data.choices[0]?.message?.content?.trim();

      if (!content) {
        return null;
      }

      // Parse the JSON response (handle markdown code blocks)
      try {
        // Remove markdown code blocks if present
        let jsonContent = content;
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          jsonContent = codeBlockMatch[1];
        }
        
        const parsed = JSON.parse(jsonContent) as ParsedInvoice;
        
        // Validate required fields
        if (!parsed.merchant || !parsed.date || !parsed.total) {
          console.error('Missing required invoice fields');
          return null;
        }

        return parsed;
      } catch (parseError) {
        console.error('Failed to parse invoice JSON:', content);
        return null;
      }
    } catch (error) {
      console.error('Error calling OpenRouter for invoice parsing:', error);
      return null;
    }
  }
}

/**
 * OpenRouter adapter for auto-categorization using LLMs
 */
export class OpenRouterCategorization implements CategorizationPort {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Auto-categorize a transaction based on its description and amount
   */
  async categorizeTransaction(
    note: string | undefined,
    amountCents: number,
    categories: CategoryInfo[]
  ): Promise<CategorizationResult | null> {
    if (!note || categories.length === 0) {
      return null;
    }

    const amount = (Math.abs(amountCents) / 100).toFixed(2);
    
    // Build the prompt with available categories - ID FIRST to emphasize UUID usage
    const categoryList = categories
      .map(cat => `ID: ${cat.id} | Name: ${cat.name}${cat.icon ? ` ${cat.icon}` : ''}`)
      .join('\n');

    const systemPrompt = `You are a financial transaction categorization assistant. Your job is to analyze transaction descriptions and amounts, then assign them to the most appropriate category from the user's available categories.

CRITICAL RULES - READ CAREFULLY:
1. You MUST respond with ONLY a JSON object in this exact format:
   {"categoryId": "UUID_HERE", "reasoning": "Brief explanation here"}

2. The categoryId MUST be the EXACT UUID from the "ID:" field in the category list below
   - DO NOT use the category name (e.g., "Groceries")
   - DO NOT use any variation of the name
   - You MUST use the full UUID string exactly as shown (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
   
3. Example of CORRECT response:
   {"categoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "reasoning": "Coffee purchase fits the Groceries category"}
   
4. Example of INCORRECT response (will be rejected):
   {"categoryId": "Groceries", "reasoning": "..."}  ❌ WRONG - used name instead of UUID

5. If none of the categories seem appropriate, use: {"categoryId": "NONE", "reasoning": "Explanation why"}
6. Be confident - only use NONE if truly uncertain
7. Consider both the description and amount when categorizing
8. Keep reasoning brief (1-2 sentences)
9. DO NOT include any text before or after the JSON object

Available categories (format: ID | Name):
${categoryList}`;

    const userPrompt = `Categorize this transaction:
Description: "${note}"
Amount: $${amount}

Respond with ONLY the JSON object as specified.`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://budgetwise.app',
          'X-Title': 'BudgetWise'
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-small', // Fast and cost-effective
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ] as OpenRouterMessage[],
          temperature: 0.3, // Lower temperature for more consistent categorization
          max_tokens: 200 // Enough for category ID and reasoning
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenRouter API error:', error);
        return null;
      }

      const data = await response.json() as OpenRouterResponse;
      const content = data.choices[0]?.message?.content?.trim();

      if (!content) {
        return null;
      }

      // Parse the JSON response
      try {
        const result = JSON.parse(content) as { categoryId: string; reasoning: string };
        
        if (!result.categoryId || result.categoryId === 'NONE' || !result.reasoning) {
          console.log('LLM could not categorize:', result.reasoning || 'No reasoning provided');
          return null;
        }

        // Validate that the returned ID actually exists in our categories
        const categoryExists = categories.some(cat => cat.id === result.categoryId);
        if (!categoryExists) {
          console.warn('LLM returned invalid category ID:', result.categoryId);
          return null;
        }

        return {
          categoryId: result.categoryId,
          reasoning: result.reasoning
        };

      } catch (parseError) {
        console.error('Failed to parse LLM response as JSON:', content);
        return null;
      }

    } catch (error) {
      console.error('Error calling OpenRouter:', error);
      return null;
    }
  }
}