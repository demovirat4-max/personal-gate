# Review Queue Policy

## Queue Prioritization Rules
When constructing the daily flashcard review queue for a user:
1. **Lapsed / Relearning Cards**: Cards with `status = 'RELEARNING'` due today are placed at the top of the queue.
2. **Overdue Review Cards**: Cards with `status = 'REVIEW'` sorted ascending by `due_at`.
3. **New Cards**: Unseen cards (`status = 'NEW'`) capped at the daily new card target (default 20 cards/day).
4. **Suspended Cards**: Excluded from active review queue unless manually unsuspended by user.
