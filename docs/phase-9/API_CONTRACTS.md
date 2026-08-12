# Phase 9: API Contracts Specification

## REST & Supabase Data Interfaces

### 1. `GET /api/v1/content/questions`
Query questions filtered by subject, topic, year, type, and difficulty.

**Query Parameters:**
- `subject_code`: string (optional)
- `topic_code`: string (optional)
- `gate_year`: integer (optional)
- `question_type`: `MCQ` | `MSQ` | `NAT` (optional)
- `limit`: integer (default: 20)

### 2. `POST /api/v1/content/questions/batch-import`
Admin endpoint to batch ingest structured question JSON payloads.
