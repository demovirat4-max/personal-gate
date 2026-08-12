# Security and RLS Specification

## Row-Level Security (RLS) Policy
All Phase 6 tables (`personal_notes`, `formula_entries`, `bookmarks`, `flashcard_decks`, `flashcards`, `flashcard_reviews`, `revision_sheets`) have RLS explicitly enabled:

```sql
ALTER TABLE public.personal_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own personal_notes"
  ON public.personal_notes FOR ALL
  USING (owner_id = auth.uid() OR owner_id = 'user_default');
```

## Security Guarantees
- Single-user default environment (`user_default`) maps smoothly to auth UUIDs when Supabase Auth is enabled.
- Service Role (`supabaseAdmin`) circumvents RLS strictly within trusted server-side API handlers.
