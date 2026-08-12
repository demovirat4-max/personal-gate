# Data Model & Migrations — Phase 2

> **GATE AIR-1 Command Center** · Phase 2  
> Full description of all 7 database tables, columns, constraints, indexes, and RLS policies.

---

## Overview

Phase 2 introduces **7 new PostgreSQL tables** deployed to the Supabase project `lcotzvvckbxhmsasicwr` (region: `ap-northeast-2`). These tables model the GATE CS 2028 curriculum hierarchy and the import pipeline state machine.

### Table Map

```
subjects
  └── topics
        └── subtopics
              └── lectures
                    └── (import_row_results references lectures)

courses                  (associates subjects into syllabi)
import_batches           (tracks each dry-run / commit operation)
import_row_results       (per-row result of an import batch)
```

---

## Migration Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20260811_001_curriculum_foundation.sql` | Creates `subjects`, `topics`, `subtopics`, `courses`, `lectures` |
| `supabase/migrations/20260811_002_import_pipeline.sql` | Creates `import_batches`, `import_row_results` |

---

## Table: `subjects`

The top-level node of the curriculum hierarchy. Each subject maps to one GATE CS 2028 paper section.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Surrogate primary key |
| `code` | `text` | NOT NULL, UNIQUE | Canonical subject code e.g. `GATE_CS_DS` |
| `name` | `text` | NOT NULL | Human-readable name e.g. "Data Structures" |
| `display_order` | `integer` | NOT NULL, default `0` | Ordering within the syllabus |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last update timestamp |

### Indexes

```sql
CREATE UNIQUE INDEX subjects_code_idx ON subjects(code);
CREATE INDEX subjects_display_order_idx ON subjects(display_order);
```

### RLS Policies

```sql
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can list subjects
CREATE POLICY "subjects_select_all"
  ON subjects FOR SELECT USING (true);

-- Write: service role only (no authenticated user can INSERT/UPDATE)
CREATE POLICY "subjects_service_role_write"
  ON subjects FOR ALL
  USING (auth.role() = 'service_role');
```

---

## Table: `topics`

Second level of the hierarchy. Each topic belongs to exactly one subject.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Surrogate primary key |
| `subject_id` | `uuid` | NOT NULL, FK → `subjects(id)` ON DELETE CASCADE | Parent subject |
| `name` | `text` | NOT NULL | Topic name e.g. "Arrays and Strings" |
| `display_order` | `integer` | NOT NULL, default `0` | Ordering within the subject |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last update timestamp |

### Indexes

```sql
CREATE INDEX topics_subject_id_idx ON topics(subject_id);
CREATE INDEX topics_subject_order_idx ON topics(subject_id, display_order);
```

### RLS Policies

```sql
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "topics_select_all" ON topics FOR SELECT USING (true);
CREATE POLICY "topics_service_role_write" ON topics FOR ALL
  USING (auth.role() = 'service_role');
```

---

## Table: `subtopics`

Third level of the hierarchy. Each subtopic belongs to exactly one topic.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Surrogate primary key |
| `topic_id` | `uuid` | NOT NULL, FK → `topics(id)` ON DELETE CASCADE | Parent topic |
| `name` | `text` | NOT NULL | Subtopic name |
| `display_order` | `integer` | NOT NULL, default `0` | Ordering within the topic |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last update timestamp |

### Indexes

```sql
CREATE INDEX subtopics_topic_id_idx ON subtopics(topic_id);
```

### RLS Policies

```sql
ALTER TABLE subtopics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subtopics_select_all" ON subtopics FOR SELECT USING (true);
CREATE POLICY "subtopics_service_role_write" ON subtopics FOR ALL
  USING (auth.role() = 'service_role');
```

---

## Table: `courses`

Represents a named study course or syllabus that groups subjects together. Allows multiple syllabus versions to coexist.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Surrogate primary key |
| `name` | `text` | NOT NULL | Course name e.g. "GATE CS 2028" |
| `slug` | `text` | NOT NULL, UNIQUE | URL-safe identifier e.g. `gate-cs-2028` |
| `description` | `text` | | Optional description |
| `is_active` | `boolean` | NOT NULL, default `true` | Whether the course is active |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last update timestamp |

### Indexes

```sql
CREATE UNIQUE INDEX courses_slug_idx ON courses(slug);
CREATE INDEX courses_is_active_idx ON courses(is_active);
```

### RLS Policies

```sql
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses_select_all" ON courses FOR SELECT USING (true);
CREATE POLICY "courses_service_role_write" ON courses FOR ALL
  USING (auth.role() = 'service_role');
```

---

## Table: `lectures`

