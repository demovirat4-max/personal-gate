# Security & Privacy Specification

> **GATE AIR-1 Command Center** · Security Boundaries & Privacy Safeguards

---

## 1. Secrets & Credentials Isolation

- **Server-Only Boundary**: All provider calls reside in server files marked with `import 'server-only'`.
- **Zero Client Exposure**: `ZZLM_API_KEY` is NEVER exposed to client bundles or Next.js public runtime objects (`NEXT_PUBLIC_*`).

---

## 2. PII & Data Minimization

- **Context Isolation**: Prompt payloads contain strictly relevant curriculum lecture notes and mistake text. Personal user identifiers (such as email or raw database credentials) are excluded from AI prompts.
- **Controlled Prompt Injection Boundary**: User prompt inputs are sanitized and injected exclusively inside structured user role blocks in [`NvidiaZzlmProvider.generate`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/ai/nvidia-zzlm.provider.ts#L33).

---

## 3. Database Security & Access Control

- **Service Role Isolation**: AI persistence writes (`ai_requests`, `ai_artifacts`, `ai_usage_ledger`) execute via `supabaseAdmin` service role credentials on backend APIs, enforcing strict server authorization before mutations occur.
