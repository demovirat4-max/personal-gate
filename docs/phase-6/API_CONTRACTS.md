# API Contracts Specification

## Endpoints
1. `GET /api/v1/notes` & `POST /api/v1/notes`
   - Contract: `CreatePersonalNoteSchema`, `PersonalNoteSchema`
2. `GET /api/v1/formulas` & `POST /api/v1/formulas`
   - Contract: `CreateFormulaEntrySchema`, `FormulaEntrySchema`
3. `GET /api/v1/bookmarks` & `POST /api/v1/bookmarks`
   - Contract: `CreateBookmarkSchema`, `BookmarkSchema`
4. `GET /api/v1/flashcard-decks` & `POST /api/v1/flashcard-decks`
   - Contract: `CreateFlashcardDeckSchema`, `FlashcardDeckSchema`
5. `POST /api/v1/flashcards/review`
   - Contract: `SubmitFlashcardReviewSchema`, `FlashcardReviewResultSchema`

All schemas defined and validated with Zod in `src/contracts/knowledge/knowledge.contract.ts`.