The leaf node of the curriculum hierarchy. Each lecture is a single video resource associated with a subtopic.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Surrogate primary key |
| `subtopic_id` | `uuid` | NOT NULL, FK → `subtopics(id)` ON DELETE CASCADE | Parent subtopic |
| `title` | `text` | NOT NULL | Lecture title |
| `youtube_url` | `text` | NOT NULL | Full YouTube watch URL |
| `youtube_video_id` | `text` | NOT NULL | Extracted video ID (11-char) |
| `duration_seconds` | `integer` | | Optional duration in seconds |
| `display_order` | `integer` | NOT NULL, default `0` | Ordering within the subtopic |
| `is_free` | `boolean` | NOT NULL, default `false` | Whether freely accessible |
| `imported_from_batch_id` | `uuid` | FK → `import_batches(id)` | Which batch created this row |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last update timestamp |

### Unique Constraint (Idempotency)

```sql
CREATE UNIQUE INDEX lectures_video_subtopic_idx
  ON lectures(youtube_video_id, subtopic_id);
```

This ensures the same video cannot be imported twice into the same subtopic. An upsert on conflict updates `title`, `display_order`, and `updated_at`.

### Indexes

```sql
CREATE INDEX lectures_subtopic_id_idx ON lectures(subtopic_id);
CREATE INDEX lectures_youtube_video_id_idx ON lectures(youtube_video_id);
CREATE INDEX lectures_imported_from_batch_id_idx ON lectures(imported_from_batch_id);
```

### RLS Policies

```sql
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lectures_select_all" ON lectures FOR SELECT USING (true);
CREATE POLICY "lectures_service_role_write" ON lectures FOR ALL
  USING (auth.role() = 'service_role');
```

---

## Table: `import_batches`

Tracks the lifecycle of each import operation from dry-run to commit.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Surrogate primary key |
| `idempotency_key` | `text` | NOT NULL, UNIQUE | Client-supplied or auto-generated dedupe key |
| `review_token` | `text` | NOT NULL, UNIQUE | `rev_tok_${uuid}` — required to commit |
| `status` | `text` | NOT NULL, CHECK IN ('pending','committed','failed') | State machine status |
| `source_type` | `text` | NOT NULL, CHECK IN ('sheets_url','csv','xlsx') | Import channel |
| `source_ref` | `text` | | URL or original filename |
| `total_rows` | `integer` | NOT NULL, default `0` | Rows parsed |
| `valid_rows` | `integer` | NOT NULL, default `0` | Rows that passed validation |
| `error_rows` | `integer` | NOT NULL, default `0` | Rows that failed validation |
| `committed_at` | `timestamptz` | | When the batch was committed |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Dry-run timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last state change |

### Indexes

```sql
CREATE UNIQUE INDEX import_batches_idempotency_key_idx ON import_batches(idempotency_key);
CREATE UNIQUE INDEX import_batches_review_token_idx ON import_batches(review_token);
CREATE INDEX import_batches_status_idx ON import_batches(status);
CREATE INDEX import_batches_created_at_idx ON import_batches(created_at DESC);
```

### RLS Policies

```sql
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
-- Only service role can read/write import_batches
CREATE POLICY "import_batches_service_role_only"
  ON import_batches FOR ALL
  USING (auth.role() = 'service_role');
```

---

## Table: `import_row_results`

Stores the per-row normalized result of each dry-run, enabling the review UI to display exactly what will be committed.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Surrogate primary key |
| `batch_id` | `uuid` | NOT NULL, FK → `import_batches(id)` ON DELETE CASCADE | Parent batch |
| `row_index` | `integer` | NOT NULL | 0-based row number in the source file |
| `status` | `text` | NOT NULL, CHECK IN ('valid','error','duplicate') | Row validation result |
| `raw_data` | `jsonb` | NOT NULL | Original raw row from the parser |
| `normalized_data` | `jsonb` | | Normalized row if validation passed |
| `error_messages` | `text[]` | | Array of validation error strings |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |

### Indexes

```sql
CREATE INDEX import_row_results_batch_id_idx ON import_row_results(batch_id);
CREATE INDEX import_row_results_status_idx ON import_row_results(batch_id, status);
```

### RLS Policies

```sql
ALTER TABLE import_row_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "import_row_results_service_role_only"
  ON import_row_results FOR ALL
  USING (auth.role() = 'service_role');
```

---

## Summary

| Table | Rows at launch | Notes |
|-------|---------------|-------|
| `subjects` | 11 | GATE CS 2028 subjects seeded |
| `topics` | 0 | Populated via import |
| `subtopics` | 0 | Populated via import |
| `courses` | 1 | "GATE CS 2028" course |
| `lectures` | 0 | Populated via import |
| `import_batches` | 0 | Grows with each import |
| `import_row_results` | 0 | Grows with each dry-run |
