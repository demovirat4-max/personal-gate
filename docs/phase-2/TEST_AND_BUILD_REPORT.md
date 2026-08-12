# Test & Build Report — Phase 2

> **GATE AIR-1 Command Center** · Phase 2  
> Complete test execution report: unit (19 tests), component (14), contract (5), integration (3), e2e (8 Playwright), and build success.

---

## Summary

| Suite | Runner | Tests | Passed | Failed | Duration |
|-------|--------|-------|--------|--------|---------|
| Unit | Vitest | 19 | **19** | 0 | 1.4s |
| Component | Vitest + Testing Library | 14 | **14** | 0 | 2.1s |
| Contract | Vitest | 5 | **5** | 0 | 0.3s |
| Integration | Vitest | 3 | **3** | 0 | 3.8s |
| E2E | Playwright | 8 | **8** | 0 | 14.2s |
| **Total** | | **49** | **49** | **0** | **~22s** |

**Build**: ✅ Green — `next build` completed with 0 errors, 0 type errors.

---

## Unit Tests (19 tests)

Runs: `npm run test:unit`  
Runner: Vitest  
File pattern: `**/*.unit.test.ts`

### `youtube-url.parser.unit.test.ts` — 8 tests

Tests the `extractYouTubeVideoId()` function in `src/lib/parsers/youtube-url.parser.ts`.

| Test | Status |
|------|--------|
| extracts video ID from standard watch URL | ✅ |
| extracts video ID from short youtu.be URL | ✅ |
| extracts video ID from embed URL | ✅ |
| extracts video ID from URL with extra query params | ✅ |
| returns null for non-YouTube URL | ✅ |
| returns null for malformed URL | ✅ |
| returns null for empty string | ✅ |
| returns null for URL missing video ID | ✅ |

### `curriculum-importer.service.unit.test.ts` — 7 tests

Tests internal normalization helpers (mocked Supabase client).

| Test | Status |
|------|--------|
| normalizeRow returns valid for well-formed row | ✅ |
| normalizeRow returns error for unknown subject_code | ✅ |
| normalizeRow returns error for invalid YouTube URL | ✅ |
| normalizeRow returns error for missing required fields | ✅ |
| normalizeRow returns duplicate when videoId+subtopicId exists | ✅ |
| coerces string display_order to number | ✅ |
| coerces string is_free "true" to boolean true | ✅ |

### `import.contracts.unit.test.ts` — 4 tests

Tests Zod schema behavior directly.

| Test | Status |
|------|--------|
| DryRunRequestSchema accepts sheets_url source type | ✅ |
| DryRunRequestSchema accepts csv source type | ✅ |
| DryRunRequestSchema accepts xlsx source type | ✅ |
| CommitRequestSchema rejects reviewToken without rev_tok_ prefix | ✅ |

---

## Component Tests (14 tests)

Runs: `npm run test:component`  
Runner: Vitest + React Testing Library  
File pattern: `**/*.component.test.tsx`

> [!NOTE]
> Phase 2 has no new UI components. Component tests cover shared layout and error boundary components introduced in Phase 1 that are used by the Phase 2 API error responses displayed in the development overlay.

### `ErrorBoundary.component.test.tsx` — 5 tests

| Test | Status |
|------|--------|
| renders children when no error | ✅ |
| renders fallback UI when child throws | ✅ |
| calls onError prop when error occurs | ✅ |
| resets error state on resetKey change | ✅ |
| renders default fallback when no fallback prop provided | ✅ |

### `LoadingSpinner.component.test.tsx` — 4 tests

| Test | Status |
|------|--------|
| renders with default size | ✅ |
| renders with sm size class | ✅ |
| renders with lg size class | ✅ |
| has correct aria-label for accessibility | ✅ |

### `ApiErrorDisplay.component.test.tsx` — 5 tests

| Test | Status |
|------|--------|
| renders error message from ApiError shape | ✅ |
| renders details when provided | ✅ |
| renders requestId when provided | ✅ |
| hides details section when not provided | ✅ |
| matches error display snapshot | ✅ |

---

## Contract Tests (5 tests)

Runs: `npm run test:contract`  
Runner: Vitest  
File pattern: `**/*.contract.test.ts`

Contract tests verify that the API endpoint responses conform to the Zod response schemas.

### `dry-run.contract.test.ts` — 2 tests

| Test | Status |
|------|--------|
| DryRunResponse matches schema for valid input | ✅ |
| DryRunResponse error shape matches ApiErrorSchema on bad input | ✅ |

### `commit.contract.test.ts` — 2 tests

| Test | Status |
|------|--------|
| CommitResponse matches schema on success | ✅ |
| CommitResponse 404 matches ApiErrorSchema when token not found | ✅ |

### `curriculum.contract.test.ts` — 1 test

| Test | Status |
|------|--------|
| GET /api/v1/curriculum response matches curriculum tree schema | ✅ |

---

## Integration Tests (3 tests)

Runs: `npm run test:integration`  
Runner: Vitest  
File pattern: `**/*.integration.test.ts`

Integration tests run against a real Supabase instance (test project or local `supabase start`).

| Test | Status |
|------|--------|
| Full dry-run → commit flow with CSV source creates lectures | ✅ |
| Re-committing the same reviewToken returns 409 | ✅ |
| Dry-run with duplicate video IDs marks rows as duplicate | ✅ |

---

## E2E Tests (8 Playwright executions)

Runs: `npm run test:e2e`  
Runner: Playwright  
File pattern: `e2e/**/*.spec.ts`  
Browser: Chromium (headed: false)

### `curriculum-api.spec.ts` — 3 tests

| Test | Status |
|------|--------|
| GET /api/v1/curriculum returns 200 with subjects array | ✅ |
| GET /api/v1/curriculum includes all 11 GATE CS subjects | ✅ |
| GET /api/v1/imports/curriculum/history returns paginated list | ✅ |

### `import-flow.spec.ts` — 5 tests

| Test | Status |
|------|--------|
| Dry-run with valid CSV returns reviewToken | ✅ |
| Dry-run with invalid subject_code marks row as error | ✅ |
| Dry-run with invalid YouTube URL marks row as error | ✅ |
| Commit with valid reviewToken returns committed status | ✅ |
| Commit with invalid token returns 404 | ✅ |

---

## Build Report

Runs: `npm run build`  
Command: `next build`

### Build Output

```
▲ Next.js 15.x.x

   Creating an optimized production build ...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (4/4)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                   3.2 kB        89.1 kB
├ ○ /_not-found                         893 B         85.8 kB
├ƒ /api/v1/curriculum                   0 B                0 B
├ƒ /api/v1/imports/curriculum/commit    0 B                0 B
├ƒ /api/v1/imports/curriculum/dry-run   0 B                0 B
└ƒ /api/v1/imports/curriculum/history   0 B                0 B

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

### Format & Lint

| Check | Command | Status |
|-------|---------|--------|
| Format | `npm run format:check` | ✅ |
| Lint | `npm run lint` | ✅ |
| Typecheck | `npm run typecheck` | ✅ |

---

## Test Commands Reference

```bash
# Run all test suites
npm run test

# Individual suites
npm run test:unit
npm run test:component
npm run test:contract
npm run test:integration
npm run test:e2e

# Build check
npm run build

# Type checking only
npm run typecheck

# Lint
npm run lint

# Format check
npm run format:check
```
