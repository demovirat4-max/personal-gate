# Tagging and Relationships

## Tagging & Relationship Architecture
1. **Curriculum Hierarchy Links**:
   - Every knowledge asset (Note, Formula, Bookmark, Deck) optionally attaches to `subject_id`, `topic_id`, and `lesson_id`.
2. **Mistake Cross-Linking**:
   - `personal_notes.mistake_id` connects notes directly to logged quiz mistakes for deep review.
3. **Flexible JSONB Tags**:
   - Free-form tags array stored in `provenance.tags` for arbitrary grouping (e.g., `["GATE2024", "HighYield", "TrickQuestion"]`).
