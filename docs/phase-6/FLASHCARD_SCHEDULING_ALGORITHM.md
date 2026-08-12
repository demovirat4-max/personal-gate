# Flashcard Scheduling Algorithm Specification

## Engine Architecture
The scheduling engine is implemented as a pure deterministic class `PureFlashcardSchedulerEngine` in `src/server/ai/pure-flashcard.engine.ts`.

## Ratings & State Transition Rules
- **`AGAIN`**:
  - `nextState` = `'RELEARNING'`
  - `intervalDays` = `1`
  - `consecutiveSuccesses` = `0`
  - `lapseCount` = `lapseCount + 1`
  - `reasonCode` = `'LAPSE_RESET'`
- **`HARD`**:
  - `nextState` = `'REVIEW'`
  - `intervalDays` = `max(1, floor(currentInterval * 1.2))`
  - `consecutiveSuccesses` += `1`
  - `reasonCode` = `'HARD_MODERATE_INCREASE'`
- **`GOOD`**:
  - `nextState` = `'REVIEW'`
  - `intervalDays` = `currentInterval == 0 ? 1 : max(2, floor(currentInterval * 2.0))`
  - `consecutiveSuccesses` += `1`
  - `reasonCode` = `'GOOD_STANDARD_INCREASE'`
- **`EASY`**:
  - `nextState` = `'REVIEW'`
  - `intervalDays` = `currentInterval == 0 ? 3 : max(4, floor(currentInterval * 2.5))`
  - `consecutiveSuccesses` += `1`
  - `reasonCode` = `'EASY_SIGNIFICANT_BOOST'`

## Determinism & Fingerprinting
Each execution computes a deterministic MD5 hash fingerprint of the input state and returns the current engine version (`v1.0.0`).
