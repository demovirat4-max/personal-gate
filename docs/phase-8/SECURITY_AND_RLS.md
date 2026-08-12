# Phase 8: Security and RLS

## Security Specification
- **Row-Level Security (RLS)**: Enforced across `preparation_profiles`, `long_term_goals`, `study_schedules`, and `schedule_blocks`.
- **Ownership Check**: All read/write policies strictly restrict access to `auth.uid()`.
