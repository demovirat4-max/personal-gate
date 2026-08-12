# Content Provenance Policy

## Provenance Tracking
To ensure total auditability of student notes and formula definitions, every entity includes `source_type`, `source_id`, and a `provenance` JSONB payload.

## Allowed Source Types
- `USER_AUTHORED`: Created directly by user in UI.
- `AI_ASSISTED`: Generated or refined with LLM assistance.
- `LESSON_DERIVED`: Auto-extracted from lecture video timestamps.
- `MISTAKE_DERIVED`: Created during quiz mistake review.
- `QUIZ_DERIVED`: Extracted from quiz problem statements.
- `REVISION_DERIVED`: Auto-compiled by revision sheet engine.
- `IMPORTED`: Ingested via external tabular/JSON import scripts.
