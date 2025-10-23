import type { CategorizationPort, CategoryInfo, CategorizationResult } from '@budget/ports';

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
    
    // Build the prompt with available categories
    const categoryList = categories
      .map(cat => `- ${cat.name} (ID: ${cat.id})${cat.icon ? ` ${cat.icon}` : ''}`)
      .join('\n');

    const systemPrompt = `You are a financial transaction categorization assistant. Your job is to analyze transaction descriptions and amounts, then assign them to the most appropriate category from the user's available categories.

CRITICAL RULES:
1. You MUST respond with ONLY a JSON object in this exact format:
   {"categoryId": "CATEGORY_ID_HERE", "reasoning": "Brief explanation here"}
2. The categoryId MUST be one of the IDs from the available categories list
3. If none of the categories seem appropriate, use: {"categoryId": "NONE", "reasoning": "Explanation why"}
4. Be confident - only use NONE if truly uncertain
5. Consider both the description and amount when categorizing
6. Keep reasoning brief (1-2 sentences)
7. DO NOT include any text before or after the JSON object

Available categories:
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