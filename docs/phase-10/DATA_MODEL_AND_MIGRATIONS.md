# Data Model and Database Migrations Specification

## Database Architecture Overview

Phase 10 introduces three primary tables into Supabase PostgreSQL: `brain_context_snapshots`, `brain_decisions`, and `brain_evidence_logs`.

---

## SQL Migration File (`20260812_phase10_brain.sql`)

```sql
-- 1. Brain Context Snapshots Table
CREATE TABLE IF NOT EXISTS public.brain_context_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    days_remaining INT NOT NULL,
    overall_mastery NUMERIC(5,2) NOT NULL,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Brain Decisions Table
CREATE TABLE IF NOT EXISTS public.brain_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    snapshot_id UUID NOT NULL REFERENCES public.brain_context_snapshots(id) ON DELETE CASCADE,
    reason_code VARCHAR(64) NOT NULL,
    priority_score INT NOT NULL CHECK (priority_score BETWEEN 1 AND 100),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    action_type VARCHAR(64) NOT NULL,
    action_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'PRESENTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.brain_context_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own brain snapshots"
    ON public.brain_context_snapshots FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can access own brain decisions"
    ON public.brain_decisions FOR ALL
    USING (auth.uid() = user_id);
```
