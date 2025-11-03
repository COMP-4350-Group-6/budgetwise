import type { SupabaseClient } from "@supabase/supabase-js";

export interface SupabasePersistenceConfig {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
}

export interface SupabasePersistenceDeps {
  client: SupabaseClient;
}

/**
 * Database schema types for Supabase
 */
export interface Database {
  public: {
    Tables: {
      llm_calls: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          model: string;
          call_type: 'auto_categorize' | 'auto_invoice';
          request_payload: Record<string, unknown>;
          response_payload: Record<string, unknown> | null;
          prompt_tokens: number | null;
          completion_tokens: number | null;
          total_tokens: number | null;
          estimated_cost_cents: number | null;
          status: 'success' | 'error';
          error_message: string | null;
          duration_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          model: string;
          call_type: 'auto_categorize' | 'auto_invoice';
          request_payload: Record<string, unknown>;
          response_payload?: Record<string, unknown> | null;
          prompt_tokens?: number | null;
          completion_tokens?: number | null;
          total_tokens?: number | null;
          estimated_cost_cents?: number | null;
          status: 'success' | 'error';
          error_message?: string | null;
          duration_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          model?: string;
          call_type?: 'auto_categorize' | 'auto_invoice';
          request_payload?: Record<string, unknown>;
          response_payload?: Record<string, unknown> | null;
          prompt_tokens?: number | null;
          completion_tokens?: number | null;
          total_tokens?: number | null;
          estimated_cost_cents?: number | null;
          status?: 'success' | 'error';
          error_message?: string | null;
          duration_ms?: number | null;
          created_at?: string;
        };
      };
      // Add other tables as needed
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
  };
}

