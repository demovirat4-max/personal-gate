# Release Checklist & Operational Runbook

## Executive Summary
This document provides the operational runbook and pre-flight verification checklist for deploying the GATE CS/IT 2028 Command Center to production environments.

---

## 1. Pre-Flight Verification Checklist

| Task Category | Verification Item | Sign-off Status |
|---|---|---|
| Database & Schema | Execute production Supabase migrations (`supabase/migrations/`) | COMPLETED |
| Environment Setup | Configure production secret variables (`SUPABASE_SERVICE_ROLE_KEY`, `AI_API_KEY`) | COMPLETED |
| Build Verification | Run zero-warning clean production build (`npm run build`) | COMPLETED |
| Automated Testing | Execute full Vitest & Playwright test suites (`npm run test`, `playwright test`) | COMPLETED |
| Security Scan | Execute secret scan and npm vulnerability check (`npm audit`) | COMPLETED |
| SEO & Accessibility | Audit meta tags, WCAG 2.1 AA compliance, and dark mode styling | COMPLETED |

---

## 2. Operational Rollback Procedure
1. **Database Rollback**: Execute inverse SQL scripts from `supabase/rollbacks/` via Supabase CLI.
2. **Application Rollback**: Instantly revert Vercel production deployment alias to the previous green build commit SHA.
