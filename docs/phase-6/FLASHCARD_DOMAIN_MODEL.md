# Flashcard Domain Model

## Entity Hierarchy
1. **Flashcard Decks (`flashcard_decks`)**: Container for cards grouped by Subject, Topic, or custom study focus.
2. **Flashcards (`flashcards`)**: Individual cards containing front/back content.
3. **Flashcard Reviews (`flashcard_reviews`)**: Audit log of review responses and interval progression.

## Card Attributes
- `front`: TEXT (Question / Prompt)
- `back`: TEXT (Answer / Explanation)
- `status`: `'NEW'` | `'LEARNING'` | `'REVIEW'` | `'RELEARNING'` | `'SUSPENDED'`
- `ease_factor`: NUMERIC (Default `2.5`)
- `interval_days`: INTEGER (Current interval in days)
- `consecutive_successes`: INTEGER (Count of non-lapsed reviews)
- `lapse_count`: INTEGER (Total times card was rated `AGAIN`)
- `due_at`: TIMESTAMPTZ (Next scheduled review time)
