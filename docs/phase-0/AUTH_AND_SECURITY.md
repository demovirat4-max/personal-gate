# Auth and Security Specification

## 1. Supabase Auth Architecture (Single Private User)

* **Account Constraints**: Built strictly for a single owner account. Public signups are explicitly disabled via Supabase settings and server-side route guards.
* **Authentication Method**: Email/Password authentication using Supabase Auth JWT tokens stored in `httpOnly`, `Secure`, `SameSite=Lax` cookies managed by `@supabase/ssr`.
* **Session Persistence**: JWT session tokens auto-refresh background cookies. Client components receive user state via a lightweight `useAuth()` hook wrapping server session context.

## 2. API Security & Role-Based Middleware

All Next.js Route Handlers (`/src/app/api/v1/*`) are protected by a centralized App Router Middleware (`src/middleware.ts`).

```typescript
// Middleware Execution Flow
1. Intercept incoming HTTP Request to /api/v1/*
2. Extract Bearer Token or Cookie Header
3. Validate session with Supabase Server Auth
4. If Session Invalid: Return 401 Unauthorized Response Envelope immediately (UNAUTHORIZED error code)
5. If Valid: Attach authenticated user context & proceed to Route Handler
```

## 3. Secret & Credential Isolation Rules

1. **Browser Exposure Prevention**:
   * Public variables (prefixed with `NEXT_PUBLIC_`) are limited strictly to Supabase URL and Supabase Anon Key.
   * Private server secrets (`SUPABASE_SERVICE_ROLE_KEY`, `AI_PROVIDER_API_KEY`, `YOUTUBE_DATA_API_KEY`) must **NEVER** be prefixed with `NEXT_PUBLIC_`.
2. **AI Provider Sandbox**: AI API requests are routed strictly through server-side Route Handlers (`/api/v1/ai/*`). The frontend never holds or transmits external AI API keys.
3. **Environment Startup Validation**: The server crashes immediately at boot if any required environment variable is missing or fails Zod parsing (see `ENVIRONMENT_VARIABLE_CONTRACT.md`).
