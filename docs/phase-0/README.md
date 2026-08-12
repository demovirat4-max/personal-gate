# GATE AIR-1 Command Center - Phase 0 Documentation Index

Welcome to the Phase 0 Specifications for **GATE AIR-1 Command Center**, an intelligent personal operating system designed to plan, track, adapt, and optimize preparation for the GATE exam.

## Document Structure (Exact Count: 23 Documents)

```text
docs/
  phase-0/
    README.md                              <- 1. You are here (Master Index)
    PRODUCT_VISION_AND_SCOPE.md           <- 2. Vision, provisional target, scope boundaries
    USER_EXPERIENCE_AND_SCREEN_MAP.md     <- 3. Information architecture & 11 UI state rules
    SYSTEM_ARCHITECTURE.md                <- 4. High-level tech stack & provider-independent architecture
    FRONTEND_ARCHITECTURE.md              <- 5. Next.js App Router, components & state strategy
    BACKEND_ARCHITECTURE.md               <- 6. Route Handlers, service layer, repositories
    API_CONTRACT_STANDARD.md              <- 7. Unified envelope, Zod schemas, error standards
    API_ENDPOINT_CATALOG.md               <- 8. Exhaustive endpoint catalog with contracts
    DATA_MODEL.md                         <- 9. Supabase PostgreSQL schema, indexes & policies
    AUTH_AND_SECURITY.md                  <- 10. Supabase Auth, secrets, security boundaries
    CURRICULUM_AND_LECTURE_IMPORT.md      <- 11. Importer specification (Public CSV & Uploads)
    VIDEO_TRACKING_SPEC.md                <- 12. YouTube IFrame API compliance & event analytics
    SCHEDULING_ENGINE_SPEC.md             <- 13. Deterministic scheduling engine & explicit priority formula
    MASTERY_REVISION_AND_READINESS.md     <- 14. Transparent metrics, scoring & AIR-1 model
    AI_ARCHITECTURE.md                    <- 15. Provider-independent AI layer with capability registry
    STATE_AND_RECOVERY_MODEL.md           <- 16. Session recovery & client/server state persistence
    TEST_STRATEGY.md                      <- 17. Vitest, React Testing Library & Playwright tests
    ENVIRONMENT_VARIABLE_CONTRACT.md      <- 18. Validated env variables (browser/server/secrets)
    OBSERVABILITY_AND_ERROR_HANDLING.md   <- 19. Logging, metrics, error codes & reporting
    MOBILE_READINESS.md                   <- 20. Cross-platform Expo/React Native architectural plan
    DEVELOPMENT_PHASES.md                 <- 21. Phase 1 to Phase 10 detailed scope & gates
    DECISIONS_AND_OPEN_QUESTIONS.md       <- 22. Blocking & non-blocking decisions catalog
    PHASE_0_VERIFICATION.md               <- 23. Complete verification matrix, audit & verdict
```

## System Overview

* **Target Exam**: Provisionally set to GATE Computer Science and Information Technology (CS/IT) 2028 (Configurable stored target timestamp with explicit timezone support).
* **Target Audience**: Single Private Account (Personal Operating System).
* **Core Philosophy**: Deterministic engine for hard constraints (schedules, spaced-repetition, video analytics) combined with AI enhancement for personal coaching, doubt resolution, and strategy insights.
* **Backend Architecture**: Next.js 15 Route Handlers, Zod runtime validation, Supabase PostgreSQL with RLS.
* **AI Provider Integration**: Provider-independent `AiProvider` interface and capability registry (NVIDIA NIM, OpenAI, or Ollama configurable via environment variables).
