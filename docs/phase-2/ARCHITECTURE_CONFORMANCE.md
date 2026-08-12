# Architecture Conformance — Phase 2

> **GATE AIR-1 Command Center** · Phase 2  
> How Phase 2 implementation conforms to Phase 0 architecture decisions.

---

## Introduction

Phase 0 produced a set of Architecture Decision Records (ADRs) that govern all subsequent phases. This document traces each Phase 0 decision to its Phase 2 implementation and confirms conformance or notes any approved deviations.

---

## ADR Conformance Table

| ADR | Decision | Phase 2 Conformance |
|-----|----------|---------------------|
| ADR-001 | Use Next.js App Router (Server Components, Route Handlers) | ✅ All 4 API routes use Next.js App Router `route.ts` handlers |
| ADR-002 | Use Supabase as the sole database and auth provider | ✅ All persistence goes through Supabase; no secondary DB |
| ADR-003 | Use TypeScript strictly (`"strict": true`) | ✅ No `any` escapes; all Zod schemas drive type inference |
| ADR-004 | Validate all external input with Zod | ✅ Every request body and external row is parsed through Zod |
| ADR-005 | Never expose service-role key to the browser | ✅ `supabaseAdmin` is only imported in server-only modules |
| ADR-006 | Row Level Security on all tables | ✅ RLS enabled and policies applied to all 7 Phase 2 tables |
| ADR-007 | Use snake_case for DB columns, camelCase for TS | ✅ Enforced via Supabase generated types + service mappers |
| ADR-008 | All API routes under `/api/v1/` namespace | ✅ All 4 routes follow `/api/v1/` prefix |
| ADR-009 | Import operations must be idempotent | ✅ `idempotency_key` unique constraint; commit is a no-op on replay |
| ADR-010 | No direct DB writes from client components | ✅ All mutations go through Route Handlers → service layer |

---

## Architecture Layers

Phase 0 defined a strict **4-layer architecture**. Phase 2 adheres to it fully:

```
┌─────────────────────────────────────────┐
│  Layer 4: Client (Browser)              │
│  React Client Components, fetch()       │
│  ← NO Supabase client, NO service role  │
├─────────────────────────────────────────┤
│  Layer 3: API (Next.js Route Handlers)  │
│  /app/api/v1/**/route.ts                │
│  Zod validation → service call → JSON   │
├─────────────────────────────────────────┤
│  Layer 2: Services (Server-only)        │
│  src/server/services/*.service.ts       │
│  Business logic, supabaseAdmin calls    │
├─────────────────────────────────────────┤
│  Layer 1: Data (Supabase)               │
│  PostgreSQL + RLS + Storage             │
└─────────────────────────────────────────┘
```

### Layer 3 — API Route Handlers

Each Route Handler in Phase 2 follows the same pattern:

```typescript
// Pattern: validate → delegate → respond
export async function POST(req: Request) {
  // 1. Parse & validate input with Zod
  const body = await req.json();
  const parsed = DryRunRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // 2. Delegate to service layer
  const result = await curriculumImporterService.dryRun(parsed.data);

  // 3. Return typed JSON response
  return NextResponse.json(result);
}
```

No business logic lives in Route Handlers — they are thin orchestrators.

### Layer 2 — Services

Services are marked with `'use server'` and import `supabaseAdmin` directly. They are **never re-exported** from any client-accessible barrel file.

```typescript
// src/server/services/curriculum.service.ts
'use server';
import { supabaseAdmin } from '@/lib/supabase/server';
```

---

## Data Flow Conformance

Phase 0 required that all import operations follow a **preview-before-commit** model. Phase 2 implements this as:

```
Client POST /dry-run
    → parse raw input
    → normalize rows
    → validate each row (Zod)
    → persist NormalizedRowResult[] to import_row_results
    → return review_token to client

Client reviews preview

Client POST /commit (with review_token)
    → verify token in import_batches
    → upsert lectures (idempotent)
    → mark batch as committed
    → return commit summary
```

This satisfies the Phase 0 requirement: **no data is written to curriculum tables during dry-run**.

---

## Dependency Constraints

Phase 0 forbade introducing new runtime dependencies without ADR justification. Phase 2 added the following:

| Package | Justification | ADR |
|---------|--------------|-----|
| `xlsx` (SheetJS) | XLSX parsing is not available in the standard library; SheetJS is the industry standard | ADR-011 (Phase 2) |
| `zod` | Already present from Phase 1 | — |
| `uuid` | Already present from Phase 1 | — |

No other new dependencies were added.

---

## Security Conformance

Phase 0 mandated SSRF prevention for any feature that fetches a user-supplied URL. Phase 2's Google Sheets import enforces:

1. **Allowlist**: Only `https://docs.google.com` and `https://drive.google.com` are accepted.
2. **Protocol enforcement**: HTTPS only — `http://` is rejected before resolution.
3. **Timeout**: 10-second hard timeout via `AbortController`.
4. **Size cap**: Response body is capped at 5 MB; excess triggers a `413` error.
5. **No redirect following**: `redirect: 'error'` in fetch options.
6. **No DNS rebinding**: URL is validated *before* the DNS lookup, not after.

All five controls were required by Phase 0's security ADR and are confirmed present in `curriculum-importer.service.ts`.

---

## Deviations from Phase 0

There are **zero unapproved deviations**. All implementation choices align with the Phase 0 blueprints.
