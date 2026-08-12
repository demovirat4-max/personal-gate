-- Migration: Phase 5 Deterministic Adaptive Study Intelligence Schema
-- Date: 2026-08-11

-- 1. Study Sessions Table
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lectures(id) ON DELETE SET NULL,
  daily_mission_item_id UUID,
  session_type TEXT NOT NULL CHECK (session_type IN ('LEARN', 'REVISION', 'QUIZ', 'MISTAKE_REVIEW', 'PRACTICE')),
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'ABANDONED')),
  source TEXT NOT NULL DEFAULT 'web',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  active_duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (active_duration_seconds >= 0),
  paused_duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (paused_duration_seconds >= 0),
  completed_units INTEGER NOT NULL DEFAULT 0 CHECK (completed_units >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Topic Mastery Table
CREATE TABLE IF NOT EXISTS public.topic_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  mastery_score NUMERIC(5,2) NOT NULL CHECK (mastery_score >= 0 AND mastery_score <= 100),
  confidence_score NUMERIC(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  evidence_strength NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (evidence_strength >= 0 AND evidence_strength <= 100),
  classification TEXT NOT NULL CHECK (classification IN ('NOT_STARTED', 'INSUFFICIENT_DATA', 'WEAK', 'DEVELOPING', 'STRONG', 'MASTERED', 'STALE')),
  algorithm_version TEXT NOT NULL DEFAULT 'v1.0.0',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  evidence_through TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  input_fingerprint TEXT NOT NULL,
  component_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, topic_id)
);

-- 3. Subject Mastery Table
CREATE TABLE IF NOT EXISTS public.subject_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  mastery_score NUMERIC(5,2) NOT NULL CHECK (mastery_score >= 0 AND mastery_score <= 100),
  confidence_score NUMERIC(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  coverage_score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (coverage_score >= 0 AND coverage_score <= 100),
  classification TEXT NOT NULL CHECK (classification IN ('NOT_STARTED', 'INSUFFICIENT_DATA', 'WEAK', 'DEVELOPING', 'STRONG', 'MASTERED', 'STALE')),
  algorithm_version TEXT NOT NULL DEFAULT 'v1.0.0',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  evidence_through TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  input_fingerprint TEXT NOT NULL,
  component_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, subject_id)
);

-- 4. Mastery Snapshots Table
CREATE TABLE IF NOT EXISTS public.mastery_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  scope_type TEXT NOT NULL CHECK (scope_type IN ('TOPIC', 'SUBJECT')),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  mastery_score NUMERIC(5,2) NOT NULL,
  confidence_score NUMERIC(5,2) NOT NULL,
  classification TEXT NOT NULL,
  algorithm_version TEXT NOT NULL DEFAULT 'v1.0.0',
  input_fingerprint TEXT NOT NULL,
  component_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Daily Plans Table
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  plan_date DATE NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'SUPERSEDED', 'CANCELLED')),
  available_minutes INTEGER NOT NULL CHECK (available_minutes > 0),
  planned_minutes INTEGER NOT NULL DEFAULT 0 CHECK (planned_minutes >= 0),
  strategy_version TEXT NOT NULL DEFAULT 'v1.0.0',
  input_fingerprint TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  supersedes_plan_id UUID REFERENCES public.daily_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, plan_date, status)
);

-- 6. Daily Plan Items Table
CREATE TABLE IF NOT EXISTS public.daily_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_plan_id UUID NOT NULL REFERENCES public.daily_plans(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  item_type TEXT NOT NULL CHECK (item_type IN ('LEARN', 'REVISION', 'QUIZ', 'MISTAKE_REVIEW', 'PRACTICE')),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lectures(id) ON DELETE SET NULL,
  mistake_id UUID REFERENCES public.mistakes(id) ON DELETE SET NULL,
  revision_item_id UUID REFERENCES public.revisions(id) ON DELETE SET NULL,
  estimated_minutes INTEGER NOT NULL CHECK (estimated_minutes > 0),
  priority_score NUMERIC(6,2) NOT NULL DEFAULT 0.0,
  sequence INTEGER NOT NULL CHECK (sequence >= 0),
  reason_codes TEXT[] NOT NULL DEFAULT '{}',
  explanation_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'DEFERRED', 'CANCELLED')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Recommendation Logs Table
CREATE TABLE IF NOT EXISTS public.recommendation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  recommendation_type TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  source_type TEXT,
  source_id UUID,
  priority_score NUMERIC(6,2) NOT NULL DEFAULT 0.0,
  reason_codes TEXT[] NOT NULL DEFAULT '{}',
  explanation_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  algorithm_version TEXT NOT NULL DEFAULT 'v1.0.0',
  input_fingerprint TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shown_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_logs ENABLE ROW LEVEL SECURITY;

-- Allow public / default user access policies for single-user command center
CREATE POLICY "Allow public all on study_sessions" ON public.study_sessions FOR ALL USING (true);
CREATE POLICY "Allow public all on topic_mastery" ON public.topic_mastery FOR ALL USING (true);
CREATE POLICY "Allow public all on subject_mastery" ON public.subject_mastery FOR ALL USING (true);
CREATE POLICY "Allow public all on mastery_snapshots" ON public.mastery_snapshots FOR ALL USING (true);
CREATE POLICY "Allow public all on daily_plans" ON public.daily_plans FOR ALL USING (true);
CREATE POLICY "Allow public all on daily_plan_items" ON public.daily_plan_items FOR ALL USING (true);
CREATE POLICY "Allow public all on recommendation_logs" ON public.recommendation_logs FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_owner ON public.study_sessions(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_owner ON public.topic_mastery(owner_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_mastery_owner ON public.subject_mastery(owner_id);
CREATE INDEX IF NOT EXISTS idx_daily_plans_owner_date ON public.daily_plans(owner_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_daily_plan_items_plan ON public.daily_plan_items(daily_plan_id, sequence);
CREATE INDEX IF NOT EXISTS idx_recommendation_logs_owner ON public.recommendation_logs(owner_id, generated_at DESC);
