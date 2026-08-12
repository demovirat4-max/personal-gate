# Observability and Error Handling Specification

## 1. Unified Logging Architecture

Log events are formatted as structured JSON records containing correlation IDs to enable immediate diagnostics:

```json
{
  "timestamp": "2026-08-11T14:52:00.000Z",
  "level": "ERROR",
  "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "route": "/api/v1/curriculum/import",
  "errorCode": "INVALID_CSV_HEADER",
  "message": "Column 'YouTube URL' is missing from uploaded CSV",
  "stack": "..."
}
```

## 2. Server & Client Error Handling Strategy

1. **Route Handler Global Wrapper**: All Next.js route handlers are wrapped in a higher-order function `withErrorHandler()` that catches unhandled exceptions, logs structured JSON errors server-side, and transforms the error into the standardized `ApiResponse` envelope with HTTP 500 status.
2. **React Error Boundaries**: Visual UI boundaries catch rendering crashes and present a recovery component allowing the user to reload the section without losing active background player audio.
