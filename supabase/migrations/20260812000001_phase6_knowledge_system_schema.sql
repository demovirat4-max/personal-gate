-- Migration: Phase 6 Personal Knowledge System Schema
-- Date: 2026-08-12

-- 1. Personal Notes
CREATE TABLE IF NOT EXISTS public.personal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lectures(id) ON DELETE SET NULL,
  mistake_id UUID REFERENCES public.mistakes(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 255),
  content TEXT NOT NULL,
  content_format TEXT NOT NULL DEFAULT 'MARKDOWN' CHECK (content_format IN ('PLAIN_TEXT', 'MARKDOWN')),
  note_type TEXT NOT NULL DEFAULT 'GENERAL' CHECK (note_type IN ('GENERAL', 'LESSON', 'CONCEPT', 'MISTAKE', 'QUESTION', 'SUMMARY', 'REVISION')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  source_type TEXT NOT NULL DEFAULT 'USER_AUTHORED' CHECK (source_type IN ('USER_AUTHORED', 'AI_ASSISTED', 'LESSON_DERIVED', 'MISTAKE_DERIVED', 'QUIZ_DERIVED', 'REVISION_DERIVED', 'IMPORTED')),
  source_id UUID,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- 2. Formula Entries
CREATE TABLE IF NOT EXISTS public.formula_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 255),
  expression TEXT NOT NULL,
  expression_format TEXT NOT NULL DEFAULT 'LATEX' CHECK (expression_format IN ('PLAIN_TEXT', 'LATEX')),
  description TEXT,
  variable_definitions JSONB NOT NULL DEFAULT '[]'::jsonb,
  conditions TEXT,
  example TEXT,
  source_type TEXT NOT NULL DEFAULT 'USER_AUTHORED',
  source_id UUID,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- 3. Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lectures(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('LESSON', 'VIDEO_RESOURCE', 'CONTENT_SOURCE', 'QUESTION', 'QUIZ', 'MISTAKE', 'REVISION_ITEM', 'PERSONAL_NOTE', 'FORMULA', 'FLASHCARD_DECK', 'REVISION_SHEET', 'EXTERNAL_URL')),
  target_id UUID,
  external_url TEXT CHECK (external_url IS NULL OR external_url LIKE 'https://%'),
  title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 255),
  description TEXT,
  source_type TEXT NOT NULL DEFAULT 'USER_AUTHORED',
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- 4. Flashcard Decks
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 255),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  source_type TEXT NOT NULL DEFAULT 'USER_AUTHORED',
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  card_count INTEGER NOT NULL DEFAULT 0 CHECK (card_count >= 0),
  due_card_count INTEGER NOT NULL DEFAULT 0 CHECK (due_card_count >= 0),
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- 5. Flashcards
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  front TEXT NOT NULL CHECK (char_length(front) > 0),
  back TEXT NOT NULL CHECK (char_length(back) > 0),
  hint TEXT,
  explanation TEXT,
  card_type TEXT NOT NULL DEFAULT 'BASIC' CHECK (card_type IN ('BASIC', 'CONCEPT', 'FORMULA', 'MISTAKE', 'QUESTION')),
  source_type TEXT NOT NULL DEFAULT 'USER_AUTHORED',
  source_id UUID,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'SUSPENDED')),
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- 6. Flashcard Review States
CREATE TABLE IF NOT EXISTS public.flashcard_review_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  algorithm_version TEXT NOT NULL DEFAULT 'v1.0.0',
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING', 'SUSPENDED')),
  due_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  interval_days INTEGER NOT NULL DEFAULT 0 CHECK (interval_days >= 0),
  ease_or_stability NUMERIC(5,2) NOT NULL DEFAULT 2.50 CHECK (ease_or_stability >= 1.00),
  difficulty NUMERIC(5,2) NOT NULL DEFAULT 5.00 CHECK (difficulty >= 0 AND difficulty <= 10),
  consecutive_successes INTEGER NOT NULL DEFAULT 0 CHECK (consecutive_successes >= 0),
  lapse_count INTEGER NOT NULL DEFAULT 0 CHECK (lapse_count >= 0),
  last_reviewed_at TIMESTAMPTZ,
  last_rating TEXT CHECK (last_rating IS NULL OR last_rating IN ('AGAIN', 'HARD', 'GOOD', 'EASY')),
  input_fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, flashcard_id)
);

