# Re-import & Idempotency — Phase 2

> **GATE AIR-1 Command Center** · Phase 2  
> How safe re-import works, the idempotency key, the review token, and duplicate detection.

---

## Overview

The import pipeline is designed to be **safe to re-run**. Whether a request is submitted twice due to a network retry, a browser refresh, or a deliberate re-import, the system behaves correctly and predictably without creating duplicates.

Three mechanisms work together to achieve this:

| Mechanism | Scope | How It Works |
|-----------|-------|-------------|
| **Idempotency Key** | Batch level | Prevents the same dry-run from being processed twice |
| **Review Token** | Commit authorization | Ensures only a reviewed dry-run can be committed |
| **Lecture Upsert** | Row level | Prevents duplicate lectures even without an idempotency key |

---

## Idempotency Key

### What It Is

The `idempotency_key` is a string that the client supplies (or the server generates) to uniquely identify a dry-run request. It is stored in `import_batches.idempotency_key` with a `UNIQUE` constraint.

### Client-Supplied Key

```json
{
  "sourceType": "csv",
  "csvBase64": "...",
  "idempotencyKey": "my-lecture-import-2026-08-11-v2"
}
```

When a client supplies an idempotency key:
- If the key does not exist → proceed normally with the dry-run.
- If the key exists and the batch is **`pending`** → return the existing `DryRunResponse` (including the original `reviewToken`) without re-processing the file.
- If the key exists and the batch is **`committed`** → return a `409 Conflict` with the original `CommitResponse`.

### Auto-Generated Key

If the client does not supply an `idempotencyKey`, the server generates one:

```typescript
const idempotencyKey = requestBody.idempotencyKey ?? `auto_${crypto.randomUUID()}`;
```

Auto-generated keys are effectively unique (UUID-based), so they do not provide cross-request idempotency. For safe retry behavior, clients should always supply a stable, deterministic key.

### Recommended Key Strategy

```
// Deterministic key from file content hash
idempotencyKey = `sha256:${sha256Hex(fileBuffer).slice(0, 16)}-${timestamp}`

// Or from a semantic identifier
idempotencyKey = `batch-2026-08-11-ds-videos-v1`
```

---

## Review Token

### Purpose

The review token is the **authorization credential** for the commit operation. It proves that:
1. A dry-run was successfully completed.
2. The client received and (optionally) reviewed the `DryRunResponse`.
3. The specific batch being committed is the one the client reviewed.

### Format

```
rev_tok_<uuid>
```

Example: `rev_tok_f47ac10b-58cc-4372-a567-0e02b2c3d479`

The `rev_tok_` prefix makes the token type-safe and self-describing. If a client accidentally passes a different UUID (e.g., the batch ID), the prefix check rejects it immediately.

### Generation

```typescript
const reviewToken = `rev_tok_${crypto.randomUUID()}`;
```

### Storage

The review token is stored in `import_batches.review_token` with a `UNIQUE` index. It is never transmitted except in the `DryRunResponse`.

### Usage in Commit

```http
POST /api/v1/imports/curriculum/commit
Content-Type: application/json

{
  "reviewToken": "rev_tok_f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "forceUpdate": false
}
```

The server:
1. Looks up `import_batches` WHERE `review_token = ?`
2. If not found → `404 Not Found`
3. If batch `status = 'committed'` → `409 Conflict` (returns original response)
4. If batch `status = 'pending'` → proceeds with commit
5. Updates batch `status` to `'committed'` and `committed_at` to `now()`

### Token Expiry

Review tokens are **valid for 24 hours** from the time of the dry-run. After 24 hours, attempting to commit returns a `410 Gone` response. The `expiresAt` field in the `DryRunResponse` tells the client when the token expires:

```json
{
  "reviewToken": "rev_tok_...",
  "expiresAt": "2026-08-12T14:26:00.000Z"
}
```

A background job (Phase 4) will clean up expired pending batches. For Phase 2, expired tokens simply return `410`.

---

## Lecture-Level Duplicate Detection

### Unique Constraint

The `lectures` table has a composite unique index:

```sql
CREATE UNIQUE INDEX lectures_video_subtopic_idx
  ON lectures(youtube_video_id, subtopic_id);
```

This prevents the same YouTube video from appearing twice under the same subtopic, regardless of which import batch introduced it.

### Duplicate Detection in Dry-Run

During normalization, the importer loads all existing `youtube_video_id` values from the database at the start of the dry-run:

```typescript
const { data: existingLectures } = await supabaseAdmin
  .from('lectures')
  .select('youtube_video_id, subtopic_id');

const existingSet = new Set(
  existingLectures.map(l => `${l.youtube_video_id}:${l.subtopic_id}`)
);
```

Each row is checked against this set. Rows that match produce a `NormalizedRowResult` with `status: 'duplicate'`.

### Duplicate Row in DryRunResponse

```json
{
  "status": "duplicate",
  "rowIndex": 4,
  "rawData": {
    "subject_code": "GATE_CS_DS",
    "topic": "Arrays",
    "subtopic": "1D Arrays",
    "title": "Array Introduction",
    "youtube_url": "https://youtu.be/abc123"
  },
  "duplicateOf": "b3d2f1a0-..."
}
```

### Handling Duplicates at Commit

| `forceUpdate` | Behavior |
|--------------|---------|
| `false` | Duplicate rows are skipped; lecture record is unchanged |
| `true` | Duplicate rows are upserted; `title`, `display_order`, and `updated_at` are updated |

Even with `forceUpdate: true`, the `youtube_video_id` and `subtopic_id` are never changed — the upsert updates only metadata.

---

## Re-Import Scenarios

### Scenario 1: New Lectures Added to an Existing Sheet

The admin adds 10 new rows to the Google Sheet and re-runs the import.

**Result**: The 10 new rows are `valid`, existing rows are `duplicate`, only the new 10 are created.

### Scenario 2: Lecture Title Corrected

The admin corrects a typo in a lecture title and re-runs the import with `forceUpdate: true`.

**Result**: The row is `duplicate` in the dry-run, but committed with the updated title when `forceUpdate: true`.

### Scenario 3: Network Failure During Commit

The client sends the commit request but the response is lost. The client retries with the same `reviewToken`.

**Result**: The second commit finds the batch is already `committed` and returns `409 Conflict` with the original `CommitResponse` data. No double-write occurs.

### Scenario 4: Dry-Run Submitted Twice

The client accidentally submits the same dry-run request twice (with the same `idempotencyKey`).

**Result**: The second request finds the existing pending batch and returns the original `DryRunResponse` (same `reviewToken`) without re-fetching or re-parsing the source.

---

## Idempotency Flow Diagram

```
POST /dry-run (idempotencyKey = "K")
        │
        ├─ batch with key "K" exists?
        │        │
        │      YES ──→ status == pending?  ──YES──▶ return existing DryRunResponse
        │                    │
        │                    NO (committed) ──────▶ 409 Conflict
        │
        NO → proceed with full dry-run
             create batch with idempotencyKey = "K"
             return new DryRunResponse
```
