# Bookmark Security Policy

## Core Policy
Bookmarks allow indexing resources across the application. Security boundaries are strictly enforced to prevent cross-user data leaks and invalid target references.

## Target Validation
Allowed `target_type` values:
- `LESSON`
- `VIDEO_RESOURCE`
- `CONTENT_SOURCE`
- `QUESTION`
- `QUIZ`
- `MISTAKE`
- `REVISION_ITEM`
- `PERSONAL_NOTE`
- `FORMULA`
- `FLASHCARD_DECK`
- `REVISION_SHEET`
- `EXTERNAL_URL`

## Row-Level Security Rules
- Users can only read, create, update, or delete bookmarks where `owner_id = auth.uid()` (or `'user_default'` in single-user mode).
- Foreign Key checks soft-cascade or set NULL on target deletion.
