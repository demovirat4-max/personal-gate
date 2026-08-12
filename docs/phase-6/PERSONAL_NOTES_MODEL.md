# Personal Notes Model Specification

## Domain Model
The Personal Notes entity supports capture of insights, mistake root causes, and lesson summaries.

## Schema Definition
- `id`: UUID (Primary Key)
- `owner_id`: TEXT (User ownership identifier)
- `subject_id`: UUID (Optional reference to `public.subjects`)
- `topic_id`: UUID (Optional reference to `public.topics`)
- `lesson_id`: UUID (Optional reference to `public.lectures`)
- `mistake_id`: UUID (Optional reference to `public.mistakes`)
- `title`: TEXT (1-255 characters)
- `content`: TEXT (Markdown or plain text content)
- `content_format`: TEXT ('PLAIN_TEXT' | 'MARKDOWN')
- `note_type`: TEXT ('GENERAL' | 'LESSON' | 'CONCEPT' | 'MISTAKE' | 'QUESTION' | 'SUMMARY' | 'REVISION')
- `status`: TEXT ('ACTIVE' | 'ARCHIVED')
- `source_type`: TEXT ('USER_AUTHORED' | 'AI_ASSISTED' | 'LESSON_DERIVED' | 'MISTAKE_DERIVED' | 'QUIZ_DERIVED' | 'REVISION_DERIVED' | 'IMPORTED')
- `provenance`: JSONB (Metadata regarding origin context)
- `is_pinned`: BOOLEAN (Pin status for quick access)
- `revision`: INTEGER (Optimistic concurrency counter)
