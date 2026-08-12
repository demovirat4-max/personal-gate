-- Phase 2: Curriculum Hierarchy and Tabular Import Engine Schema
-- File: supabase/migrations/20260811000001_curriculum_and_import_schema.sql

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    weightage_marks NUMERIC(4,2) DEFAULT 8.00,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Topics Table
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    code TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (subject_id, title)
);

-- 3. Subtopics Table
CREATE TABLE IF NOT EXISTS subtopics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (topic_id, title)
);

-- 4. Courses / Playlists Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    teacher_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (title, teacher_name)
);

-- 5. Lectures Table
CREATE TABLE IF NOT EXISTS lectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
    subtopic_id UUID REFERENCES subtopics(id) ON DELETE SET NULL,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    youtube_video_id TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    lecture_order INT NOT NULL DEFAULT 1,
    duration_seconds INT NOT NULL DEFAULT 0,
    priority TEXT CHECK (priority IN ('HIGH', 'NORMAL', 'LOW')) DEFAULT 'NORMAL',
    notes TEXT,
    verification_status TEXT CHECK (verification_status IN ('VERIFIED', 'UNVERIFIED')) DEFAULT 'UNVERIFIED',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (topic_id, youtube_video_id)
);

-- 6. Import Batches Table
CREATE TABLE IF NOT EXISTS import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL CHECK (source_type IN ('GOOGLE_SHEETS', 'CSV_UPLOAD', 'XLSX_UPLOAD')),
    source_label TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('RECEIVED', 'PARSING', 'VALIDATED', 'READY', 'COMMITTING', 'COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED')),
    row_count INT NOT NULL DEFAULT 0,
    inserted_count INT NOT NULL DEFAULT 0,
    updated_count INT NOT NULL DEFAULT 0,
    unchanged_count INT NOT NULL DEFAULT 0,
    rejected_count INT NOT NULL DEFAULT 0,
    idempotency_key TEXT UNIQUE,
    review_token TEXT UNIQUE,
    error_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- 7. Import Row Results Table
CREATE TABLE IF NOT EXISTS import_row_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES import_batches(id) ON DELETE CASCADE,
    row_number INT NOT NULL,
    raw_data_json JSONB NOT NULL,
    normalized_data_json JSONB,
    status TEXT NOT NULL CHECK (status IN ('VALID', 'WARNING', 'REJECTED', 'INSERTED', 'UPDATED', 'UNCHANGED')),
    error_code TEXT,
    error_message TEXT,
    field_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_subtopics_topic_id ON subtopics(topic_id);
CREATE INDEX IF NOT EXISTS idx_lectures_topic_id ON lectures(topic_id);
CREATE INDEX IF NOT EXISTS idx_lectures_youtube_id ON lectures(youtube_video_id);
CREATE INDEX IF NOT EXISTS idx_import_row_results_batch_id ON import_row_results(batch_id);
