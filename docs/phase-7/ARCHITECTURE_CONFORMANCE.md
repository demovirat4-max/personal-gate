# Architecture Conformance

## Architectural Principles Alignment
Phase 7 strictly adheres to the core architecture guidelines of the GATE CS/IT 2028 Command Center:

1. **Local-First / Single-User Ownership**:
   - Scope default set to `user_default` or `public` without requiring complex multi-tenant org routing.
   - All evaluation and timing logic executes locally within Next.js API/Server Actions or local Supabase instance.
2. **Type Safety & Schema Integrity**:
   - Database tables defined with standard TypeScript contracts under `@/contracts/exam/exam.contract.ts`.
   - Pure scoring engine (`PureScoringEngine`) operates with 100% type safety and strict schema validation for MCQ/MSQ/NAT payloads.
3. **Immutability & Auditability**:
   - Exam attempts store frozen JSON snapshots of test and question configurations at the moment of start (`test_snapshot`).
   - Answer changes preserve incremental revisions and timestamp sequences.
