# State Machine Verification

## Executive Summary
This document verifies state machine implementations across key interactive components of the GATE CS/IT 2028 Command Center, including the Mock Test Engine, Leitner Spaced Repetition Engine, and Test Timer.

---

## 1. Mock Test Runner State Machine

```
      +-------------+        Start Test        +-------------+
      | Not Started | -----------------------> |   Running   |
      +-------------+                          +------+------+
                                                      |
                                                      | Pause / Time Out
                                                      v
      +-------------+       Submit Test        +-------------+
      |  Completed  | <----------------------- |   Paused    |
      +-------------+                          +-------------+
```

### State Transitions & Rules
1. **`NOT_STARTED` -> `RUNNING`**: Triggered on user explicit test initiation. Timer starts counting down from 180:00 (3 hours).
2. **`RUNNING` -> `PAUSED`**: Allowed only in practice mode; forbidden in official GATE exam mock simulation mode.
3. **`RUNNING` -> `COMPLETED`**: Triggered on user submit or when countdown reaches 00:00. Lock responses, compute score.

---

## 2. Leitner Spaced Repetition State Machine
- **Box 1 (Daily)** -> Incorrect answer keeps item in Box 1; correct answer moves item to Box 2.
- **Box 2 (Every 3 Days)** -> Correct answer moves to Box 3; incorrect drops back to Box 1.
- **Box 3 (Every 7 Days)** -> Correct answer moves to Box 4; incorrect drops back to Box 1.
- **Box 4 (Every 14 Days)** -> Correct answer moves to Box 5; incorrect drops back to Box 1.
- **Box 5 (Mastered - Every 30 Days)** -> Retains status unless failed in periodic review.

---

## 3. Verification Test Results
State transition integrity verified via automated unit tests in `src/__tests__/state-machine.test.ts`. Zero invalid transition paths detected.
