# Idempotency and Concurrency Specification

## Overview

Because students may interact with the Command Center across multiple tabs or devices simultaneously, the Global AI Brain must handle concurrent requests safely without generating duplicate decision logs or conflicting schedule mutations.

---

## Technical Solutions

### 1. Idempotency Keys
- All state-mutating requests (`POST /api/v1/brain/command`, `POST /api/v1/brain/decisions/accept`) support an `Idempotency-Key` HTTP header.
- Cached in Redis / Supabase for 24 hours. Repeating a request returns the stored result without re-executing logic.

### 2. Optimistic Locking
- Database tables (`preparation_profiles`, `daily_plans`) feature a `version_id` integer column.
- SQL update pattern:
  ```sql
  UPDATE public.preparation_profiles
  SET execution_mode = 'SPRINT', version_id = version_id + 1
  WHERE id = $1 AND version_id = $2;
  ```
- Returns 0 affected rows if a concurrent session mutated state first, prompting client-side state re-fetch.
