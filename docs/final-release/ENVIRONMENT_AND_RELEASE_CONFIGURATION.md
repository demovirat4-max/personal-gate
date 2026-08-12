# Environment and Release Configuration

## Executive Summary
This document outlines environment variable requirements, deployment setup, build pipeline definitions, and production environment settings for the GATE CS/IT 2028 Command Center.

---

## 1. Environment Variables Specification

| Environment Variable | Target Scope | Required | Secret / Public | Description |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | YES | PUBLIC | Supabase Project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | YES | PUBLIC | Supabase Anonymous Client Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Only | YES | SECRET | Supabase Service Role Key (Database Admin) |
| `AI_API_KEY` | Server Only | YES | SECRET | LLM API Secret Key for AI Study Companion |
| `NEXT_PUBLIC_APP_URL` | Client + Server | YES | PUBLIC | Production Domain URL (`https://...`) |

---

## 2. Build & Deployment Configuration
- **Platform Target**: Vercel Serverless / Node.js 20+ Runtime.
- **Build Command**: `npm run build`
- **Output Artifacts**: Optimized Next.js App Router standalone build `.next/`.
