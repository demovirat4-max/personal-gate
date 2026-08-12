# Command Processing Pipeline Specification

## Purpose

The **Command Processing Pipeline** handles both natural language text inputs typed into the Command Center prompt bar and structured UI actions (buttons, hotkeys). It parses, validates, safety-checks, and dispatches instructions to underlying engines.

---

## Processing Flow Pipeline

```
  +-----------------------+
  | Natural Text / Intent |  (e.g., "Schedule 2-hour Operating Systems focus session")
  +-----------------------+
              |
              v
  +-----------------------+
  | Lexical & Intent Parser|  (Extracts Intent: SCHEDULE_FOCUS, Topic: OS, Duration: 120m)
  +-----------------------+
              |
              v
  +-----------------------+
  | Policy & Risk Checker |  (Verifies schedule bounds, non-destructive operation)
  +-----------------------+
              |
              v
  +-----------------------+
  | Command Dispatcher    |  (Calls API / Mutates database state)
  +-----------------------+
              |
              v
  +-----------------------+
  | Client UI Feedback    |  (Toast confirmation & updated schedule feed)
  +-----------------------+
```

---

## Standard Recognized Command Intents

| Intent Token | Example User Query | Execution Target | Confirmation Required? |
|---|---|---|---|
| `START_FOCUS` | "Start 45m DBMS focus session" | Focus Session Engine | No |
| `GENERATE_QUIZ` | "Give me 10 PYQs on Paging" | Practice Quiz Router | No |
| `RECALIBRATE_PLAN` | "Recalibrate my plan for 3 hours daily" | Strategy Planner | **Yes** (Destructive to existing schedule) |
| `TOGGLE_MODE` | "Switch to Final Sprint Mode" | Execution Mode Switcher | **Yes** |
| `EXPLAIN_WEAKNESS` | "Why is my TOC score low?" | AI Tutor RAG | No |

---

## API Handler Endpoint

- **Endpoint**: `POST /api/v1/brain/command`
- **Request Body**:
  ```json
  {
    "raw_command": "Start 60m Algorithms focus session",
    "context_snapshot_id": "snp_9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d"
  }
  ```
- **Response**: Returns parsed intent, execution result, and required UI state transitions.
