# Data Model and Migrations

## Migration Overview
Migration `20260812000001_phase6_knowledge_system_schema.sql` provisions tables, foreign key constraints, indexes, and triggers for Phase 6.

## Primary Entities
1. `personal_notes`: Stores user notes with subject, topic, lesson, and mistake relations.
2. `formula_entries`: Mathematical formulas formatted in LaTeX or plain text with variable definitions.
3. `bookmarks`: Universal bookmark targets across 12 target types.
4. `flashcard_decks`: Collections of flashcards organized by subject/topic.
5. `flashcards`: Individual cards with front/back content, interval states, and SM-2 parameters.
6. `flashcard_reviews`: Execution log of flashcard reviews storing interval changes and algorithm fingerprints.
7. `revision_sheets`: Compiled subject/topic cheat sheets with pinned formulas and notes.
