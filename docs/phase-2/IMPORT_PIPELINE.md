# Import Pipeline — Phase 2

> **GATE AIR-1 Command Center** · Phase 2  
> Full import pipeline flow: parse → normalize → dry-run → review → commit → idempotency.

---

## Pipeline Overview

The import pipeline transforms raw spreadsheet data into structured `Lecture` records in the database. It is divided into two distinct HTTP phases (dry-run and commit) with a stateful review step in between.

```
┌──────────────────────────────────────────────────────────────┐
│                     DRY-RUN PHASE                            │
│                                                              │
│  Client ──POST /dry-run──▶ Route Handler                     │
│                                  │                           │
│                             Zod validate                     │
│                                  │                           │
│                          ┌── Source Router ──┐               │
│                          │                   │               │
│                    Sheets URL           CSV / XLSX            │
│                          │                   │               │
│                       fetch()            parseFile()         │
│                          │                   │               │
│                          └───── raw rows ────┘               │
│                                  │                           │
│                            normalize()                       │
│                         (per-row Zod + lookups)              │
│                                  │                           │
│                     persist NormalizedRowResults              │
│                     create import_batch (pending)            │
│                                  │                           │
│  Client ◀──DryRunResponse────────┘                           │
│         (reviewToken, summary, rows[])                       │
└──────────────────────────────────────────────────────────────┘
                              │
                         Client reviews
                              │
┌──────────────────────────────────────────────────────────────┐
│                     COMMIT PHASE                             │
│                                                              │
│  Client ──POST /commit──▶ Route Handler                      │
│                                  │                           │
│                         verify reviewToken                   │
│                                  │                           │
│                      load NormalizedRowResults               │
│                                  │                           │
│                    for each valid/dup row:                    │
│                      upsert Topic (by name+subject)          │
│                      upsert Subtopic (by name+topic)         │
│                      upsert Lecture (by videoId+subtopic)    │
│                                  │                           │
│                    mark batch as 'committed'                 │
│                                  │                           │
│  Client ◀──CommitResponse────────┘                           │
│         (lecturesCreated, updated, skipped, …)               │
└──────────────────────────────────────────────────────────────┘
```

---

## Step 1: Source Routing

The pipeline's entry point is `POST /api/v1/imports/curriculum/dry-run`. The Route Handler reads `sourceType` from the validated request body and dispatches to the appropriate fetcher:

```typescript
switch (parsed.data.sourceType) {
  case 'sheets_url':
    rawCsv = await fetchGoogleSheetsCsv(parsed.data.sheetsUrl);
    break;
  case 'csv':
    rawCsv = Buffer.from(parsed.data.csvBase64, 'base64').toString('utf-8');
    break;
  case 'xlsx':
    rawCsv = convertXlsxToCsv(Buffer.from(parsed.data.xlsxBase64, 'base64'));
    break;
}
```

---

## Step 2: Parse

The raw source (CSV text or XLSX buffer) is parsed into an array of plain objects using the built-in CSV parser or SheetJS.

### CSV Parsing

```typescript
function parseCsv(raw: string): Record<string, string>[] {
  // 1. Split by newline
  // 2. First row → headers (lowercased, trimmed)
  // 3. Remaining rows → mapped to header keys
  // 4. Empty rows are skipped
  // 5. Returns Record<string, string>[]
}
```

### XLSX Parsing (via SheetJS)

```typescript
function convertXlsxToCsv(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_csv(firstSheet);
}
```

Only the **first sheet** of an XLSX file is processed. Multi-sheet imports require multiple requests.

---

## Step 3: Normalize

Each parsed raw row is run through the `normalizeRow()` function in `curriculum-importer.service.ts`. This function:

1. **Trims** all string values
2. **Validates** the row with `CanonicalImportRowSchema` (Zod)
3. **Looks up** the `subject_id` from `subjects` table using `subject_code`
4. **Parses** the `youtube_url` to extract `youtubeVideoId`
5. **Checks** for duplicates in the `lectures` table
6. Returns a `NormalizedRowResult` with status `valid`, `error`, or `duplicate`

```typescript
async function normalizeRow(
  raw: Record<string, string>,
  rowIndex: number,
  subjectCache: Map<string, Subject>,
  existingVideoIds: Set<string>,
): Promise<NormalizedRowResult> {
  // Phase 1: Zod parse
  const parsed = CanonicalImportRowSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: 'error', rowIndex, rawData: raw,
             errors: parsed.error.errors.map(e => e.message) };
  }

  // Phase 2: Subject lookup
  const subject = subjectCache.get(parsed.data.subject_code);
  if (!subject) {
    return { status: 'error', rowIndex, rawData: parsed.data,
             errors: [`Unknown subject_code: ${parsed.data.subject_code}`] };
  }

  // Phase 3: YouTube URL parse
  const videoId = extractYouTubeVideoId(parsed.data.youtube_url);
  if (!videoId) {
    return { status: 'error', rowIndex, rawData: parsed.data,
             errors: [`Invalid YouTube URL: ${parsed.data.youtube_url}`] };
  }

  // Phase 4: Duplicate check
  if (existingVideoIds.has(videoId)) {
    return { status: 'duplicate', rowIndex, rawData: parsed.data,
             duplicateOf: '...' };
  }

  return { status: 'valid', rowIndex, rawData: parsed.data,
           normalized: { subjectCode: ..., subjectId: ..., ... } };
}
```

