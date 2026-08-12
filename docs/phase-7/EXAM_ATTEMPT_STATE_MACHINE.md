# Exam Attempt State Machine

## State Diagram & Transitions

```
[NOT_STARTED] -- (startAttempt) --> [IN_PROGRESS]
                                         |
                       +-----------------+-----------------+
                       | (time expires)                    | (submitAttempt)
                       v                                   v
                  [EXPIRED]                           [SUBMITTING]
                       |                                   |
                       +------------> [SUBMITTED] <--------+
```

## State Definitions
- **`NOT_STARTED`**: Initial state before user clicks "Start Test".
- **`IN_PROGRESS`**: Active test state. Timer running on server. Answers accepting saved updates.
- **`SUBMITTING`**: Transient state while scoring engine calculates final results.
- **`SUBMITTED`**: Exam completed by explicit user submission. Answers frozen.
- **`EXPIRED`**: Exam deadline passed on server. System auto-evaluates saved responses.
