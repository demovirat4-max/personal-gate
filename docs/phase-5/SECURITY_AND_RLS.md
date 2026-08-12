# Security and Row Level Security (RLS) Policy

> **GATE AIR-1 Command Center** · Multi-Tenant Security & Isolation Matrix

---

## Security Architecture

Phase 5 enforces multi-tenant row-level data isolation using Supabase Row Level Security (RLS) policies. Every table in the adaptive domain contains an indexed `owner_id` column linked to `auth.users(id)`.

---

## RLS Enforcement Matrix

| Table | Policy Name | Permitted Operations | Policy Definition (`USING` / `WITH CHECK`) |
|-------|-------------|----------------------|-------------------------------------------|
| `study_sessions` | `study_sessions_owner_isolation` | ALL (SELECT, INSERT, UPDATE, DELETE) | `owner_id = auth.uid()` |
| `daily_plans` | `daily_plans_owner_isolation` | ALL (SELECT, INSERT, UPDATE, DELETE) | `owner_id = auth.uid()` |
| `daily_plan_items` | `daily_plan_items_owner_isolation` | ALL (SELECT, INSERT, UPDATE, DELETE) | `owner_id = auth.uid()` |
| `revisions` | `revisions_owner_isolation` | ALL (SELECT, INSERT, UPDATE, DELETE) | `owner_id = auth.uid()` |
| `topic_mastery` | `topic_mastery_owner_isolation` | ALL (SELECT, INSERT, UPDATE, DELETE) | `owner_id = auth.uid()` |

---

## Service Role Policy

Server-side orchestration logic in `src/server/services/` operates using `supabaseAdmin` service role client with strict scope restrictions, ensuring user queries cannot bypass ownership boundaries in standard API handlers.
