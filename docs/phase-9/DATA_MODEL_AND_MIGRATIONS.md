# Phase 9: Data Model and Migrations

## Relational Database Schema

Phase 9 defines standard PostgreSQL tables for managing subjects, topics, questions, options, tags, video resources, and provenance metadata.

```sql
-- Phase 9: Database Migration Script

CREATE TABLE IF NOT EXISTS gate_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    weightage_percent NUMERIC(5,2) NOT NULL,
    display_order INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gate_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES gate_subjects(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    parent_topic_id UUID REFERENCES gate_topics(id),
    yield_category VARCHAR(20) CHECK (yield_category IN ('HIGH', 'MEDIUM', 'LOW')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gate_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_code VARCHAR(100) UNIQUE NOT NULL,
    subject_id UUID REFERENCES gate_subjects(id),
    topic_id UUID REFERENCES gate_topics(id),
    question_type VARCHAR(10) CHECK (question_type IN ('MCQ', 'MSQ', 'NAT')),
    marks NUMERIC(3,1) CHECK (marks IN (1.0, 2.0)),
    negative_marks NUMERIC(3,2) DEFAULT 0.0,
    statement_markdown TEXT NOT NULL,
    explanation_markdown TEXT,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD', 'ADVANCED')),
    gate_year INT,
    source_type VARCHAR(30) CHECK (source_type IN ('OFFICIAL_PYQ', 'STANDARD_TEXTBOOK', 'CUSTOM_MOCK')),
    sha256_hash VARCHAR(64) UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gate_question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES gate_questions(id) ON DELETE CASCADE,
    option_key VARCHAR(5) NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```
