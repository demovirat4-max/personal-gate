# Security & Authorization — Phase 2

> **GATE AIR-1 Command Center** · Phase 2  
> SSRF protections, service role key usage, environment variable security, and authorization model.

---

## Overview

Phase 2 introduces two primary security surfaces:

1. **Server-Side URL Fetching (SSRF Attack Surface)** — The Google Sheets import channel fetches a user-supplied URL. Without protections, this could be exploited to make the server send requests to internal services.
2. **Service Role Key** — The Supabase service role key bypasses RLS and can read/write all data. It must never reach the browser.

---

## SSRF Protections

### What Is SSRF?

Server-Side Request Forgery (SSRF) is an attack where a user supplies a URL that causes the server to make a request to an unintended destination — such as cloud metadata services (`169.254.169.254`), internal APIs, or Supabase management endpoints.

### Phase 2 Defense-in-Depth

Five controls are applied in order:

#### Control 1: Hostname Allowlist (Pre-DNS)

```typescript
const ALLOWED_HOSTNAMES = new Set([
  'docs.google.com',
  'drive.google.com',
]);

const url = new URL(sheetsUrl); // throws on malformed URL
if (!ALLOWED_HOSTNAMES.has(url.hostname)) {
  throw new SsrfError(`Hostname not allowed: ${url.hostname}`);
}
```

The allowlist check runs **before** any DNS resolution. This prevents DNS rebinding attacks where `evil.com` resolves to `169.254.169.254`.

#### Control 2: HTTPS-Only Protocol

```typescript
if (url.protocol !== 'https:') {
  throw new SsrfError('Only HTTPS URLs are permitted');
}
```

`http://docs.google.com` is rejected even though the hostname is in the allowlist. This prevents downgrade attacks.

#### Control 3: No Redirect Following

```typescript
const response = await fetch(url.toString(), {
  redirect: 'error', // throws on any redirect (3xx)
  signal: controller.signal,
});
```

A redirect could take the server to a hostname not in the allowlist. By rejecting all redirects at the fetch level, the server only ever contacts the exact hostname validated above.

#### Control 4: 10-Second Timeout

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => {
  controller.abort(new Error('Fetch timed out after 10 seconds'));
}, 10_000);

try {
  const response = await fetch(url.toString(), {
    signal: controller.signal,
    redirect: 'error',
  });
} finally {
  clearTimeout(timeoutId);
}
```

Prevents slow-loris attacks and hung connections.

#### Control 5: 5MB Response Size Cap

```typescript
const MAX_BYTES = 5 * 1024 * 1024;

const contentLength = response.headers.get('content-length');
if (contentLength && parseInt(contentLength, 10) > MAX_BYTES) {
  throw new PayloadTooLargeError('Response content-length exceeds 5MB');
}

const text = await response.text();
if (Buffer.byteLength(text, 'utf-8') > MAX_BYTES) {
  throw new PayloadTooLargeError('Response body exceeds 5MB');
}
```

Prevents memory exhaustion via extremely large responses.

---

## Service Role Key

### What Is the Service Role Key?

The Supabase service role key is a JWT that grants **full database access, bypassing all RLS policies**. It is equivalent to a superuser credential and must be treated as a secret.

### Where It Is Used

The service role key is used exclusively in:

```
src/lib/supabase/server.ts
```

This file creates the `supabaseAdmin` client singleton. It is a **server-only module** — it must never be imported from client components.

### Environment Variable

```bash
# .env.local (never committed to Git)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Prevention: No Browser Exposure

The following safeguards prevent the service role key from reaching the browser:

1. **`'use server'` directive** — All service files and the Supabase server module declare `'use server'`. Next.js statically analyzes imports and tree-shakes server-only code from client bundles.

2. **`server-only` package** — `src/lib/supabase/server.ts` imports the `server-only` package (zero-runtime cost), which causes a build error if it is accidentally imported in a client component:

   ```typescript
   import 'server-only';
   ```

3. **No barrel re-exports** — The `supabaseAdmin` client is never re-exported from any `index.ts` barrel file that might be imported by client code.

4. **Environment variable convention** — `SUPABASE_SERVICE_ROLE_KEY` does **not** use the `NEXT_PUBLIC_` prefix. Variables without this prefix are never embedded in the client bundle by Next.js.

---

## Environment Variables

### Required Variables

| Variable | Used By | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server Supabase clients | Project URL, safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client Supabase client | Anon key, constrained by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | `supabaseAdmin` only | **Never** prefix with `NEXT_PUBLIC_` |

### Variable Validation at Startup

Phase 2 validates required environment variables at module load time in `src/lib/supabase/server.ts`:

```typescript
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
    'Add it to .env.local and never commit it to Git.'
  );
}
```

This fails fast at server startup rather than at request time.

### `.env.local` vs `.env`

| File | Committed to Git? | Purpose |
|------|------------------|---------|
| `.env.local` | ❌ Never | Local secrets (service role key, etc.) |
| `.env.example` | ✅ Yes | Template with placeholder values |
| `.env` | ❌ Avoid | Vercel/production sets env vars via dashboard |

---

## Row Level Security (RLS)

### Policy Model

All 7 Phase 2 tables have RLS enabled. The policy model:

| Table | Public Read | User Write | Service Role Write |
|-------|------------|------------|-------------------|
| `subjects` | ✅ | ❌ | ✅ |
| `topics` | ✅ | ❌ | ✅ |
| `subtopics` | ✅ | ❌ | ✅ |
| `courses` | ✅ | ❌ | ✅ |
| `lectures` | ✅ | ❌ | ✅ |
| `import_batches` | ❌ | ❌ | ✅ |
| `import_row_results` | ❌ | ❌ | ✅ |

"Public Read" means `USING (true)` — any user (anonymous or authenticated) can read these tables. "Service Role Write" means writes require `auth.role() = 'service_role'`.

### Why Import Tables Are Private

`import_batches` and `import_row_results` contain raw import data including potentially sensitive source references (Google Sheet URLs, original filenames). These are restricted to service role access only — the client never reads these tables directly.

---

## Threat Model Summary

| Threat | Mitigation |
|--------|------------|
| SSRF via Sheets URL | Allowlist + HTTPS-only + no redirects + timeout + size cap |
| Service key leak to browser | `server-only` + no `NEXT_PUBLIC_` prefix + `'use server'` |
| Unauthorized commit | Review token required; token is server-generated, not guessable |
| Bulk data injection | Dry-run → review → commit prevents blind commits |
| RLS bypass | All writes via `supabaseAdmin` only, never anon client |
| Replay attacks | Idempotency key + `UNIQUE` constraint prevent replays |
