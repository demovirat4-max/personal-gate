# Phase 8: Data Model and Migrations

## Relational Schema Entities
1. `preparation_profiles`: Target exam (GATE CS/IT 2028), AIR target, available hours.
2. `long_term_goals`: Syllabus targets, revision passes, PYQ volume benchmarks.
3. `strategy_models`: 5-phase weights, buffer allocations, risk settings.
4. `study_schedules`: Generated macro schedules, start/end dates, active plan indicator.
5. `schedule_blocks`: Micro time blocks, subject, topic ID, scheduled date, state.
6. `plan_fingerprints`: Immutable SHA-256 state hashes.
7. `plan_revisions`: Audit history of manual and automated replans.
8. `plan_adherence_logs`: Execution evidence, completed blocks vs planned blocks.

## Supabase RLS Policies
All tables feature RLS policies enforcing `user_id = auth.uid()`.
