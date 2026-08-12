# Import Contract — Phase 2

> **GATE AIR-1 Command Center** · Phase 2  
> Canonical Zod schemas for all import data structures: `CanonicalImportRow`, `NormalizedRowResult`, `DryRunRequest/Response`, `CommitRequest/Response`.

---

## Overview

All import data types are defined as **Zod schemas** in `src/contracts/import.contracts.ts`. TypeScript types are derived from the schemas via `z.infer<>`, ensuring the validation logic and the type system are always in sync.

```typescript
// src/contracts/import.contracts.ts
import { z } from 'zod';
```

---

## `CanonicalImportRow`

The raw, unnormalized row as parsed from a CSV, XLSX, or Google Sheets source. Column names are lowercased and trimmed during parsing, but values are not yet validated.

### Schema

```typescript
export const CanonicalImportRowSchema = z.object({
  subject_code: z.string().trim().min(1, 'subject_code is required'),
  topic: z.string().trim().min(1, 'topic is required'),
  subtopic: z.string().trim().min(1, 'subtopic is required'),
  title: z.string().trim().min(1, 'title is required'),
  youtube_url: z.string().trim().min(1, 'youtube_url is required'),
  display_order: z.coerce.number().int().nonnegative().optional(),
  is_free: z
    .union([z.boolean(), z.string().transform((v) => v.toLowerCase() === 'true')])
    .optional()
    .default(false),
  duration_seconds: z.coerce.number().int().positive().optional(),
});

export type CanonicalImportRow = z.infer<typeof CanonicalImportRowSchema>;
```

### Field Rules

| Field | Rule |
|-------|------|
| `subject_code` | Must be non-empty after trim; existence in `subjects` table validated in normalize phase |
| `topic` | Non-empty after trim; max 255 characters |
| `subtopic` | Non-empty after trim; max 255 characters |
| `title` | Non-empty after trim; max 500 characters |
| `youtube_url` | Non-empty after trim; must be a parseable YouTube URL (validated in normalize phase) |
| `display_order` | Optional; coerced from string to number; must be non-negative integer |
| `is_free` | Optional; accepts boolean or string `"true"`/`"false"`; defaults to `false` |
| `duration_seconds` | Optional; coerced from string; must be positive integer |

---

## `NormalizedRowResult`

The result of running a `CanonicalImportRow` through the normalization and validation pipeline. Each row produces exactly one `NormalizedRowResult`.

### Schema

```typescript
export const NormalizedRowResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('valid'),
    rowIndex: z.number().int().nonnegative(),
    rawData: CanonicalImportRowSchema,
    normalized: z.object({
      subjectCode: z.string(),
      subjectId: z.string().uuid(),
      topic: z.string(),
      subtopic: z.string(),
      title: z.string(),
      youtubeUrl: z.string().url(),
      youtubeVideoId: z.string().length(11),
      displayOrder: z.number().int().nonnegative(),
      isFree: z.boolean(),
      durationSeconds: z.number().int().positive().nullable(),
    }),
  }),
  z.object({
    status: z.literal('error'),
    rowIndex: z.number().int().nonnegative(),
    rawData: z.record(z.unknown()),
    errors: z.array(z.string()).min(1),
  }),
  z.object({
    status: z.literal('duplicate'),
    rowIndex: z.number().int().nonnegative(),
    rawData: CanonicalImportRowSchema,
    duplicateOf: z.string().uuid(), // existing lecture id
  }),
]);

export type NormalizedRowResult = z.infer<typeof NormalizedRowResultSchema>;
```

### Discriminated Union

The three statuses are mutually exclusive:

| Status | Meaning |
|--------|---------|
| `valid` | Row passed all validation; will be committed |
| `error` | Row failed one or more validation rules; will be skipped |
| `duplicate` | Row matches an existing lecture (same `youtube_video_id` + `subtopic`); will be skipped unless `forceUpdate` is set |

---

## `DryRunRequest`

Sent by the client to initiate a dry-run import. The raw data comes from one of the three import channels.

### Schema

```typescript
export const DryRunRequestSchema = z.discriminatedUnion('sourceType', [
  z.object({
    sourceType: z.literal('sheets_url'),
    sheetsUrl: z.string().url(),
    idempotencyKey: z.string().optional(),
  }),
  z.object({
    sourceType: z.literal('csv'),
    csvBase64: z.string().min(1),
    filename: z.string().optional(),
    idempotencyKey: z.string().optional(),
  }),
  z.object({
    sourceType: z.literal('xlsx'),
    xlsxBase64: z.string().min(1),
    filename: z.string().optional(),
    idempotencyKey: z.string().optional(),
  }),
]);

export type DryRunRequest = z.infer<typeof DryRunRequestSchema>;
```

---

## `DryRunResponse`

Returned after a successful dry-run. Contains the review token and a per-row breakdown.

### Schema

```typescript
export const DryRunResponseSchema = z.object({
  batchId: z.string().uuid(),
  reviewToken: z.string().startsWith('rev_tok_'),
  idempotencyKey: z.string(),
  summary: z.object({
    totalRows: z.number().int().nonnegative(),
    validRows: z.number().int().nonnegative(),
    errorRows: z.number().int().nonnegative(),
    duplicateRows: z.number().int().nonnegative(),
  }),
  rows: z.array(NormalizedRowResultSchema),
  expiresAt: z.string().datetime(), // ISO 8601, 24h from dry-run
});

export type DryRunResponse = z.infer<typeof DryRunResponseSchema>;
```

---

## `CommitRequest`

Sent by the client to commit a previously dry-run batch. The `reviewToken` is required and must match the token issued during dry-run.

### Schema

```typescript
export const CommitRequestSchema = z.object({
  reviewToken: z.string().startsWith('rev_tok_').min(1),
  forceUpdate: z.boolean().optional().default(false),
});

export type CommitRequest = z.infer<typeof CommitRequestSchema>;
```

### `forceUpdate` Semantics

| `forceUpdate` | Behaviour on duplicates |
|--------------|------------------------|
| `false` (default) | Duplicate rows are skipped |
| `true` | Duplicate rows are upserted (update `title`, `display_order`, `updated_at`) |

---

## `CommitResponse`

Returned after a successful commit.

### Schema

```typescript
export const CommitResponseSchema = z.object({
  batchId: z.string().uuid(),
  status: z.literal('committed'),
  committedAt: z.string().datetime(),
  summary: z.object({
    lecturesCreated: z.number().int().nonnegative(),
    lecturesUpdated: z.number().int().nonnegative(),
    lecturesSkipped: z.number().int().nonnegative(),
    topicsCreated: z.number().int().nonnegative(),
    subtopicsCreated: z.number().int().nonnegative(),
  }),
});

export type CommitResponse = z.infer<typeof CommitResponseSchema>;
```

---

## Error Response Schema

All endpoints return errors in this standard shape:

```typescript
export const ApiErrorSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
  requestId: z.string().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
```

---

## Contract File Location

All schemas live in a single file:

```
src/
└── contracts/
    └── import.contracts.ts
```

This file has **no server-side imports** — it only imports `zod`. It is safe to import from both server and client contexts (for form validation on the client side, for example).

> [!WARNING]
> Do not import `supabaseAdmin` or any service into this file. It must remain a pure schema/type file usable in any context.