### Subject Cache

To avoid N+1 queries, all subjects are loaded once at the start of normalization into a `Map<code, Subject>`. This cache is reused for all rows in the batch.

---

## Step 4: Persist Dry-Run State

After all rows are normalized, the service:

1. **Creates** an `import_batches` row with `status = 'pending'`
2. **Generates** a `review_token` with the pattern `rev_tok_${uuid}`
3. **Bulk inserts** all `NormalizedRowResult` objects into `import_row_results`

```typescript
const batchId = crypto.randomUUID();
const reviewToken = `rev_tok_${crypto.randomUUID()}`;

await supabaseAdmin.from('import_batches').insert({
  id: batchId,
  idempotency_key: idempotencyKey,
  review_token: reviewToken,
  status: 'pending',
  source_type: sourceType,
  total_rows: rows.length,
  valid_rows: rows.filter(r => r.status === 'valid').length,
  error_rows: rows.filter(r => r.status === 'error').length,
});

await supabaseAdmin.from('import_row_results').insert(
  rows.map((r, i) => ({
    batch_id: batchId,
    row_index: r.rowIndex,
    status: r.status,
    raw_data: r.rawData,
    normalized_data: r.status === 'valid' ? r.normalized : null,
    error_messages: r.status === 'error' ? r.errors : null,
  }))
);
```

---

## Step 5: Client Review

The client receives a `DryRunResponse` containing:

- `reviewToken` — must be presented at commit time
- `summary` — counts of valid / error / duplicate rows
- `rows[]` — full per-row breakdown for display in the UI

The client is expected to display this information to the user, who can review errors and decide whether to proceed with the commit.

---

## Step 6: Commit

The client sends `POST /api/v1/imports/curriculum/commit` with the `reviewToken`.

### Commit Transaction

The commit runs as a logical transaction (sequential upserts — Supabase does not expose savepoints at the SDK level):

```typescript
for (const row of validRows) {
  // 1. Upsert topic
  const topic = await upsertTopic(row.normalized.subjectId, row.normalized.topic);

  // 2. Upsert subtopic
  const subtopic = await upsertSubtopic(topic.id, row.normalized.subtopic);

  // 3. Upsert lecture
  await upsertLecture({
    subtopicId: subtopic.id,
    title: row.normalized.title,
    youtubeUrl: row.normalized.youtubeUrl,
    youtubeVideoId: row.normalized.youtubeVideoId,
    displayOrder: row.normalized.displayOrder,
    isFree: row.normalized.isFree,
    durationSeconds: row.normalized.durationSeconds,
    importedFromBatchId: batchId,
  });
}
```

### Upsert Semantics

```sql
-- Topic upsert
INSERT INTO topics (subject_id, name, display_order)
VALUES ($1, $2, 0)
ON CONFLICT (subject_id, name) DO UPDATE SET updated_at = now()
RETURNING *;

-- Lecture upsert
INSERT INTO lectures (subtopic_id, title, youtube_url, youtube_video_id, ...)
VALUES (...)
ON CONFLICT (youtube_video_id, subtopic_id)
DO UPDATE SET title = EXCLUDED.title, display_order = EXCLUDED.display_order, updated_at = now()
RETURNING *;
```

---

## Step 7: Idempotency

See [REIMPORT_AND_IDEMPOTENCY.md](./REIMPORT_AND_IDEMPOTENCY.md) for full idempotency details.

In brief:
- The `idempotency_key` on `import_batches` has a `UNIQUE` constraint.
- If a dry-run is submitted with a key that already exists and the batch is `committed`, the pipeline returns the original `CommitResponse` without re-running.
- If the batch is `pending`, the existing `reviewToken` is returned.

---

## Error Handling

| Error Condition | HTTP Status | Behaviour |
|----------------|-------------|-----------|
| Invalid request body (Zod fail) | 400 | Return field-level errors |
| Unknown `sourceType` | 400 | Return error |
| SSRF violation (non-allowlist URL) | 400 | Return error |
| Fetch timeout (> 10s) | 504 | Return error |
| Response too large (> 5MB) | 413 | Return error |
| No valid rows after normalization | 422 | Return error |
| Invalid `reviewToken` | 404 | Return error |
| Batch already committed | 409 | Return existing CommitResponse |
| Database error | 500 | Return generic error + log |

---

## Service Entry Points

| Function | File | Purpose |
|----------|------|---------|
| `dryRun(req)` | `curriculum-importer.service.ts` | Orchestrates parse → normalize → persist |
| `commit(req)` | `curriculum-importer.service.ts` | Orchestrates verify → upsert → mark committed |
| `getHistory()` | `curriculum-importer.service.ts` | Returns list of past import batches |
| `getCurriculum()` | `curriculum.service.ts` | Returns full subject tree |
