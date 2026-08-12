# Knowledge Search Architecture

## Search Strategy
The Personal Knowledge System provides multi-entity full-text and tag-based search:

1. **PostgreSQL Full-Text Search (FTS)**:
   - GIN indexes on `to_tsvector('english', title || ' ' || content)` for `personal_notes`.
   - GIN indexes on `to_tsvector('english', title || ' ' || expression || ' ' || coalesce(description, ''))` for `formula_entries`.
2. **Subject/Topic Hierarchy Scoping**:
   - Filter query results by `subject_id` or `topic_id`.
3. **Unified Client Search Interface**:
   - `searchKnowledge(query, filters)` searches across Notes, Formulas, Bookmarks, and Flashcards simultaneously.
