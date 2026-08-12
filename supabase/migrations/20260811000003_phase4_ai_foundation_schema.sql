-- Phase 4 Schema: AI Request Tracking, Artifacts, Usage Ledger, Budget Period

-- 1. AI Requests Log Table
CREATE TABLE IF NOT EXISTS ai_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default_user',
  capability TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'nvidia-zzlm',
  model TEXT NOT NULL DEFAULT 'zzlm-5.2',
  status TEXT NOT NULL CHECK (status IN ('CREATED', 'VALIDATING', 'BUDGET_RESERVED', 'RUNNING', 'STREAMING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REJECTED')) DEFAULT 'CREATED',
  prompt_version TEXT NOT NULL DEFAULT 'v1.0.0',
  input_context_fingerprint TEXT,
  idempotency_key TEXT UNIQUE,
  input_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  total_tokens INT NOT NULL DEFAULT 0,
  estimated_cost_inr NUMERIC(10,4) NOT NULL DEFAULT 0.0000,
  finish_reason TEXT,
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_requests_user_status ON ai_requests(user_id, status);

-- 2. AI Saved Learning Artifacts Table
CREATE TABLE IF NOT EXISTS ai_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default_user',
  capability TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID,
  request_id UUID REFERENCES ai_requests(id) ON DELETE SET NULL,
  artifact_version INT NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  content_json JSONB NOT NULL,
  saved BOOLEAN NOT NULL DEFAULT FALSE,
  is_stale BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_artifacts_user_capability ON ai_artifacts(user_id, capability);

-- 3. AI Usage & Budget Ledger Table
CREATE TABLE IF NOT EXISTS ai_usage_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default_user',
  request_id UUID REFERENCES ai_requests(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'nvidia-zzlm',
  model TEXT NOT NULL DEFAULT 'zzlm-5.2',
  capability TEXT NOT NULL,
  input_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  estimated_cost_inr NUMERIC(10,4) NOT NULL DEFAULT 0.0000,
  usage_date DATE NOT NULL, -- YYYY-MM-DD Asia/Kolkata
  usage_month TEXT NOT NULL, -- YYYY-MM Asia/Kolkata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_month ON ai_usage_ledger(user_id, usage_month);

-- RLS Policies
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access ai_requests" ON ai_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access ai_artifacts" ON ai_artifacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access ai_usage_ledger" ON ai_usage_ledger FOR ALL USING (true) WITH CHECK (true);
