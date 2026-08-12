-- Migration: Phase 7 Exam Simulator and PYQ Engine Schema
-- Date: 2026-08-12

-- 1. Question Bank Questions
CREATE TABLE IF NOT EXISTS public.question_bank_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_scope TEXT NOT NULL DEFAULT 'public',
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lectures(id) ON DELETE SET NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('MCQ', 'MSQ', 'NAT_INTEGER', 'NAT_DECIMAL')),
  question_text TEXT NOT NULL CHECK (char_length(question_text) > 0),
  question_content_format TEXT NOT NULL DEFAULT 'MARKDOWN' CHECK (question_content_format IN ('PLAIN_TEXT', 'MARKDOWN', 'LATEX')),
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer JSONB NOT NULL,
  answer_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  explanation TEXT,
  marks NUMERIC(4,2) NOT NULL DEFAULT 1.00 CHECK (marks > 0),
  negative_marks NUMERIC(4,2) NOT NULL DEFAULT 0.33 CHECK (negative_marks >= 0),
  exam_name TEXT DEFAULT 'GATE CS',
  exam_year INTEGER CHECK (exam_year IS NULL OR (exam_year >= 1990 AND exam_year <= 2030)),
  exam_session TEXT,
  paper_code TEXT DEFAULT 'CS',
  question_number INTEGER,
  source_type TEXT NOT NULL DEFAULT 'VERIFIED_PYQ' CHECK (source_type IN ('VERIFIED_PYQ', 'IMPORTED_UNVERIFIED', 'AUTHOR_CREATED', 'AI_DRAFT')),
  source_reference TEXT,
  source_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  verification_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'NEEDS_REVIEW', 'VERIFIED', 'REJECTED')),
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
  difficulty_label TEXT CHECK (difficulty_label IS NULL OR difficulty_label IN ('EASY', 'MEDIUM', 'HARD')),
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- 2. Exam Tests
CREATE TABLE IF NOT EXISTS public.exam_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 255),
  description TEXT,
  test_type TEXT NOT NULL CHECK (test_type IN ('TOPIC', 'SUBJECT', 'PYQ', 'FULL_MOCK', 'CUSTOM')),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  source_policy TEXT NOT NULL DEFAULT 'VERIFIED_PYQ_ONLY',
  status TEXT NOT NULL DEFAULT 'READY' CHECK (status IN ('DRAFT', 'READY', 'ARCHIVED')),
  duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds > 0),
  total_questions INTEGER NOT NULL DEFAULT 0 CHECK (total_questions >= 0),
  total_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00 CHECK (total_marks >= 0),
  instructions TEXT,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- 3. Exam Test Questions
CREATE TABLE IF NOT EXISTS public.exam_test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.exam_tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.question_bank_questions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 1),
  section_key TEXT DEFAULT 'GENERAL',
  question_snapshot JSONB NOT NULL,
  scoring_snapshot JSONB NOT NULL,
  question_revision INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(test_id, position)
);

-- 4. Exam Attempts
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  test_id UUID NOT NULL REFERENCES public.exam_tests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTING', 'SUBMITTED', 'EXPIRED', 'ABANDONED')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  server_deadline_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  auto_submitted_at TIMESTAMPTZ,
  elapsed_seconds INTEGER NOT NULL DEFAULT 0 CHECK (elapsed_seconds >= 0),
  current_question_position INTEGER DEFAULT 1,
  answer_version INTEGER NOT NULL DEFAULT 1,
  test_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  score NUMERIC(6,2),
  max_score NUMERIC(6,2),
  correct_count INTEGER,
  incorrect_count INTEGER,
  unanswered_count INTEGER,
  evaluation_version TEXT,
  submission_reason TEXT,
  idempotency_key TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, idempotency_key)
);

-- 5. Exam Answers
CREATE TABLE IF NOT EXISTS public.exam_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  test_question_id UUID NOT NULL REFERENCES public.exam_test_questions(id) ON DELETE CASCADE,
  answer_payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'SAVED' CHECK (status IN ('SAVED', 'CLEARED', 'SUBMITTED')),
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_sequence INTEGER,
  server_sequence INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  is_correct BOOLEAN,
  awarded_marks NUMERIC(6,2),
  evaluation_reason_codes TEXT[] DEFAULT '{}',
  evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(attempt_id, test_question_id)
);

-- Enable RLS
ALTER TABLE public.question_bank_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;

-- Access Policies for single user setup
CREATE POLICY "Allow public all on question_bank_questions" ON public.question_bank_questions FOR ALL USING (true);
CREATE POLICY "Allow public all on exam_tests" ON public.exam_tests FOR ALL USING (true);
CREATE POLICY "Allow public all on exam_test_questions" ON public.exam_test_questions FOR ALL USING (true);
CREATE POLICY "Allow public all on exam_attempts" ON public.exam_attempts FOR ALL USING (true);
CREATE POLICY "Allow public all on exam_answers" ON public.exam_answers FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.question_bank_questions(subject_id, verification_status);
CREATE INDEX IF NOT EXISTS idx_exam_tests_owner ON public.exam_tests(owner_id, test_type);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_owner ON public.exam_attempts(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt ON public.exam_answers(attempt_id);
