# Google Sheets CSV Import — Phase 2

> **GATE AIR-1 Command Center** · Phase 2  
> How to use the Google Sheets public CSV export URL import channel, SSRF protections, and format requirements.

---

## Overview

The Google Sheets CSV import channel allows an administrator to maintain a lecture spreadsheet in Google Sheets and import it directly by providing its public CSV export URL. This is the fastest path to bulk-importing lectures because no file download/upload is required.

---

## How It Works

```
Google Sheets (published as CSV)
        │
        │  HTTPS fetch (server-side)
        ▼
curriculum-importer.service.ts
        │
        │  parse CSV text
        ▼
normalizeRows() → DryRunResponse
```

1. The admin publishes their Google Sheet as a CSV export URL.
2. The admin submits `POST /api/v1/imports/curriculum/dry-run` with `sourceType: "sheets_url"` and the URL.
3. The server fetches the CSV text server-side (never from the browser).
4. The CSV is parsed and normalized using the standard import pipeline.

---

## Getting the Public CSV URL from Google Sheets

### Step 1: Set the Sheet to "Anyone with the link can view"

In the Google Sheet:
1. Click **Share** → **Change to anyone with the link**
2. Set permission to **Viewer**
3. Click **Done**

> [!IMPORTANT]
> The sheet must be publicly accessible. Private sheets will return a 403 error. The GATE AIR-1 server does **not** support OAuth for Google Sheets; use public sheets only.

### Step 2: Get the CSV Export URL

The CSV export URL follows this pattern:

```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv&gid={SHEET_GID}
```

To find your `SPREADSHEET_ID` and `GID`:
- Open the sheet in a browser
- The URL looks like: `https://docs.google.com/spreadsheets/d/1BxiM.../edit#gid=0`
- `SPREADSHEET_ID` = the part after `/d/` and before `/edit`
- `GID` = the number after `gid=` (use `0` for the first sheet)

### Step 3: Test the URL

Open the URL in a browser — it should trigger a CSV file download. If you see a Google login page instead, the sheet is not public.

---

## Request Format

```http
POST /api/v1/imports/curriculum/dry-run
Content-Type: application/json

{
  "sourceType": "sheets_url",
  "sheetsUrl": "https://docs.google.com/spreadsheets/d/1BxiMVs.../export?format=csv&gid=0",
  "idempotencyKey": "my-import-2026-08-11-v1"
}
```

---

## Required Sheet Columns

The sheet must have a **header row** (first row) with these column names (case-insensitive, order does not matter):

| Column | Required | Notes |
|--------|----------|-------|
| `subject_code` | ✅ | Must match a GATE CS 2028 subject code |
| `topic` | ✅ | Topic name within the subject |
| `subtopic` | ✅ | Subtopic name within the topic |
| `title` | ✅ | Lecture video title |
| `youtube_url` | ✅ | Full YouTube URL |
| `display_order` | ❌ | Integer; defaults to row index |
| `is_free` | ❌ | `true` or `false`; defaults to `false` |
| `duration_seconds` | ❌ | Positive integer |

### Example Sheet Layout

| subject_code | topic | subtopic | title | youtube_url | is_free |
|---|---|---|---|---|---|
| GATE_CS_DS | Arrays | 1D Arrays | Array Basics | https://youtu.be/abc123 | true |
| GATE_CS_DS | Arrays | 2D Arrays | Matrix Traversal | https://youtu.be/def456 | false |
| GATE_CS_ALGO | Sorting | Bubble Sort | Bubble Sort Explained | https://youtu.be/ghi789 | true |

---

## SSRF Protections

The Google Sheets fetch is performed **server-side**. Without SSRF protection, a malicious user could supply an internal URL (e.g., `http://169.254.169.254/latest/meta-data/`) to exfiltrate cloud metadata. Phase 2 implements five layers of SSRF defense:

### 1. URL Allowlist

Only the following hostnames are accepted:

```typescript
const ALLOWED_HOSTNAMES = new Set([
  'docs.google.com',
  'drive.google.com',
]);
```

Any URL with a hostname not in this set is rejected **before** any DNS resolution or network request.

```typescript
const url = new URL(sheetsUrl); // throws if malformed
if (!ALLOWED_HOSTNAMES.has(url.hostname)) {
  throw new Error(`URL hostname not allowed: ${url.hostname}`);
}
```

### 2. HTTPS-Only Protocol Enforcement

```typescript
if (url.protocol !== 'https:') {
  throw new Error('Only HTTPS URLs are permitted');
}
```

`http://docs.google.com/...` is rejected even though `docs.google.com` is in the allowlist.

### 3. 10-Second Hard Timeout

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10_000);

const response = await fetch(sheetsUrl, {
  signal: controller.signal,
  redirect: 'error',
});
clearTimeout(timeout);
```

If the server does not respond within 10 seconds, the request is aborted and a 504 error is returned.

### 4. 5MB Response Size Cap

```typescript
const FIVE_MB = 5 * 1024 * 1024;
const contentLength = response.headers.get('content-length');
if (contentLength && parseInt(contentLength) > FIVE_MB) {
  throw new Error('Response exceeds 5MB limit');
}

const text = await response.text();
if (Buffer.byteLength(text) > FIVE_MB) {
  throw new Error('Response body exceeds 5MB limit');
}
```

### 5. No Redirect Following

```typescript
fetch(sheetsUrl, { redirect: 'error' })
```

If Google Sheets redirects to a login page (because the sheet is private), the fetch throws immediately rather than following the redirect and potentially leaking the request to a third party.

---

## Error Cases

| Scenario | Error Returned |
|----------|---------------|
| Sheet not public | `400: Failed to fetch sheet — HTTP 403` |
| URL not in allowlist | `400: URL hostname not allowed: <hostname>` |
| HTTP URL supplied | `400: Only HTTPS URLs are permitted` |
| Server timeout | `504: Request timed out after 10 seconds` |
| Response > 5MB | `413: Response body exceeds 5MB limit` |
| Redirect response | `400: Redirect not allowed` |
| Malformed URL | `400: Invalid URL format` |
| No valid rows | `422: No valid rows found in sheet` |

---

## Limitations

| Limitation | Detail |
|-----------|--------|
| Max sheet size | 5MB raw CSV (~50,000–100,000 rows typically) |
| Single sheet | Only the first sheet tab is imported |
| No auth | Only public sheets are supported |
| No formula results | Formulas are evaluated by Google before CSV export; raw values are used |

---

## Security Notes

- The fetch is performed in **Next.js Route Handler** (server-side Node.js), never in a client component.
- The fetched CSV is only passed to the normalizer; it is never stored as a raw file.
- Even if `docs.google.com` were compromised, the 5MB cap and strict CSV parser limit blast radius.
