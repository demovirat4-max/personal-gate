-- Migration: Phase 8 Final-Rank Strategy and Schedule Optimizer Schema
-- Date: 2026-08-12

-- 1. Preparation Profiles
CREATE TABLE IF NOT EXISTS public.preparation_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  target_exam TEXT NOT NULL DEFAULT 'GATE CS/IT',
  target_year INTEGER NOT NULL DEFAULT 2028 CHECK (target_year >= 2025 AND target_year <= 2035),
  exam_date DATE DEFAULT '2028-02-05',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  weekly_study_minutes INTEGER NOT NULL DEFAULT 1200 CHECK (weekly_study_minutes > 0),
  minimum_daily_minutes INTEGER DEFAULT 60,
  maximum_daily_minutes INTEGER DEFAULT 360,
  preferred_study_days TEXT[] DEFAULT '{"MON","TUE","WED","THU","FRI","SAT","SUN"}',
  strategy_mode TEXT NOT NULL DEFAULT 'BALANCED' CHECK (strategy_mode IN ('BALANCED', 'FOUNDATION_FIRST', 'REVISION_HEAVY', 'PYQ_HEAVY', 'MOCK_FOCUSED', 'RECOVERY', 'CUSTOM')),
  target_statement TEXT,
  profile_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (profile_status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, profile_status)
);

-- 2. Long Term Goals
CREATE TABLE IF NOT EXISTS public.long_term_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  preparation_profile_id UUID REFERENCES public.preparation_profiles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('CURRICULUM_COVERAGE', 'REVISION_CYCLE', 'PYQ_PRACTICE', 'MOCK_FREQUENCY', 'STUDY_TIME', 'CUSTOM')),
  title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 255),
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  target_date DATE NOT NULL,
  target_value NUMERIC(10,2),
  unit TEXT,
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED')),
  source TEXT NOT NULL DEFAULT 'USER_DEFINED',
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- 3. Study Schedules
CREATE TABLE IF NOT EXISTS public.study_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  preparation_profile_id UUID REFERENCES public.preparation_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 255),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('DRAFT', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'SUPERSEDED', 'ARCHIVED')),
  strategy_mode TEXT NOT NULL DEFAULT 'BALANCED',
  planning_version TEXT NOT NULL DEFAULT 'v1.0.0',
  input_fingerprint TEXT NOT NULL,
  source_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  limitations TEXT[] DEFAULT '{}',
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  superseded_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- 4. Study Schedule Blocks
CREATE TABLE IF NOT EXISTS public.study_schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.study_schedules(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  block_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  planned_minutes INTEGER NOT NULL CHECK (planned_minutes > 0),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('LEARN', 'REVISION', 'PYQ', 'QUIZ', 'MOCK', 'MISTAKE_REVIEW', 'KNOWLEDGE_REVIEW', 'BUFFER', 'CUSTOM')),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lectures(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  rationale_codes TEXT[] NOT NULL DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'RESCHEDULED')),
  completion_source TEXT,
  actual_minutes INTEGER,
  completed_at TIMESTAMPTZ,
  skip_reason TEXT,
  position INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Weekly Plans
CREATE TABLE IF NOT EXISTS public.weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  preparation_profile_id UUID REFERENCES public.preparation_profiles(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.study_schedules(id) ON DELETE SET NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('DRAFT', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'SUPERSEDED', 'ARCHIVED')),
  planning_version TEXT NOT NULL DEFAULT 'v1.0.0',
  input_fingerprint TEXT NOT NULL,
  source_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  planned_minutes INTEGER NOT NULL DEFAULT 0,
  completed_minutes INTEGER NOT NULL DEFAULT 0,
  limitations TEXT[] DEFAULT '{}',
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  superseded_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.preparation_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.long_term_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;

-- Access Policies for single user setup
CREATE POLICY "Allow public all on preparation_profiles" ON public.preparation_profiles FOR ALL USING (true);
CREATE POLICY "Allow public all on long_term_goals" ON public.long_term_goals FOR ALL USING (true);
CREATE POLICY "Allow public all on study_schedules" ON public.study_schedules FOR ALL USING (true);
CREATE POLICY "Allow public all on study_schedule_blocks" ON public.study_schedule_blocks FOR ALL USING (true);
CREATE POLICY "Allow public all on weekly_plans" ON public.weekly_plans FOR ALL USING (true);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profile_owner ON public.preparation_profiles(owner_id, profile_status);
CREATE INDEX IF NOT EXISTS idx_goals_owner ON public.long_term_goals(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_schedules_owner ON public.study_schedules(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_date ON public.study_schedule_blocks(schedule_id, block_date);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_owner ON public.weekly_plans(owner_id, week_start_date);
