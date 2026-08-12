# API Contracts Specification

> **GATE AIR-1 Command Center** · Phase 5 REST API Schema Contracts

---

## Overview

All Phase 5 API endpoints follow standard Zod contract validation located in [`src/contracts/learning/adaptive.contract.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/contracts/learning/adaptive.contract.ts). Response formats adhere to the standard envelope schema.

---

## Endpoints Specification

### 1. `POST /api/learning/adaptive/session/start`
- **Request Body**: `CreateStudySessionInputSchema`
- **Response**: `StudySessionSchema`
- **Errors**: `400 Bad Request` if another session is already active.

### 2. `POST /api/learning/adaptive/session/complete`
- **Request Body**: `{ sessionId: string }`
- **Response**: `StudySessionSchema`
- **Behavior**: Idempotent completion.

### 3. `GET /api/learning/adaptive/daily-plan`
- **Query Params**: `availableMinutes=120`
- **Response**: `DailyPlanSchema`

### 4. `POST /api/learning/adaptive/daily-plan/generate`
- **Request Body**: `{ availableMinutes: number }`
- **Response**: `DailyPlanSchema`

---

## Envelope Response Format

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2026-08-12T00:00:00Z"
  }
}
```
