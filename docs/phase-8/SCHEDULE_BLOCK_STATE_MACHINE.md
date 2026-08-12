# Phase 8: Schedule Block State Machine

## Lifecycle States
- `PLANNED`: Scheduled block created by Planning Engine.
- `IN_PROGRESS`: Currently being executed in Phase 5 Daily Plan.
- `COMPLETED`: Successfully finished within target duration.
- `PARTIAL`: Partially completed; remaining scope queued for buffer.
- `MISSED`: Unexecuted block marked as missed.
- `RESCHEDULED`: Shifted to future date during replanning.
- `SKIPPED`: Manually marked as skipped by candidate.
