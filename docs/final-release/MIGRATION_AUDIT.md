# Migration & Database Audit

## Executive Summary
This document provides an audit of all database schema migrations, SQL scripts, Row Level Security (RLS) policies, and rollback procedures implemented in Supabase for the GATE CS/IT 2028 Command Center.

---

## 1. Migration History

| Migration Script | Date | Applied Tables | Key Objectives | Status |
|---|---|---|---|---|
| `20260812000000_initial_schema.sql` | 2026-08-12 | `profiles`, `user_progress`, `revision_items`, `practice_attempts`, `mock_test_results` | Base tables, foreign keys, RLS security policies, timestamps triggers | VERIFIED |

---

## 2. Table Schemas & Foreign Keys

### Tables Summary
1. **`profiles`**: User profile attributes (id references `auth.users`, target_year, created_at).
2. **`user_progress`**: Subject/topic completion status (`user_id`, `topic_id`, `status`, `last_reviewed`).
3. **`revision_items`**: Leitner box item state (`user_id`, `question_id`, `box_number`, `next_review_date`).
4. **`practice_attempts`**: Question attempt history (`user_id`, `question_id`, `selected_option`, `is_correct`, `time_spent_seconds`).
5. **`mock_test_results`**: Completed test performance (`user_id`, `test_id`, `score`, `marks_obtained`, `total_marks`, `completed_at`).

---

## 3. Row Level Security (RLS) Policy Verification
All tables strictly enforce RLS policies to guarantee multi-tenant user data isolation:

```sql
-- Profile isolation policy
CREATE POLICY "Users can only read/write own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- User progress isolation policy
CREATE POLICY "Users can only access own progress"
  ON public.user_progress FOR ALL
  USING (auth.uid() = user_id);
```

---

## 4. Rollback & Disaster Recovery Protocol
- **Rollback Safety**: Every migration is structured with an idempotent inverse script located in `supabase/rollbacks/`.
- **Backup Policy**: Daily automated Supabase PITR (Point-in-Time Recovery) snapshots enabled.
