# Backend Architecture Specification

## 1. Dependency Direction & Layering Architecture

The backend strictly enforces a single-direction dependency flow:

```text
Next.js Route Handler (/src/app/api/v1/...)
    │  (Validates request with Zod)
    ▼
Application Service Layer (/src/services/...)
    │  (Contains pure domain logic & orchestration)
    ▼
Repository Interface (/src/repositories/interfaces/...)
    │  (Defines data operation contracts)
    ▼
Supabase Repository Implementation (/src/repositories/supabase/...)
    │  (Executes server-side SQL / Supabase queries)
    ▼
Supabase PostgreSQL Database
```

## 2. Server-Side Execution & Security Boundary Rules

1. **No Database Code in Handlers**: Route Handlers must not construct raw SQL or invoke `.from()` directly. Handlers instantiate domain services and delegate data fetching.
2. **Server-Side Supabase Client Only**: Supabase DB queries use `@supabase/ssr` with server-side cookie context or server service-role bindings (strictly inside `/src/services` or `/src/repositories`).
3. **Double Zod Validation**:
   * **Input**: Request path, query, and payload are parsed via `Schema.parse()` before executing domain logic. Failure returns `400 BAD_REQUEST` or `422 UNPROCESSABLE_ENTITY`.
   * **Output**: Service results are validated against declared response schemas before being dispatched to the HTTP client (in dev/testing environments) to guarantee contract adherence.

## 3. Core Business Services Definition

* **`SyllabusImporterService`**: Parses CSV/XLSX/Google Sheets, normalizes subject/topic titles, extracts YouTube video/playlist IDs via regex, fetches YouTube metadata, flags invalid/unembeddable videos, and runs transactional batch inserts.
* **`VideoAnalyticsService`**: Receives batched heartbeat playback intervals, computes effective watched intervals (resolving overlap), updates total watched seconds, calculates completion status, and calculates confusion markers (heavy replaying).
* **`DeterministicSchedulerService`**: Accepts exam date (GATE 2028), remaining days, weekly available time blocks, subject weightages, topic mastery, and forgetting curves to produce daily mission blocks and backlog recalculations.
* **`MasteryReadinessService`**: Calculates transparent weighted scores (PYQ accuracy 40%, Syllabus Coverage 30%, Retention Risk 20%, Mock Test Trend 10%) for topics, subjects, and overall AIR-1 Trajectory.
* **`AiMentorService`**: Wraps NVIDIA NIM API endpoints using OpenAI-compatible payload structures. Implements structured JSON schema outputs via Zod, token budget enforcement, prompt versioning, and deterministic fallbacks.
