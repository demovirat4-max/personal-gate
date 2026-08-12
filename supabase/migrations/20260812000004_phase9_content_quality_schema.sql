-- Migration: Phase 9 Real Content and GATE Data Quality Schema
-- Date: 2026-08-12

-- 1. Content Sources
CREATE TABLE IF NOT EXISTS public.content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  source_type TEXT NOT NULL CHECK (source_type IN ('OFFICIAL_EXAM', 'OFFICIAL_SYLLABUS', 'OFFICIAL_ANSWER_KEY', 'INSTITUTIONAL', 'TEACHER_CURATED', 'USER_PROVIDED', 'MANUAL_ENTRY', 'IMPORT_FILE', 'GOOGLE_SHEET', 'YOUTUBE', 'GENERATED_PRACTICE', 'UNKNOWN')),
  publisher TEXT NOT NULL DEFAULT 'GATE Official',
  title TEXT NOT NULL CHECK (char_length(title) > 0),
  source_url TEXT,
  external_id TEXT,
  exam_name TEXT DEFAULT 'GATE CS/IT',
  exam_year INTEGER CHECK (exam_year IS NULL OR (exam_year >= 1990 AND exam_year <= 2030)),
  paper_code TEXT DEFAULT 'CS',
  checksum TEXT,
  verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'NEEDS_REVIEW', 'PARTIALLY_VERIFIED', 'VERIFIED', 'REJECTED', 'ARCHIVED')),
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- 2. Subject & Topic Weightages
CREATE TABLE IF NOT EXISTS public.subject_weightages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_name TEXT NOT NULL DEFAULT 'GATE CS/IT',
  from_year INTEGER NOT NULL DEFAULT 2015,
  to_year INTEGER NOT NULL DEFAULT 2026,
  question_count INTEGER NOT NULL DEFAULT 0 CHECK (question_count >= 0),
  marks_total NUMERIC(6,2) NOT NULL DEFAULT 0.00 CHECK (marks_total >= 0),
  analyzed_paper_count INTEGER NOT NULL DEFAULT 10,
  weightage_value NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  weightage_unit TEXT NOT NULL DEFAULT 'PERCENT_OF_ANALYZED_MARKS',
  calculation_version TEXT NOT NULL DEFAULT 'v1.0.0',
  verification_status TEXT NOT NULL DEFAULT 'VERIFIED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Video Resources
CREATE TABLE IF NOT EXISTS public.video_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  platform TEXT NOT NULL DEFAULT 'YOUTUBE',
  external_video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  channel_name TEXT,
  duration_seconds INTEGER,
  quality_status TEXT NOT NULL DEFAULT 'NEEDS_REVIEW' CHECK (quality_status IN ('NEEDS_REVIEW', 'APPROVED', 'REJECTED', 'BROKEN')),
  verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'NEEDS_REVIEW', 'VERIFIED', 'REJECTED')),
  availability_status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (availability_status IN ('UNKNOWN', 'AVAILABLE', 'UNAVAILABLE', 'REMOVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PYQ Import Batches & Rows
CREATE TABLE IF NOT EXISTS public.pyq_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  source_id UUID REFERENCES public.content_sources(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'CSV',
  checksum TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('UPLOADED', 'PARSED', 'VALIDATED', 'CONFIRMED', 'IMPORTED', 'ROLLED_BACK', 'FAILED')),
  import_version TEXT NOT NULL DEFAULT 'v1.0.0',
  total_rows INTEGER NOT NULL DEFAULT 0,
  valid_rows INTEGER NOT NULL DEFAULT 0,
  invalid_rows INTEGER NOT NULL DEFAULT 0,
  imported_rows INTEGER NOT NULL DEFAULT 0,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Content Quality Issues
CREATE TABLE IF NOT EXISTS public.content_quality_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('QUESTION', 'LESSON', 'VIDEO', 'SOURCE', 'TOPIC', 'SUBJECT')),
  entity_id UUID NOT NULL,
  issue_code TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'WARNING' CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'BLOCKING')),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED', 'ARCHIVED')),
  title TEXT NOT NULL,
  description TEXT,
  detected_by TEXT NOT NULL DEFAULT 'PURE_COVERAGE_ENGINE',
  detection_version TEXT NOT NULL DEFAULT 'v1.0.0',
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Content Audit Logs
CREATE TABLE IF NOT EXISTS public.content_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_type TEXT NOT NULL DEFAULT 'USER',
  before_snapshot JSONB,
  after_snapshot JSONB,
  change_summary TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_weightages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pyq_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_quality_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_audit_logs ENABLE ROW LEVEL SECURITY;

-- Access Policies for single user setup
CREATE POLICY "Allow public all on content_sources" ON public.content_sources FOR ALL USING (true);
CREATE POLICY "Allow public all on subject_weightages" ON public.subject_weightages FOR ALL USING (true);
CREATE POLICY "Allow public all on video_resources" ON public.video_resources FOR ALL USING (true);
CREATE POLICY "Allow public all on pyq_import_batches" ON public.pyq_import_batches FOR ALL USING (true);
CREATE POLICY "Allow public all on content_quality_issues" ON public.content_quality_issues FOR ALL USING (true);
CREATE POLICY "Allow public all on content_audit_logs" ON public.content_audit_logs FOR ALL USING (true);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_sources_status ON public.content_sources(verification_status, source_type);
CREATE INDEX IF NOT EXISTS idx_quality_issues_entity ON public.content_quality_issues(entity_type, entity_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation ON public.content_audit_logs(correlation_id);
