-- Create llm_calls table for tracking all LLM API calls
CREATE TABLE IF NOT EXISTS llm_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- e.g., 'openrouter', 'anthropic', 'openai'
  model TEXT NOT NULL, -- e.g., 'mistralai/mistral-small', 'claude-3-sonnet'
  call_type TEXT NOT NULL CHECK (call_type IN ('auto_categorize', 'auto_invoice')),
  request_payload JSONB NOT NULL, -- The full request sent to the LLM
  response_payload JSONB, -- The full response received (null if error)
  prompt_tokens INTEGER CHECK (prompt_tokens >= 0),
  completion_tokens INTEGER CHECK (completion_tokens >= 0),
  total_tokens INTEGER CHECK (total_tokens >= 0),
  estimated_cost_cents INTEGER CHECK (estimated_cost_cents >= 0), -- Cost in cents
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT, -- Error details if status = 'error'
  duration_ms INTEGER CHECK (duration_ms >= 0), -- Call duration in milliseconds
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_llm_calls_user_id ON llm_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_calls_call_type ON llm_calls(call_type);
CREATE INDEX IF NOT EXISTS idx_llm_calls_created_at ON llm_calls(created_at);
CREATE INDEX IF NOT EXISTS idx_llm_calls_user_created ON llm_calls(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_llm_calls_status ON llm_calls(status);

-- RLS Policies
ALTER TABLE llm_calls ENABLE ROW LEVEL SECURITY;

-- Users can only view their own LLM calls
CREATE POLICY "Users can view their own LLM calls"
  ON llm_calls FOR SELECT
  USING (auth.uid() = user_id);

-- Only the system can insert LLM call records (via service role)
-- Users cannot directly insert/update/delete LLM calls
CREATE POLICY "Service role can insert LLM calls"
  ON llm_calls FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON TABLE llm_calls IS 'Tracks all LLM API calls for usage monitoring, cost tracking, and debugging';
COMMENT ON COLUMN llm_calls.provider IS 'LLM provider name (openrouter, anthropic, openai, etc.)';
COMMENT ON COLUMN llm_calls.model IS 'Specific model used for the call';
COMMENT ON COLUMN llm_calls.call_type IS 'Type of LLM operation (auto_categorize, auto_invoice)';
COMMENT ON COLUMN llm_calls.request_payload IS 'Full request payload sent to LLM';
COMMENT ON COLUMN llm_calls.response_payload IS 'Full response received from LLM (null on error)';
COMMENT ON COLUMN llm_calls.estimated_cost_cents IS 'Estimated cost in cents based on token usage';
COMMENT ON COLUMN llm_calls.duration_ms IS 'Total API call duration in milliseconds';