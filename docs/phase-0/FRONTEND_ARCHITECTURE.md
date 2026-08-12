# Frontend Architecture Specification

## 1. Directory Structure (Next.js 15 App Router)

```text
src/
├── app/                        <- Next.js App Router Page Routes & API Handlers
│   ├── (auth)/                 <- Auth route group (login, session)
│   ├── (dashboard)/            <- Protected app pages with visual shell
│   │   ├── mission/            <- Dashboard / Command Center
│   │   ├── learn/              <- Syllabus & Embedded Player
│   │   ├── practice/           <- PYQs, Quizzes & Mistake Notebook
│   │   ├── revision/           <- Spaced Repetition Queue & Flashcards
│   │   ├── progress/           <- Mastery & Readiness Analytics
│   │   ├── strategy/           <- Planner & Importer
│   │   └── settings/           <- User Configuration
│   └── api/v1/                 <- Backend-for-Frontend Route Handlers
├── components/                 <- UI Components
│   ├── ui/                     <- Unstyled primitives (shadcn/ui)
│   ├── common/                 <- Shared components (Header, Sidebar, Countdown)
│   ├── mission/                <- Mission-specific widgets
│   ├── learn/                  <- Player & Syllabus components
│   ├── practice/               <- Quiz runners, NAT keypads, MCQ items
│   └── strategy/               <- Calendar grid, importer dropzone
├── contracts/                  <- Single Source of Truth Zod Schemas
│   ├── common/                 <- Envelope, pagination, env contracts
│   ├── syllabus/               <- Import & lecture schemas
│   ├── analytics/              <- Video events & telemetry schemas
│   ├── scheduler/              <- Mission & timeblock schemas
│   └── ai/                     <- AI chat, quiz generation schemas
├── hooks/                      <- Custom React Query / State Hooks
│   ├── use-mission.ts
│   ├── use-video-player.ts
│   └── use-quiz-runner.ts
├── lib/                        <- Infrastructure & Services
│   ├── api/                    <- Typed API Client
│   ├── supabase/               <- Server-side Supabase client (RSC / Route Handlers)
│   └── ai/                     <- Provider-independent AI client wrapper
└── services/                   <- Core Domain Business Logic (Server Only)
    ├── importer/               <- CSV/XLSX Parser & Normalizer
    ├── analytics/              <- Watched interval aggregator
    ├── scheduler/              <- Deterministic adaptive planner
    └── readiness/              <- Mastery & score calculator
```

## 2. Component Design & Motion Principles

* **Visual Theme Tokens**: Custom CSS variable palette supporting dark mode matching the visual reference (Deep Navy Blue `#0A0F1D`, Cyan Accent `#00F0FF`, Purple Accent `#7000FF`, Surface Elevated `#141C33`).
* **Typography**: Inter / Outfit fonts via `next/font/google`.
* **Framer Motion Guidelines**: Motion must be used purposefully. Allowed uses:
  * Progress bar fills (ease-out 300ms).
  * Active recall card flip animation (3D Y-axis rotate).
  * Dashboard alert badges and tab transitions.
  * Quiz option selection micro-feedback.

## 3. State Management & Data Fetching Strategy

* **Server Components (RSC)**: Fetch initial page shell data server-side via Server Actions or internal service calls.
* **TanStack Query (React Query v5)**: Manages client-side asynchronous state, polling, caching, stale time (5 mins for static syllabus, 0s for active test/session), and optimistic UI updates with automatic rollbacks.
* **Zustand (Local Interactive State)**: Manages transient client-only state such as:
  * YouTube player active time, buffer state, and unbatched events.
  * Active NAT keypad inputs and quiz timer state.
  * Sidebar collapse state.
