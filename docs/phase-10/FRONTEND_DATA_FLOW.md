# Frontend Data Flow Architecture

## Purpose

This document outlines the client-side data lifecycle, state synchronization, and reactive rendering strategies used in the Command Center UI (`/src/app/brain/page.tsx`).

---

## Data Flow Diagram

```
[Server State (Supabase / API)] 
       |
       | (SWR / React Query - 30s Polling / Realtime WebSockets)
       v
[Client Store (React State Context)]
       |
       +---> [Command Input Bar Component]
       +---> [AI Brain Action Cards Stack]
       +---> [Focus Timer Widget]
       +---> [Evidence Chain Inspector Modal]
```

---

## Optimistic Updates & Revalidation

When a student accepts an AI Brain decision (e.g., clicking "Start Practice Quiz"):
1. Client UI immediately updates card state to `ACCEPTED` (0ms lag).
2. Asynchronous `PATCH /api/v1/brain/decisions/[id]` request is dispatched in background.
3. If network fails, UI rolls back card state and displays an error toast.
