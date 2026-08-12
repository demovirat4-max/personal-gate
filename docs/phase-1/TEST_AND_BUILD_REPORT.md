# Test and Build Execution Report

## 1. Quality Script Commands & Execution Results

| Script Command | Exact CLI Command | Exit Code | Files | Test Cases | Status |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `npm run format:check` | `prettier --check "src/**/*.{ts,tsx}"` | **0** | 36 | 36 | **PASSED** |
| `npm run lint` | `next lint` | **0** | 36 | 36 | **PASSED** |
| `npm run typecheck` | `tsc --noEmit` | **0** | 36 | 36 | **PASSED** |
| `npm run test:unit` | `vitest run src/test/unit` | **0** | 5 | 14 | **PASSED** |
| `npm run test:component` | `vitest run src/test/components` | **0** | 3 | 14 | **PASSED** |
| `npm run test:contract` | `vitest run src/test/contracts` | **0** | 1 | 2 | **PASSED** |
| `npm run test:integration` | `vitest run src/test/integration` | **0** | 1 | 1 | **PASSED** |
| `npm run test:e2e` | `playwright test` | **0** | 1 | 18 (15 passed, 3 skipped) | **PASSED** |
| `npm run build` | `next build` | **0** | 13 | 13 pages | **PASSED** |

---

## 2. Test Inventory Breakdown

### Unit Tests (`npm run test:unit`) - 14 Passed
1. `countdown.test.ts` (2 tests: countdown calculation & clamping).
2. `fixture.test.ts` (2 tests: Zod runtime parsing of Mission fixture).
3. `system.service.test.ts` (1 test: SystemService output schema validation).
4. `api-response-schema.test.ts` (7 tests: envelope validation, missing fields rejection, error normalization).
5. `query-hook.test.ts` (2 tests: loading resolution & error state handling without silent fallback).

### Component Tests (`npm run test:component`) - 14 Passed
1. `countdown.component.test.tsx` (1 test: accessible timer role & target exam text).
2. `placeholder.component.test.tsx` (1 test: PlaceholderView rendering inside `QueryProvider`).
3. `app-shell.component.test.tsx` (12 tests: desktop primary nav landmark, mobile bottom nav, active route `aria-current`, countdown math before/after date, provisional date label, loading/success/error health states, retry button interaction, `EmptyState`, `PartialDataNotice`).

### Contract Tests (`npm run test:contract`) - 2 Passed
1. `health.contract.test.ts` (2 tests: server envelope validation & invalid status rejection).

### Integration Tests (`npm run test:integration`) - 1 Passed
1. `health-route.integration.test.ts` (1 test: Route Handler execution & Zod envelope validation).

### Playwright E2E Tests (`npm run test:e2e`)
* **Unique Test Definitions**: 9 test scenarios.
* **Total Project Executions**: 18 executions (9 scenarios × 2 projects: `chromium` desktop & `mobile-chrome`).
* **Result**: 15 passed, 3 viewport-scoped skips, **0 failed**.

---

## 3. Next.js Production Build Output

Command: `npm run build`

```text
▲ Next.js 15.2.1

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (13/13)
   Finalizing page optimization ...

Route (app)                                 Size  First Load JS
┌ ○ /                                      139 B         101 kB
├ ○ /_not-found                            977 B         102 kB
├ ƒ /api/v1/system/health                  139 B         101 kB
├ ○ /learn                                 803 B         131 kB
├ ○ /mission                             3.08 kB         134 kB
├ ○ /practice                              783 B         131 kB
├ ○ /progress                              766 B         131 kB
├ ○ /revision                              774 B         131 kB
├ ○ /settings                            1.36 kB         132 kB
└ ○ /strategy                              785 B         131 kB
+ First Load JS shared by all             101 kB
```
