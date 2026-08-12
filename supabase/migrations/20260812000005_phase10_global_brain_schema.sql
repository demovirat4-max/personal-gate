-- Migration: Phase 10 Global AI Brain, Command Center & Final Execution Engine Schema
-- Date: 2026-08-12

-- 1. Brain Context Snapshots
CREATE TABLE IF NOT EXISTS public.brain_context_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  snapshot_version TEXT NOT NULL DEFAULT 'v1.0.0',
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('COMMAND', 'DAILY_REVIEW', 'WEEKLY_REVIEW', 'MONTHLY_REVIEW', 'FOCUS_SESSION', 'FINAL_SPRINT', 'MANUAL_REFRESH')),
  scope TEXT NOT NULL DEFAULT 'GLOBAL' CHECK (scope IN ('GLOBAL', 'TODAY', 'SUBJECT', 'TOPIC', 'REVISION', 'EXAM', 'STRATEGY', 'CONTENT_QUALITY')),
  as_of TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  input_fingerprint TEXT NOT NULL,
  context_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_references JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Brain Decisions
CREATE TABLE IF NOT EXISTS public.brain_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  snapshot_id UUID REFERENCES public.brain_context_snapshots(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL CHECK (decision_type IN ('STUDY_NEXT', 'REVISE_TOPIC', 'REVIEW_MISTAKES', 'TAKE_PRACTICE_TEST', 'TAKE_MOCK_TEST', 'CONTINUE_LESSON', 'ADJUST_FUTURE_PLAN', 'START_FOCUS_SESSION', 'REVIEW_CONTENT_GAP', 'FINAL_SPRINT_PLAN', 'NO_ACTION')),
  status TEXT NOT NULL DEFAULT 'PROPOSED' CHECK (status IN ('DRAFT', 'PROPOSED', 'CONFIRMED', 'REJECTED', 'EXPIRED', 'EXECUTING', 'EXECUTED', 'FAILED', 'CANCELLED')),
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  reason_codes TEXT[] NOT NULL DEFAULT '{}',
  proposed_action JSONB NOT NULL DEFAULT '{}'::jsonb,
  target_entity_type TEXT,
  target_entity_id UUID,
  requires_confirmation BOOLEAN NOT NULL DEFAULT true,
  confirmed_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  decision_version TEXT NOT NULL DEFAULT 'v1.0.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Brain Reviews (Daily, Weekly, Monthly)
CREATE TABLE IF NOT EXISTS public.brain_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  review_type TEXT NOT NULL CHECK (review_type IN ('DAILY', 'WEEKLY', 'MONTHLY')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  snapshot_id UUID REFERENCES public.brain_context_snapshots(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'READY' CHECK (status IN ('GENERATING', 'READY', 'PARTIAL', 'FAILED', 'ARCHIVED')),
  summary TEXT NOT NULL,
  observations JSONB NOT NULL DEFAULT '[]'::jsonb,
  wins JSONB NOT NULL DEFAULT '[]'::jsonb,
  risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  calculation_version TEXT NOT NULL DEFAULT 'v1.0.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Focus Session Plans
CREATE TABLE IF NOT EXISTS public.focus_session_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  snapshot_id UUID REFERENCES public.brain_context_snapshots(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL DEFAULT 'LEARN' CHECK (session_type IN ('LEARN', 'REVISE', 'PRACTICE', 'MISTAKE_REVIEW', 'MOCK_ANALYSIS', 'MIXED')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
  planned_duration_minutes INTEGER NOT NULL DEFAULT 45 CHECK (planned_duration_minutes >= 10 AND planned_duration_minutes <= 180),
  objective TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  actual_duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Final Sprint Plans
CREATE TABLE IF NOT EXISTS public.final_sprint_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  snapshot_id UUID REFERENCES public.brain_context_snapshots(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'PROPOSED' CHECK (status IN ('DRAFT', 'PROPOSED', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'SUPERSEDED')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_remaining INTEGER NOT NULL CHECK (days_remaining >= 1),
  strategy_version TEXT NOT NULL DEFAULT 'v1.0.0',
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.brain_context_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_session_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_sprint_plans ENABLE ROW LEVEL SECURITY;

-- Access Policies for single user setup
CREATE POLICY "Allow public all on brain_context_snapshots" ON public.brain_context_snapshots FOR ALL USING (true);
CREATE POLICY "Allow public all on brain_decisions" ON public.brain_decisions FOR ALL USING (true);
CREATE POLICY "Allow public all on brain_reviews" ON public.brain_reviews FOR ALL USING (true);
CREATE POLICY "Allow public all on focus_session_plans" ON public.focus_session_plans FOR ALL USING (true);
CREATE POLICY "Allow public all on final_sprint_plans" ON public.final_sprint_plans FOR ALL USING (true);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_brain_snapshots_trigger ON public.brain_context_snapshots(trigger_type, scope);
CREATE INDEX IF NOT EXISTS idx_brain_decisions_status ON public.brain_decisions(status, decision_type);
CREATE INDEX IF NOT EXISTS idx_brain_reviews_type ON public.brain_reviews(review_type, period_start);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_status ON public.focus_session_plans(status);
