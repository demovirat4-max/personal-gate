-- Phase 3 Schema: Watch Progress, Quizzes, Mistakes, Revisions, Daily Mission

-- 1. Lesson Watch Progress Table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default_user',
  lesson_id UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  youtube_video_id TEXT NOT NULL,
  watched_seconds INT NOT NULL DEFAULT 0,
  furthest_watched_seconds INT NOT NULL DEFAULT 0,
  duration_seconds INT NOT NULL DEFAULT 0,
  progress_percent INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completion_source TEXT NOT NULL DEFAULT 'AUTOMATIC',
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_lesson UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON lesson_progress(user_id, completed);

-- 2. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lectures(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  pass_percentage INT NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'NUMERIC', 'TRUE_FALSE')),
  options_json JSONB, -- Array of string options or objects
  correct_answer_json JSONB NOT NULL, -- Server-side only answer payload
  explanation TEXT,
  marks NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  negative_marks NUMERIC(4,2) NOT NULL DEFAULT 0.00,
  order_index INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id, order_index);

-- 4. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default_user',
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'ABANDONED')) DEFAULT 'IN_PROGRESS',
  score NUMERIC(5,2) DEFAULT 0.00,
  max_score NUMERIC(5,2) DEFAULT 0.00,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);

-- 5. Quiz Answers Table
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_answer_json JSONB NOT NULL,
  is_correct BOOLEAN,
  awarded_marks NUMERIC(4,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
);

-- 6. Mistakes Table
CREATE TABLE IF NOT EXISTS mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default_user',
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  user_answer_json JSONB NOT NULL,
  correct_answer_json JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'REVIEWED', 'MASTERED')) DEFAULT 'OPEN',
  occurrence_count INT NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reflection TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_question_mistake UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_mistakes_user_status ON mistakes(user_id, status);

-- 7. Revisions Table (Spaced Repetition)
CREATE TABLE IF NOT EXISTS revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default_user',
  source_type TEXT NOT NULL CHECK (source_type IN ('MISTAKE', 'LESSON', 'TOPIC')),
  source_id UUID NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lectures(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('DUE', 'UPCOMING', 'COMPLETED')) DEFAULT 'DUE',
  due_date DATE NOT NULL, -- Asia/Kolkata date
  interval_days INT NOT NULL DEFAULT 1,
  review_count INT NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_source_revision UNIQUE (user_id, source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_revisions_user_due ON revisions(user_id, due_date, status);

-- 8. Revision Reviews Log
CREATE TABLE IF NOT EXISTS revision_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id UUID NOT NULL REFERENCES revisions(id) ON DELETE CASCADE,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  outcome TEXT NOT NULL CHECK (outcome IN ('SUCCESS', 'FAIL')),
  interval_days_applied INT NOT NULL
);

-- RLS Enablement
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_reviews ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon Full Access for personal OS single-user mode
CREATE POLICY "Public full access lesson_progress" ON lesson_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access quizzes" ON quizzes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access quiz_questions" ON quiz_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access quiz_attempts" ON quiz_attempts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access quiz_answers" ON quiz_answers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access mistakes" ON mistakes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access revisions" ON revisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access revision_reviews" ON revision_reviews FOR ALL USING (true) WITH CHECK (true);
