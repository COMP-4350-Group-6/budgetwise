import type { SupabaseClient } from '@supabase/supabase-js';
import type { LLMCallsRepository } from '@budget/ports';
import { LLMCall } from '@budget/domain';
import type { Database } from './types';

type LLMCallRow = Database['public']['Tables']['llm_calls']['Row'];
type LLMCallInsert = Database['public']['Tables']['llm_calls']['Insert'];

/**
 * Supabase implementation of LLM Calls Repository
 */
export class SupabaseLLMCallsRepository implements LLMCallsRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async save(call: LLMCall): Promise<void> {
    const row: LLMCallInsert = {
      id: call.props.id,
      user_id: call.props.userId,
      provider: call.props.provider,
      model: call.props.model,
      call_type: call.props.callType,
      request_payload: call.props.requestPayload as Record<string, unknown>,
      response_payload: call.props.responsePayload as Record<string, unknown> | undefined,
      prompt_tokens: call.props.promptTokens,
      completion_tokens: call.props.completionTokens,
      total_tokens: call.props.totalTokens,
      estimated_cost_cents: call.props.estimatedCostCents,
      status: call.props.status,
      error_message: call.props.errorMessage,
      duration_ms: call.props.durationMs,
      created_at: call.props.createdAt.toISOString(),
    };

    // Supabase client types in this workspace are strict and may make `.from()` inference narrow to `never`.
    // Cast the query builder to `any` for the insert call to avoid complex type gymnastics here.
    const { error } = await (this.supabase.from('llm_calls') as any).insert(row);

    if (error) {
      throw new Error(`Failed to save LLM call: ${error.message}`);
    }
  }

  async getById(id: string): Promise<LLMCall | null> {
    const { data, error } = await this.supabase
      .from('llm_calls')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get LLM call: ${error.message}`);
    }

    return this.rowToDomain(data);
  }

  async listByUserId(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      callType?: 'auto_categorize' | 'auto_invoice';
    } = {}
  ): Promise<LLMCall[]> {
    let query = this.supabase
      .from('llm_calls')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.callType) {
      query = query.eq('call_type', options.callType);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

  const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list LLM calls: ${error.message}`);
    }

  const rows = data as LLMCallRow[];
  return rows.map(row => this.rowToDomain(row));
  }

  async getUserStats(
    userId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      callType?: 'auto_categorize' | 'auto_invoice';
    } = {}
  ): Promise<{
    totalCalls: number;
    totalTokens: number;
    totalCostCents: number;
    successfulCalls: number;
    failedCalls: number;
  }> {
    let query = this.supabase
      .from('llm_calls')
      .select('status, total_tokens, estimated_cost_cents')
      .eq('user_id', userId);

    if (options.callType) {
      query = query.eq('call_type', options.callType);
    }

    if (options.startDate) {
      query = query.gte('created_at', options.startDate.toISOString());
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate.toISOString());
    }

  const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }

    const rows = data as LLMCallRow[];
    const stats = rows.reduce(
      (acc, row) => {
        acc.totalCalls++;
        acc.totalTokens += row.total_tokens || 0;
        acc.totalCostCents += row.estimated_cost_cents || 0;
        if (row.status === 'success') {
          acc.successfulCalls++;
        } else {
          acc.failedCalls++;
        }
        return acc;
      },
      {
        totalCalls: 0,
        totalTokens: 0,
        totalCostCents: 0,
        successfulCalls: 0,
        failedCalls: 0,
      }
    );

    return stats;
  }

  async getGlobalStats(
    options: {
      startDate?: Date;
      endDate?: Date;
      callType?: 'auto_categorize' | 'auto_invoice';
    } = {}
  ): Promise<{
    totalCalls: number;
    totalTokens: number;
    totalCostCents: number;
    successfulCalls: number;
    failedCalls: number;
    uniqueUsers: number;
  }> {
    let query = this.supabase
      .from('llm_calls')
      .select('user_id, status, total_tokens, estimated_cost_cents');

    if (options.callType) {
      query = query.eq('call_type', options.callType);
    }

    if (options.startDate) {
      query = query.gte('created_at', options.startDate.toISOString());
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate.toISOString());
    }

  const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get global stats: ${error.message}`);
    }

    const uniqueUsers = new Set<string>();
    const rows2 = data as LLMCallRow[];
    const stats = rows2.reduce(
      (acc, row) => {
        acc.totalCalls++;
        acc.totalTokens += row.total_tokens || 0;
        acc.totalCostCents += row.estimated_cost_cents || 0;
        uniqueUsers.add(row.user_id);
        if (row.status === 'success') {
          acc.successfulCalls++;
        } else {
          acc.failedCalls++;
        }
        return acc;
      },
      {
        totalCalls: 0,
        totalTokens: 0,
        totalCostCents: 0,
        successfulCalls: 0,
        failedCalls: 0,
        uniqueUsers: 0,
      }
    );

    stats.uniqueUsers = uniqueUsers.size;
    return stats;
  }

  private rowToDomain(row: LLMCallRow): LLMCall {
    return new LLMCall({
      id: row.id,
      userId: row.user_id,
      provider: row.provider,
      model: row.model,
      callType: row.call_type as 'auto_categorize' | 'auto_invoice',
      requestPayload: row.request_payload as Record<string, unknown>,
      responsePayload: row.response_payload as Record<string, unknown> | undefined,
      promptTokens: row.prompt_tokens || undefined,
      completionTokens: row.completion_tokens || undefined,
      totalTokens: row.total_tokens || undefined,
      estimatedCostCents: row.estimated_cost_cents || undefined,
      status: row.status as 'success' | 'error',
      errorMessage: row.error_message || undefined,
      durationMs: row.duration_ms || undefined,
      createdAt: new Date(row.created_at),
    });
  }
}