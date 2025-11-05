import type { LLMCallsRepository } from '../repositories/llm-calls-repo';
import type { IdPort } from '../system/id';
import { calculateLLMCost } from '@budget/domain';

/**
 * LLM Tracker Service
 * Handles tracking of LLM calls for monitoring and cost analysis
 */
export interface LLMTrackerPort {
  /**
   * Track an LLM call with automatic timing and error handling
   */
  trackCall<T>(params: {
    userId: string;
    provider: string;
    model: string;
    callType: 'auto_categorize' | 'auto_invoice';
    requestPayload: Record<string, unknown>;
    operation: () => Promise<{ result: T; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }>;
  }): Promise<T>;
}

/**
 * Implementation of LLM Tracker
 */
export class LLMTracker implements LLMTrackerPort {
  constructor(
    private repository: LLMCallsRepository,
    private idGenerator: IdPort
  ) {}

  async trackCall<T>(params: {
    userId: string;
    provider: string;
    model: string;
    callType: 'auto_categorize' | 'auto_invoice';
    requestPayload: Record<string, unknown>;
    operation: () => Promise<{ result: T; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }>;
  }): Promise<T> {
    const startTime = Date.now();
    const callId = this.idGenerator.ulid();  // Fixed: use ulid() method

    try {
      const { result, usage } = await params.operation();
      const durationMs = Date.now() - startTime;

      // Calculate estimated cost if we have token usage
      const estimatedCostCents = usage?.prompt_tokens && usage?.completion_tokens
        ? this.estimateCost(params.provider, params.model, usage.prompt_tokens, usage.completion_tokens)
        : undefined;

      // Save successful call
      await this.repository.save({
        props: {
          id: callId,
          userId: params.userId,
          provider: params.provider,
          model: params.model,
          callType: params.callType,
          requestPayload: params.requestPayload,
          responsePayload: { result } as Record<string, unknown>,
          promptTokens: usage?.prompt_tokens,
          completionTokens: usage?.completion_tokens,
          totalTokens: usage?.total_tokens,
          estimatedCostCents,
          status: 'success',
          durationMs,
          createdAt: new Date(),
        },
      } as any);

      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Save failed call
      await this.repository.save({
        props: {
          id: callId,
          userId: params.userId,
          provider: params.provider,
          model: params.model,
          callType: params.callType,
          requestPayload: params.requestPayload,
          status: 'error',
          errorMessage,
          durationMs,
          createdAt: new Date(),
        },
      } as any);

      throw error;
    }
  }

  private estimateCost(
    provider: string,
    model: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    // Use centralized model registry for accurate pricing
    return calculateLLMCost(model, promptTokens, completionTokens);
  }
}