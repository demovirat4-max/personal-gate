# Phase-Based Development Plan (Phase 1 to Phase 10)

## Phase 1: Project Foundation & Approved Responsive Visual Shell
* **Goals**: Establish Next.js 15 App Router project structure, Tailwind CSS configuration with design system tokens, shadcn/ui primitives, Framer Motion setup, and responsive navigation shell matching approved visual reference.
* **Scope Included**: Workspace setup, layout shell, sidebar, header, visual theme variables, mock state placeholders.
* **Scope Excluded**: Backend APIs, database connection, real auth.
* **Readiness Gate**: Visual QA approval of visual reference fidelity, mobile responsive test, lint clean.

## Phase 2: Authentication, Settings, Curriculum & Importer Engine
* **Goals**: Implement Supabase Auth, user settings (exam date `2028-02-05T09:30:00+05:30`, timezone `Asia/Kolkata`, initial 1,620 mins/week study availability), database schema migrations for curriculum, and CSV/XLSX/Google Sheets importer (public CSV URLs & manual uploads).
* **Scope Included**: `POST /api/v1/curriculum/import`, `GET/PATCH /api/v1/settings`, dry-run preview UI, YouTube video ID validation & metadata fetching, database tables creation.
* **Readiness Gate**: End-to-end test verifying CSV import populates Supabase database correctly without duplicate rows. Fixture data removed for curriculum views.

## Phase 3: Embedded YouTube Player & Learning Analytics
* **Goals**: Build focus mode learning room with official YouTube IFrame Player API and heartbeat analytics.
* **Scope Included**: `POST /api/v1/analytics/video-events`, interval set deduplication, watch time tracking, session resume logic.
* **Readiness Gate**: Video playback interval accuracy test and session recovery verification on browser refresh. Fixture data removed for player views.

## Phase 4: Deterministic Adaptive Scheduling Engine
* **Goals**: Implement deterministic study planner, time-blocking algorithm (1,620 mins/week default), and priority scoring model (`v1.0-deterministic`).
* **Scope Included**: `GET /api/v1/mission/today`, calendar views, backlog buffer allocation, priority math formulas.
* **Readiness Gate**: Mathematical verification tests for topic priority formulas and backlog recovery rules. Fixture data removed for mission dashboard.

## Phase 5: AI Coach & Lecture Learning Tools
* **Goals**: Integrate provider-independent AI layer with `AiProvider` interface initialized with **ZZLM 5.2 via NVIDIA NIM (`build.nvidia.com`)** and ₹1,000 INR monthly budget ceiling enforcement.
* **Scope Included**: `POST /api/v1/ai/explain-concept`, `POST /api/v1/ai/generate-quiz`, Zod structured outputs, usage warning thresholds (70%, 90%, 100%), budget rejection fallback logic.
* **Readiness Gate**: Automated contract test verifying AI responses match declared Zod output schemas and budget ceiling rejection at 100% cap. Fixture data removed for AI widgets.

## Phase 6: PYQ, Quiz & Controlled Seed Practice Engine
* **Goals**: Build GATE CS PYQ practice simulator for MCQ, MSQ, and NAT questions with interactive virtual keypad, alongside a controlled PYQ seed-import pipeline.
* **Scope Included**: Reviewed PYQ CSV/JSON seed pipeline, metadata tracking (year, session, marks, negative marking, explanations, verification status), NAT range validation, timed test runner, auto-logging to mistake notebook.
* **Scope Excluded**: Unverified or AI-generated questions labeled as official PYQs.
* **Readiness Gate**: 100% precision check on NAT tolerance boundaries and negative marking calculations. Fixture data removed for quiz runner.

## Phase 7: Revision & Personal Knowledge System
* **Goals**: Build active recall card queue, SuperMemo-2 spaced repetition engine, and hybrid formula book.
* **Scope Included**: Flashcards, hybrid formula book (optional reviewed GATE CS seed dataset visibly distinguished from personal formulas), retention risk warnings, mistake notebook revision workflows.
* **Readiness Gate**: Automated unit tests for SM-2 interval expansion and formula seed vs personal tag differentiation. Fixture data removed for card queues.

## Phase 8: Mock Exam Simulator & Readiness Analytics
* **Goals**: Complete full-length 3-hour GATE CS mock exam simulator and transparent score readiness calculation.
* **Scope Included**: Mock exam UI, full syllabus score predictor, speed vs accuracy analytics, weak topic breakdown.
* **Readiness Gate**: Playwright e2e test completing full mock exam flow and generating score report. Fixture data removed for mock calendar.

## Phase 9: AIR-1 Strategy Mode & Advanced Intelligence
* **Goals**: Implement AIR-1 preparation strategy view, long-term timeline, target score breakdown, and AI strategic mentor.
* **Scope Included**: Comprehensive readiness dashboard, strategy drawer, score gap analysis.
* **Readiness Gate**: User review and verification of strategy trajectory calculations.

## Phase 10: Reliability, Performance, Deployment & Mobile Readiness
* **Goals**: Production hardening, performance optimization (Lighthouse 95+), security audit, Vercel deployment setup, and Expo mobile API verification.
* **Scope Included**: Bundle optimization, final security checks, mobile API compatibility check.
* **Readiness Gate**: All Playwright integration tests pass against production build. No fixtures remaining in any production view.
