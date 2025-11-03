import type { LLMCall } from '@budget/domain';

/**
 * Repository interface for LLM call persistence
 */
export interface LLMCallsRepository {
  /**
   * Save an LLM call record
   */
  save(call: LLMCall): Promise<void>;

  /**
   * Get LLM call by ID
   */
  getById(id: string): Promise<LLMCall | null>;

  /**
   * List all LLM calls for a user
   */
  listByUserId(userId: string, options?: {
    limit?: number;
    offset?: number;
    callType?: 'auto_categorize' | 'auto_invoice';
  }): Promise<LLMCall[]>;

  /**
   * Get usage statistics for a user
   */
  getUserStats(userId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    callType?: 'auto_categorize' | 'auto_invoice';
  }): Promise<{
    totalCalls: number;
    totalTokens: number;
    totalCostCents: number;
    successfulCalls: number;
    failedCalls: number;
  }>;

  /**
   * Get usage statistics across all users (admin only)
   */
  getGlobalStats(options?: {
    startDate?: Date;
    endDate?: Date;
    callType?: 'auto_categorize' | 'auto_invoice';
  }): Promise<{
    totalCalls: number;
    totalTokens: number;
    totalCostCents: number;
    successfulCalls: number;
    failedCalls: number;
    uniqueUsers: number;
  }>;
}