-- 7. Flashcard Reviews (Immutable Log)
CREATE TABLE IF NOT EXISTS public.flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  review_state_id UUID REFERENCES public.flashcard_review_states(id) ON DELETE SET NULL,
  rating TEXT NOT NULL CHECK (rating IN ('AGAIN', 'HARD', 'GOOD', 'EASY')),
  previous_state TEXT NOT NULL,
  resulting_state TEXT NOT NULL,
  previous_due_at TIMESTAMPTZ,
  resulting_due_at TIMESTAMPTZ NOT NULL,
  previous_interval_days INTEGER NOT NULL DEFAULT 0,
  resulting_interval_days INTEGER NOT NULL DEFAULT 0,
  algorithm_version TEXT NOT NULL DEFAULT 'v1.0.0',
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, idempotency_key)
);

-- 8. Revision Sheets
CREATE TABLE IF NOT EXISTS public.revision_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 255),
  content TEXT NOT NULL,
  content_format TEXT NOT NULL DEFAULT 'MARKDOWN',
  source_type TEXT NOT NULL DEFAULT 'USER_AUTHORED',
  source_references JSONB NOT NULL DEFAULT '[]'::jsonb,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- 9. Knowledge Tags
CREATE TABLE IF NOT EXISTS public.knowledge_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  name TEXT NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 50),
  normalized_name TEXT NOT NULL CHECK (char_length(normalized_name) > 0 AND char_length(normalized_name) <= 50),
  color TEXT DEFAULT '#06b6d4',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, normalized_name)
);

-- 10. Knowledge Tag Assignments
CREATE TABLE IF NOT EXISTS public.knowledge_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL DEFAULT 'user_default',
  tag_id UUID NOT NULL REFERENCES public.knowledge_tags(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('NOTE', 'FORMULA', 'BOOKMARK', 'DECK', 'CARD', 'REVISION_SHEET')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, tag_id, target_type, target_id)
);

-- Enable RLS
ALTER TABLE public.personal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formula_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_review_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Allow public / default user access policies for single-user command center
CREATE POLICY "Allow public all on personal_notes" ON public.personal_notes FOR ALL USING (true);
CREATE POLICY "Allow public all on formula_entries" ON public.formula_entries FOR ALL USING (true);
CREATE POLICY "Allow public all on bookmarks" ON public.bookmarks FOR ALL USING (true);
CREATE POLICY "Allow public all on flashcard_decks" ON public.flashcard_decks FOR ALL USING (true);
CREATE POLICY "Allow public all on flashcards" ON public.flashcards FOR ALL USING (true);
CREATE POLICY "Allow public all on flashcard_review_states" ON public.flashcard_review_states FOR ALL USING (true);
CREATE POLICY "Allow public all on flashcard_reviews" ON public.flashcard_reviews FOR ALL USING (true);
CREATE POLICY "Allow public all on revision_sheets" ON public.revision_sheets FOR ALL USING (true);
CREATE POLICY "Allow public all on knowledge_tags" ON public.knowledge_tags FOR ALL USING (true);
CREATE POLICY "Allow public all on knowledge_tag_assignments" ON public.knowledge_tag_assignments FOR ALL USING (true);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_personal_notes_owner ON public.personal_notes(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_formula_entries_owner ON public.formula_entries(owner_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_owner ON public.bookmarks(owner_id, target_type);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck ON public.flashcards(deck_id, status);
CREATE INDEX IF NOT EXISTS idx_flashcard_review_states_due ON public.flashcard_review_states(owner_id, due_at);
