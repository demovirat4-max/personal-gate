# Test Inventory

## Executive Summary
This document provides a comprehensive inventory of all unit tests (Vitest), component tests (React Testing Library), and End-to-End tests (Playwright) across the GATE CS/IT 2028 Command Center test suite.

---

## 1. Test Suite Categories & Inventory

| Test Category | Runner | Test Files | Total Test Cases | Focus Area |
|---|---|---|---|---|
| Unit Tests | Vitest | `src/__tests__/unit/*` | 42 | Leitner Box algorithm, state transition logic, prompt guardrails |
| Component Tests | Vitest + RTL | `src/__tests__/components/*` | 28 | Scientific Calculator UI, Navigation, Syllabus Subject Cards |
| Integration Tests | Vitest | `src/__tests__/integration/*` | 18 | Supabase DAL queries, Zod schema validation, API handlers |
| E2E Tests | Playwright | `e2e/*` | 14 | Full user flow: Login -> Syllabus -> Practice -> Mock Test -> Analytics |

---

## 2. Test Execution Commands
- **Unit & Integration Suite**: `npm run test`
- **E2E Test Suite**: `npx playwright test`
- **Coverage Generation**: `npm run test:coverage`
