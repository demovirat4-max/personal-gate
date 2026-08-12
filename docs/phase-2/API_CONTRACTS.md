# API Contracts — Phase 2

> **GATE AIR-1 Command Center** · Phase 2  
> Full REST API reference for all 4 Phase 2 endpoints.

---

## Base URL

All Phase 2 API endpoints are prefixed with `/api/v1/`.

| Environment | Base URL |
|-------------|---------|
| Development | `http://localhost:3000/api/v1` |
| Production | `https://<your-domain>/api/v1` |

---

## Authentication

Currently, all Phase 2 API endpoints require no user authentication token (admin-only UI in Phase 3 will add session checks). However, write operations (`dry-run`, `commit`) are protected by the `review_token` flow, which prevents unauthenticated bulk writes.

> [!IMPORTANT]
> Phase 3 will add session-based authentication to the import endpoints. Do not expose `/api/v1/imports/curriculum/commit` publicly without authentication.

---

## Standard Response Envelope

All responses use `Content-Type: application/json`.

### Success

HTTP `2xx` with a JSON body specific to the endpoint.

### Error

```json
{
  "error": "Human-readable error message",
  "details": { /* optional Zod validation errors or additional context */ },
  "requestId": "uuid-string"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| 400 | Bad request — validation failed or invalid input |
| 404 | Not found — resource or token not found |
| 409 | Conflict — resource already exists in terminal state |
| 410 | Gone — review token has expired (> 24h) |
| 413 | Payload too large — file or response > 5MB |
| 422 | Unprocessable — input parsed but semantically invalid |
| 500 | Internal server error |
| 504 | Gateway timeout — external fetch timed out |

---

## Endpoint 1: `GET /api/v1/curriculum`

Returns the full curriculum tree (subjects → topics → subtopics → lectures).

### Request

```http
GET /api/v1/curriculum
```

No query parameters or request body.

### Response `200 OK`

```json
{
  "subjects": [
    {
      "id": "uuid",
      "code": "GATE_CS_DS",
      "name": "Data Structures",
      "displayOrder": 1,
      "topics": [
        {
          "id": "uuid",
          "name": "Arrays",
          "displayOrder": 1,
          "subtopics": [
            {
              "id": "uuid",
              "name": "1D Arrays",
              "displayOrder": 1,
              "lectures": [
                {
                  "id": "uuid",
                  "title": "Array Introduction",
                  "youtubeVideoId": "abc12345678",
                  "youtubeUrl": "https://youtu.be/abc12345678",
                  "isFree": true,
                  "durationSeconds": 720,
                  "displayOrder": 1
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### Notes

- Returns all 11 GATE CS 2028 subjects, even if they have no topics/lectures yet.
- Subjects, topics, subtopics, and lectures are all sorted by `display_order` ascending.
- This endpoint is designed to be cached by the Phase 3 UI (SWR, React Query, or `next/cache`).
- Empty arrays (`topics: []`, `subtopics: []`, `lectures: []`) are returned when no data exists.

---

## Endpoint 2: `POST /api/v1/imports/curriculum/dry-run`

Parses, normalizes, and validates import data without writing to curriculum tables. Returns a review token and a per-row preview.

### Request

```http
POST /api/v1/imports/curriculum/dry-run
Content-Type: application/json
```

#### Body (Google Sheets URL)

```json
{
  "sourceType": "sheets_url",
  "sheetsUrl": "https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0",
  "idempotencyKey": "optional-client-supplied-key"
}
```

#### Body (CSV Upload)

```json
{
  "sourceType": "csv",
  "csvBase64": "<base64-encoded-csv-content>",
  "filename": "lectures.csv",
  "idempotencyKey": "optional-client-supplied-key"
}
```

#### Body (XLSX Upload)

```json
{
  "sourceType": "xlsx",
  "xlsxBase64": "<base64-encoded-xlsx-content>",
  "filename": "lectures.xlsx",
  "idempotencyKey": "optional-client-supplied-key"
}
```

### Response `200 OK`

```json
{
  "batchId": "uuid",
  "reviewToken": "rev_tok_f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "idempotencyKey": "key-used-or-generated",
  "summary": {
    "totalRows": 50,
    "validRows": 48,
    "errorRows": 1,
    "duplicateRows": 1
  },
  "rows": [
    {
      "status": "valid",
      "rowIndex": 0,
      "rawData": { "subject_code": "GATE_CS_DS", "..." : "..." },
      "normalized": {
        "subjectCode": "GATE_CS_DS",
        "subjectId": "uuid",
        "topic": "Arrays",
        "subtopic": "1D Arrays",
        "title": "Array Introduction",
        "youtubeUrl": "https://youtu.be/abc12345678",
        "youtubeVideoId": "abc12345678",
        "displayOrder": 0,
        "isFree": true,
        "durationSeconds": null
      }
    },
    {
      "status": "error",
      "rowIndex": 3,
      "rawData": { "subject_code": "GATE_CS_XYZ", "..." : "..." },
      "errors": ["Unknown subject_code: GATE_CS_XYZ"]
    },
    {
      "status": "duplicate",
      "rowIndex": 7,
      "rawData": { "..." : "..." },
      "duplicateOf": "existing-lecture-uuid"
    }
  ],
  "expiresAt": "2026-08-12T14:26:00.000Z"
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `400` | Invalid request body (Zod validation failure) |
| `400` | `sheetsUrl` hostname not in allowlist |
| `400` | `sheetsUrl` is not HTTPS |
| `413` | File or sheet response exceeds 5MB |
| `422` | Parsed file has no data rows |
| `504` | Google Sheets fetch timed out |

---

## Endpoint 3: `POST /api/v1/imports/curriculum/commit`

Commits a previously dry-run batch to the curriculum tables. Requires the review token from the dry-run response.

### Request

```http
POST /api/v1/imports/curriculum/commit
Content-Type: application/json

{
  "reviewToken": "rev_tok_f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "forceUpdate": false
}
```

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `reviewToken` | `string` | ✅ | — |
| `forceUpdate` | `boolean` | ❌ | `false` |

### Response `200 OK`

```json
{
  "batchId": "uuid",
  "status": "committed",
  "committedAt": "2026-08-11T08:46:00.000Z",
  "summary": {
    "lecturesCreated": 48,
    "lecturesUpdated": 0,
    "lecturesSkipped": 1,
    "topicsCreated": 5,
    "subtopicsCreated": 12
  }
}
```

### Response `409 Conflict` (already committed)

```json
{
  "error": "Batch already committed",
  "details": {
    "batchId": "uuid",
    "committedAt": "2026-08-11T08:46:00.000Z"
  }
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `400` | `reviewToken` missing or does not start with `rev_tok_` |
| `404` | `reviewToken` not found in database |
| `409` | Batch already committed |
| `410` | Review token has expired (> 24h) |

---

## Endpoint 4: `GET /api/v1/imports/curriculum/history`

Returns a paginated list of past import batches.

### Request

```http
GET /api/v1/imports/curriculum/history?limit=20&offset=0
```

| Query Param | Type | Default | Description |
|-------------|------|---------|-------------|
| `limit` | `integer` | `20` | Max records to return (max: 100) |
| `offset` | `integer` | `0` | Pagination offset |
| `status` | `string` | — | Filter by `pending`, `committed`, or `failed` |

### Response `200 OK`

```json
{
  "total": 42,
  "limit": 20,
  "offset": 0,
  "batches": [
    {
      "id": "uuid",
      "idempotencyKey": "batch-2026-08-11",
      "status": "committed",
      "sourceType": "csv",
      "sourceRef": "lectures_batch_1.csv",
      "totalRows": 50,
      "validRows": 48,
      "errorRows": 1,
      "committedAt": "2026-08-11T08:46:00.000Z",
      "createdAt": "2026-08-11T08:45:00.000Z"
    }
  ]
}
```

---

## Route Handler File Locations

| Endpoint | File |
|----------|------|
| `GET /api/v1/curriculum` | `src/app/api/v1/curriculum/route.ts` |
| `POST /api/v1/imports/curriculum/dry-run` | `src/app/api/v1/imports/curriculum/dry-run/route.ts` |
| `POST /api/v1/imports/curriculum/commit` | `src/app/api/v1/imports/curriculum/commit/route.ts` |
| `GET /api/v1/imports/curriculum/history` | `src/app/api/v1/imports/curriculum/history/route.ts` |
