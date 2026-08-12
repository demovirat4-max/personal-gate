# CSV & XLSX File Upload Import — Phase 2

> **GATE AIR-1 Command Center** · Phase 2  
> How to use the CSV and XLSX file upload import channels, column requirements, and error handling.

---

## Overview

Phase 2 supports two file-upload import channels:

| Channel | `sourceType` | File Format | Parser |
|---------|-------------|-------------|--------|
| CSV upload | `"csv"` | `.csv` (UTF-8) | Built-in CSV parser |
| XLSX upload | `"xlsx"` | `.xlsx` (Excel) | SheetJS (`xlsx` package) |

Both channels share the same normalization pipeline and produce identical `DryRunResponse` structures. The only difference is the parsing step.

---

## How File Upload Works

Since Next.js App Router Route Handlers do not expose `multipart/form-data` parsing natively, files are transmitted as **base64-encoded strings** in the JSON request body.

```
Browser                       Next.js Route Handler
   │                                  │
   │  POST /dry-run                   │
   │  { sourceType: "csv",            │
   │    csvBase64: "c3ViamVjdF9jb2...",│
   │    filename: "lectures.csv" }    │
   │─────────────────────────────────▶│
   │                                  │  Buffer.from(csvBase64, 'base64')
   │                                  │         ↓
   │                                  │  parseCsv(rawText)
   │                                  │         ↓
   │                                  │  normalizeRows()
   │                                  │         ↓
   │◀─────────────────────────────────│  DryRunResponse
```

### Why Base64?

- Avoids `multipart/form-data` parsing complexity in the Edge Runtime
- Keeps the request body as a simple JSON object, consistent with all other endpoints
- Works identically in all Next.js deployment targets (Node.js, Edge, Vercel)

---

## CSV Upload

### Preparing the File

1. Open your spreadsheet in Google Sheets, Excel, or LibreOffice Calc.
2. Export / Save As **CSV (UTF-8)**.
3. Ensure the first row is the header row with column names matching the required schema.

### Required Columns

The CSV must contain these **header columns** (case-insensitive):

| Column | Required | Notes |
|--------|----------|-------|
| `subject_code` | ✅ | Must match a seeded GATE CS code |
| `topic` | ✅ | Non-empty string |
| `subtopic` | ✅ | Non-empty string |
| `title` | ✅ | Non-empty string |
| `youtube_url` | ✅ | Valid YouTube URL |
| `display_order` | ❌ | Positive integer, defaults to row index |
| `is_free` | ❌ | `true`/`false`, defaults to `false` |
| `duration_seconds` | ❌ | Positive integer |

### CSV Format Rules

| Rule | Detail |
|------|--------|
| Encoding | UTF-8 (BOM optional) |
| Delimiter | Comma (`,`) |
| Quoting | RFC 4180 compliant (double-quoted fields supported) |
| Line endings | LF or CRLF |
| Empty rows | Skipped silently |
| Max size | 5MB |

### Example CSV

```csv
subject_code,topic,subtopic,title,youtube_url,is_free,duration_seconds
GATE_CS_DS,Arrays,1D Arrays,Array Introduction,https://youtu.be/abc123,true,720
GATE_CS_DS,Arrays,2D Arrays,Matrix Traversal,https://youtu.be/def456,false,960
GATE_CS_ALGO,Sorting,Bubble Sort,Bubble Sort Explained,https://youtu.be/ghi789,true,480
```

### CSV Request

```http
POST /api/v1/imports/curriculum/dry-run
Content-Type: application/json

{
  "sourceType": "csv",
  "csvBase64": "c3ViamVjdF9jb2RlLHRvcGljLHN1YnRvcGljLHRpdGxlLHlvdXR1YmVfdXJs...",
  "filename": "lectures_batch_1.csv",
  "idempotencyKey": "csv-upload-2026-08-11-batch1"
}
```

---

## XLSX Upload

### Preparing the File

1. Create or open your spreadsheet in Microsoft Excel or LibreOffice Calc.
2. Ensure the **first sheet** has the header row and data rows.
3. Save as `.xlsx` (Excel Workbook format).

> [!NOTE]
> Only the **first worksheet** is imported. Additional sheets are ignored. If you need to import from multiple sheets, make separate import requests.

### XLSX Format Rules

| Rule | Detail |
|------|--------|
| Format | `.xlsx` (Office Open XML) — `.xls` is NOT supported |
| Sheet | First sheet only |
| Header row | Row 1 must be the header row |
| Max file size | 5MB |
| Formulas | Evaluated values are used (formula text is ignored) |
| Merged cells | Not supported — merged cells produce empty values |

### XLSX Parsing Process

```typescript
import XLSX from 'xlsx';

function parseXlsx(buffer: Buffer): Record<string, string>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const csvText = XLSX.utils.sheet_to_csv(sheet);
  return parseCsv(csvText);
}
```

SheetJS converts the XLSX to CSV internally, then the standard CSV parser handles it. This ensures XLSX and CSV share identical parsing behavior.

### XLSX Request

```http
POST /api/v1/imports/curriculum/dry-run
Content-Type: application/json

{
  "sourceType": "xlsx",
  "xlsxBase64": "UEsDBBQABgAIAAAAIQCi...",
  "filename": "gate_cs_2028_lectures.xlsx",
  "idempotencyKey": "xlsx-upload-2026-08-11"
}
```

---

## Client-Side File → Base64 Conversion

For Phase 3 UI integration, use this pattern to convert a file to base64 in the browser:

```typescript
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is "data:text/csv;base64,..."
      resolve(result.split(',')[1]); // extract base64 portion
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Usage in import form handler:
const base64 = await fileToBase64(selectedFile);
const response = await fetch('/api/v1/imports/curriculum/dry-run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sourceType: file.name.endsWith('.xlsx') ? 'xlsx' : 'csv',
    csvBase64: file.name.endsWith('.csv') ? base64 : undefined,
    xlsxBase64: file.name.endsWith('.xlsx') ? base64 : undefined,
    filename: file.name,
  }),
});
```

---

## Error Handling

### Parse Errors

| Scenario | Error Returned |
|----------|---------------|
| Invalid base64 string | `400: Invalid base64 encoding` |
| File exceeds 5MB | `413: File size exceeds 5MB limit` |
| Empty file | `422: File contains no data rows` |
| Missing header row | `422: No recognizable header row found` |
| `.xls` format (old Excel) | `400: Only .xlsx format is supported; convert the file and retry` |
| Corrupted XLSX | `400: Could not parse XLSX file` |

### Row-Level Errors

Row-level errors are not fatal — they are captured in `NormalizedRowResult` with `status: "error"` and returned in the `DryRunResponse.rows[]` array. Partial imports are supported: valid rows are committed even if some rows have errors.

| Row Error | Example |
|-----------|---------|
| Unknown `subject_code` | `Unknown subject_code: GATE_CS_XYZ` |
| Invalid YouTube URL | `Invalid YouTube URL: not-a-url` |
| Missing required field | `subject_code is required` |
| `display_order` not a number | `Expected number, received string` |

---

## Comparison: CSV vs XLSX vs Sheets URL

| Feature | CSV Upload | XLSX Upload | Sheets URL |
|---------|-----------|-------------|------------|
| No download required | ❌ | ❌ | ✅ |
| Supports formulas | ❌ | ✅ (evaluated) | ✅ (evaluated) |
| Supports multiple sheets | ❌ | ❌ (first only) | ❌ (single GID) |
| Max size | 5MB | 5MB | 5MB response |
| Best for | Exports, automation | Excel users | Live collaborative sheets |
