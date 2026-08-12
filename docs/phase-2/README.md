# Phase 2 — Curriculum Foundation & Import Pipeline

> **GATE AIR-1 Command Center** · Phase 2 Documentation Suite  
> Status: **COMPLETE** · Verdict: **READY FOR PHASE 3**

---

## Overview

Phase 2 establishes the **curriculum data layer** and the **lecture import pipeline** for the GATE AIR-1 Command Center. It introduces the full Subject → Topic → Subtopic → Lecture hierarchy, seeds all 11 GATE CS 2028 subjects, and exposes three import channels (Google Sheets CSV URL, CSV upload, XLSX upload) behind a safe dry-run → review → commit workflow.

### Goals

| # | Goal | Status |
|---|------|--------|
| 1 | Define and migrate all 7 curriculum database tables | ✅ |
| 2 | Seed 11 GATE CS 2028 subjects with canonical codes | ✅ |
| 3 | Build the import pipeline (parse → normalize → dry-run → commit) | ✅ |
| 4 | Expose 4 REST API endpoints under `/api/v1/` | ✅ |
| 5 | Harden SSRF protections for Google Sheets URL import | ✅ |
| 6 | Achieve 100% passing tests across all test suites | ✅ |
| 7 | Produce a green production build | ✅ |

---

## Scope

Phase 2 is purely a **backend + API layer** phase. No new UI pages were introduced. The curriculum and import features are consumed via the REST API and will be surfaced in Phase 3 UI work.

### In Scope

- Database schema design, SQL migrations, Row Level Security policies
- Curriculum service (`curriculum.service.ts`)
- Curriculum importer service (`curriculum-importer.service.ts`)
- Three import channel parsers (Sheets URL, CSV, XLSX)
- YouTube URL parser utility
- Zod contract schemas for all request/response bodies
- 4 REST API route handlers
- Full test suite (unit, component, contract, integration, e2e)

### Out of Scope

- Phase 3 UI pages (Dashboard, Import Wizard, Lecture Browser)
- Authentication & session management (Phase 1)
- Analytics and progress tracking (Phase 4+)

---

## Key Technical Facts

| Property | Value |
|----------|-------|
| Supabase Project ID | `lcotzvvckbxhmsasicwr` |
| Supabase Region | `ap-northeast-2` (Seoul) |
| Database tables (Phase 2) | 7 |
| GATE CS 2028 subjects seeded | 11 |
| Import channels | Google Sheets URL, CSV upload, XLSX upload |
| API endpoints | 4 |
| Total tests passing | 49 |

---

## Document Index

| Document | Description |
|----------|-------------|
| [ARCHITECTURE_CONFORMANCE.md](./ARCHITECTURE_CONFORMANCE.md) | How Phase 2 conforms to Phase 0 architecture decisions |
| [DATA_MODEL_AND_MIGRATIONS.md](./DATA_MODEL_AND_MIGRATIONS.md) | All 7 tables, columns, constraints, indexes, and RLS policies |
| [CURRICULUM_MODEL.md](./CURRICULUM_MODEL.md) | Subject → Topic → Subtopic → Lecture hierarchy and seeded data |
| [IMPORT_CONTRACT.md](./IMPORT_CONTRACT.md) | Zod schemas: CanonicalImportRow, NormalizedRowResult, DryRun, Commit |
| [IMPORT_PIPELINE.md](./IMPORT_PIPELINE.md) | Full import pipeline flow end to end |
| [GOOGLE_SHEETS_CSV_IMPORT.md](./GOOGLE_SHEETS_CSV_IMPORT.md) | Google Sheets public CSV URL import, SSRF protections |
| [CSV_AND_XLSX_IMPORT.md](./CSV_AND_XLSX_IMPORT.md) | CSV and XLSX file upload import, column requirements |
| [REIMPORT_AND_IDEMPOTENCY.md](./REIMPORT_AND_IDEMPOTENCY.md) | Safe re-import, idempotency key, review token, duplicate detection |
| [API_CONTRACTS.md](./API_CONTRACTS.md) | Full REST API reference for all 4 Phase 2 endpoints |
| [SECURITY_AND_AUTHORIZATION.md](./SECURITY_AND_AUTHORIZATION.md) | SSRF protections, service role key, environment variable security |
| [SUPABASE_CLIENT.md](./SUPABASE_CLIENT.md) | How `src/lib/supabase/server.ts` works, supabaseAdmin usage |
| [TEST_AND_BUILD_REPORT.md](./TEST_AND_BUILD_REPORT.md) | Complete test execution report and build success record |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | All files created/modified in Phase 2 |
| [PHASE_2_VERIFICATION.md](./PHASE_2_VERIFICATION.md) | Final Phase 2 verification record with verdict |

---

## Directory Structure (Phase 2 additions)

```
src/
├── app/
│   └── api/
│       └── v1/
│           ├── curriculum/
│           │   └── route.ts                     # GET /api/v1/curriculum
│           └── imports/
│               └── curriculum/
│                   ├── dry-run/
│                   │   └── route.ts             # POST /api/v1/imports/curriculum/dry-run
│                   ├── commit/
│                   │   └── route.ts             # POST /api/v1/imports/curriculum/commit
│                   └── history/
│                       └── route.ts             # GET /api/v1/imports/curriculum/history
├── lib/
│   ├── parsers/
│   │   └── youtube-url.parser.ts
│   └── supabase/
│       └── server.ts                            # supabaseAdmin singleton
├── server/
│   └── services/
│       ├── curriculum.service.ts
│       └── curriculum-importer.service.ts
└── contracts/
    └── import.contracts.ts                      # Zod schemas

supabase/
└── migrations/
    ├── 20260811_001_curriculum_foundation.sql
    └── 20260811_002_import_pipeline.sql

docs/
└── phase-2/                                     # ← this directory
```

---

## Relationship to Other Phases

```
Phase 0  →  Architecture decisions, ADRs, tech stack selection
Phase 1  →  Auth, session, user table, Next.js scaffold
Phase 2  →  Curriculum schema, import pipeline, API layer   ← YOU ARE HERE
Phase 3  →  UI: Dashboard, Import Wizard, Lecture Browser
Phase 4+ →  Analytics, progress tracking, AI features
```
