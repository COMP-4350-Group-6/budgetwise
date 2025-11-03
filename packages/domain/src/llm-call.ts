/**
 * LLM Call Types
 */
export type LLMCallType = 'auto_categorize' | 'auto_invoice';

/**
 * LLM Call Status
 */
export type LLMCallStatus = 'success' | 'error';

/**
 * LLM Call Props
 */
export interface LLMCallProps {
  id: string;
  userId: string;
  provider: string; // e.g., 'openrouter', 'anthropic', 'openai'
  model: string; // e.g., 'mistralai/mistral-small', 'claude-3-sonnet'
  callType: LLMCallType;
  requestPayload: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  estimatedCostCents?: number;
  status: LLMCallStatus;
  errorMessage?: string;
  durationMs?: number;
  createdAt: Date;
}

/**
 * LLM Call Domain Entity
 * Represents a single call to an LLM service with full tracking
 */
export class LLMCall {
  constructor(public readonly props: LLMCallProps) {
    if (!props.userId) throw new Error('LLMCall requires userId');
    if (!props.provider) throw new Error('LLMCall requires provider');
    if (!props.model) throw new Error('LLMCall requires model');
    if (!props.callType) throw new Error('LLMCall requires callType');
  }

  /**
   * Create a successful LLM call record
   */
  static success(params: {
    id: string;
    userId: string;
    provider: string;
    model: string;
    callType: LLMCallType;
    requestPayload: Record<string, unknown>;
    responsePayload: Record<string, unknown>;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    estimatedCostCents?: number;
    durationMs?: number;
  }): LLMCall {
    return new LLMCall({
      ...params,
      status: 'success',
      createdAt: new Date(),
    });
  }

  /**
   * Create a failed LLM call record
   */
  static error(params: {
    id: string;
    userId: string;
    provider: string;
    model: string;
    callType: LLMCallType;
    requestPayload: Record<string, unknown>;
    errorMessage: string;
    durationMs?: number;
  }): LLMCall {
    return new LLMCall({
      ...params,
      status: 'error',
      createdAt: new Date(),
    });
  }

  /**
   * Calculate cost based on token usage and provider pricing
   * This is a simplified calculation - should be enhanced with actual provider pricing
   */
  static estimateCost(
    provider: string,
    model: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    // Simplified pricing in cents per 1M tokens
    // TODO: Move to configuration or pricing service
    const pricing: Record<string, { prompt: number; completion: number }> = {
      'mistralai/mistral-small': { prompt: 0.2, completion: 0.6 },
      'google/gemini-2.0-flash-lite-001': { prompt: 0.075, completion: 0.3 },
      'anthropic/claude-3-sonnet': { prompt: 3, completion: 15 },
    };

    const modelPricing = pricing[model] || { prompt: 0.1, completion: 0.3 };
    
    const promptCost = (promptTokens / 1_000_000) * modelPricing.prompt;
    const completionCost = (completionTokens / 1_000_000) * modelPricing.completion;
    
    return Math.round((promptCost + completionCost) * 100); // Convert to cents
  }
}