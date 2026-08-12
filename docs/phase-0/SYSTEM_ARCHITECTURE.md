# System Architecture Specification

## 1. High-Level Technology Stack

| Layer | Technology Selected | Justification |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Latest stable React server/client architecture with built-in route handlers for mobile-ready BFF. |
| **Language** | TypeScript (Strict Mode) | End-to-end type safety enforced at compile and runtime. |
| **Styling** | Tailwind CSS + Vanilla CSS | Modern utility-first styling with custom CSS design tokens matching visual direction. |
| **UI Components**| shadcn/ui + Radix Primitives | Accessible, highly customizable unstyled UI primitives. |
| **Motion** | Framer Motion | High-performance micro-animations for progress bars, cards, and modal transitions. |
| **Database** | Supabase PostgreSQL | Relational integrity, row-level security (RLS), ACID transactions, foreign keys. |
| **Authentication**| Supabase Auth | Built-in JWT handling for single-user authentication; reusable across web and mobile. |
| **API Contract** | Next.js Route Handlers + Zod | Strict BFF pattern with runtime Zod request & response validation. |
| **Video Player** | YouTube IFrame Player API | TOS-compliant embedded video playback with event hook telemetry. |
| **AI Layer** | Provider-Independent Adapter | Abstract `AiProvider` interface (NVIDIA NIM adapter shown as an example implementation, OpenAI/Ollama supported). |
| **Testing** | Vitest + RTL + Playwright | Unit/contract testing (Vitest), component rendering (RTL), and end-to-end (Playwright). |
| **Target Mobile** | Expo / React Native | Future phase will consume identical Route Handlers & Zod contracts. |

## 2. System Boundary Diagram

```mermaid
graph TD
    subgraph Client Tier
        WA[Next.js 15 Web Application]
        MA[Expo / React Native Mobile App - Future]
    end

    subgraph Backend Tier (Next.js App Router BFF)
        RH[Route Handlers /api/v1/*]
        ZC[Zod Runtime Validator]
        AS[Application Services Layer]
        RP[Repository Interfaces]
    end

    subgraph Data & External Services
        SB[(Supabase PostgreSQL + Auth)]
        YT[YouTube IFrame & Data API]
        AI[Provider-Independent AI Client]
        GS[Public CSV / File Upload Reader]
    end

    WA -->|Typed API Client / HTTPS| RH
    MA -->|Typed API Client / HTTPS| RH
    RH --> ZC
    ZC --> AS
    AS --> RP
    RP -->|Postgres / Supabase SDK| SB
    AS -->|Metadata / REST| YT
    AS -->|JSON Prompts / REST| AI
    AS -->|Fetch CSV / Upload| GS
```

## 3. Core Architectural Constraints

1. **Server-Side Data Access**: Browser/Client React components **MUST NOT** directly execute SQL or query Supabase database tables via direct client-side Supabase calls. All database interaction occurs inside server-side services behind Route Handlers.
2. **End-to-End Contract Validation**: Shared Zod schemas strictly govern every input (query params, body) and output (response envelope) between frontend and backend.
3. **Deterministic Core / AI Advisor**: All scheduling time-blocking, spaced repetition intervals, and topic mastery percentages are computed using pure deterministic algorithms. AI is utilized solely to summarize, explain, generate questions, or advise on schedules.
4. **Mobile API Readiness**: All `/api/v1/*` endpoints accept standard HTTP headers (`Authorization: Bearer <JWT>`) and return JSON matching the shared contract so that Expo apps can consume the exact same backend without modification.
5. **Configurable Exam Settings**: Exam date, target branch, and weekly available hours are stored in the database (`system_settings`) with an explicit timezone parameter (`Asia/Kolkata`) rather than hardcoded in source code.
