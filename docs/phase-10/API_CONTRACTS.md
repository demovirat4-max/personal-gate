# Phase 10 API Contracts & Endpoint Specification

## Overview

Phase 10 provides Next.js REST API routes under `/api/v1/brain` for context compilation, decision query, command parsing, and focus session orchestration.

---

## Endpoint Catalog

### 1. `GET /api/v1/brain/context`
- **Description**: Fetches or compiles the latest Context Snapshot for the authenticated student.
- **Response 200 OK**:
  ```json
  {
    "snapshot_id": "snp_9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "days_remaining": 542,
    "overall_mastery": 74.5,
    "subject_states": [
      { "subject_id": "alg", "subject_name": "Algorithms", "mastery_percentage": 68.0, "yield_weight": 9.5 }
    ]
  }
  ```

### 2. `GET /api/v1/brain/decisions`
- **Description**: Fetches prioritized active AI Brain recommendations.
- **Query Params**: `status=PRESENTED`, `limit=5`

### 3. `POST /api/v1/brain/command`
- **Description**: Submits a natural language or UI action command for evaluation and execution.
- **Request Body**:
  ```json
  {
    "raw_command": "Start 45m Focus Session on DBMS",
    "snapshot_id": "snp_9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d"
  }
  ```
