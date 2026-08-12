# Data Model and Migrations

> **GATE AIR-1 Command Center** · Phase 5 Database Schema & Entity Relationships

---

## Entity Relationship Overview

Phase 5 introduces core adaptive entities:

```
[Users] 1 --- N [StudySessions]
[Users] 1 --- N [DailyPlans] 1 --- N [DailyPlanItems]
[Users] 1 --- N [Revisions]
[Users] 1 --- N [TopicMastery]
```

---

## Table Schemas

### 1. `study_sessions`
- `id`: UUID (PK)
- `owner_id`: UUID (FK to auth.users)
- `subject_id`: UUID (FK to subjects, nullable)
- `topic_id`: UUID (FK to topics, nullable)
- `lesson_id`: UUID (FK to lessons, nullable)
- `session_type`: TEXT (`LEARN`, `REVISION`, `PRACTICE`, `MISTAKE_REVIEW`, `MOCK_TEST`)
- `status`: TEXT (`ACTIVE`, `PAUSED`, `COMPLETED`, `ABANDONED`)
- `active_duration_seconds`: INTEGER DEFAULT 0
- `paused_duration_seconds`: INTEGER DEFAULT 0
- `started_at`: TIMESTAMPTZ DEFAULT now()
- `ended_at`: TIMESTAMPTZ

### 2. `daily_plans`
- `id`: UUID (PK)
- `owner_id`: UUID (FK to auth.users)
- `plan_date`: DATE NOT NULL
- `status`: TEXT (`DRAFT`, `CONFIRMED`, `SUPERSEDED`, `COMPLETED`)
- `available_minutes`: INTEGER NOT NULL
- `planned_minutes`: INTEGER NOT NULL
- `strategy_version`: TEXT NOT NULL
- `input_fingerprint`: TEXT NOT NULL

### 3. `daily_plan_items`
- `id`: UUID (PK)
- `daily_plan_id`: UUID (FK to daily_plans)
- `item_type`: TEXT (`LEARN`, `REVISION`, `PRACTICE`, `MISTAKE_REVIEW`)
- `estimated_minutes`: INTEGER NOT NULL
- `priority_score`: NUMERIC(5, 2) NOT NULL
- `sequence`: INTEGER NOT NULL
- `status`: TEXT (`PLANNED`, `IN_PROGRESS`, `COMPLETED`, `SKIPPED`)

---

## Migration Integrity

All tables feature cascade deletes on owner references, strict check constraints on status enums, and indexed `owner_id` + `created_at` fields for optimized query performance.
