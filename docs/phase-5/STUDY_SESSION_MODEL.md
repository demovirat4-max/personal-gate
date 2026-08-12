# Study Session Model

> **GATE AIR-1 Command Center** · Session Lifecycle & Duration Tracking

---

## Session Lifecycle State Machine

```
       [ START ]
           │
           ▼
     ┌───────────┐
     │  ACTIVE   │◄──────────┐
     └─────┬─────┘           │
           │                 │
    pause  │         resume  │
           ▼                 │
     ┌───────────┐           │
     │  PAUSED   ├───────────┘
     └─────┬─────┘
           │
  complete │ abandon
           ├───┐
           ▼   ▼
     ┌───────────┐  ┌───────────┐
     │ COMPLETED │  │ ABANDONED │
     └───────────┘  └───────────┘
```

---

## Session Business Rules

1. **Single Active Session Guarantee**:
   - A user can have at most **one** `ACTIVE` or `PAUSED` session at any time.
   - Starting a new session while another is active throws `STUDY_SESSION_ALREADY_ACTIVE`.

2. **Idempotent Completion**:
   - Calling `completeSession` on an already completed session is a safe no-op that returns the completed state without altering timestamps.

3. **Active Duration Calculation**:
   $$\text{ActiveSecs} = \max\left(0, \lfloor \text{EndedAt} - \text{StartedAt} \rfloor - \text{PausedDurationSeconds}\right)$$

---

## Supported Session Types

- `LEARN`: Concept study & textbook/video consumption.
- `REVISION`: Spaced repetition flashcards & formula summaries.
- `PRACTICE`: Problem solving on topic question sets.
- `MISTAKE_REVIEW`: Analyzing past incorrect answers in Mistake Vault.
- `MOCK_TEST`: Full-length GATE exam simulation.
