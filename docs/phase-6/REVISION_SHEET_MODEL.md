# Revision Sheet Model

## Purpose
Revision Sheets aggregate key notes, formulas, high-yield flashcards, and weak topic summaries for quick review prior to mock tests or GATE exam days.

## Data Structure
- `id`: UUID (PK)
- `subject_id`: UUID (FK -> `public.subjects`)
- `topic_id`: UUID (FK -> `public.topics`, optional)
- `title`: TEXT
- `summary`: TEXT
- `sections`: JSONB Array of structured sections:
  - `section_type`: `'FORMULAS'` | `'NOTES'` | `'MISTAKES'` | `'SUMMARY'`
  - `title`: TEXT
  - `item_ids`: Array of UUIDs
- `is_generated`: BOOLEAN (True if auto-assembled by Adaptive Engine)
