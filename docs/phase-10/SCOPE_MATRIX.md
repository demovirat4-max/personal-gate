# Phase 10 Scope Matrix

## Executive Scope Definition

The Scope Matrix specifies all functional, non-functional, and integration boundaries for Phase 10 (Global AI Brain & Command Center Architecture).

---

## In-Scope Functionality

| Category | Capability | Description |
|---|---|---|
| **Brain Engine** | Context Snapshot Compilation | Aggregates user mastery, quiz accuracy, IRT ability ($\theta$), spaced repetition state, and exam countdown into a single immutable payload |
| **Brain Engine** | Reason Code Generation | Evaluates 25+ deterministic rules to generate priority-ranked reason codes (`RC_DECAY_ALERT`, `RC_HIGH_YIELD_GAP`, etc.) |
| **Brain Engine** | Decision Synthesis | Constructs recommended actions (e.g., "Review Discrete Math relations", "Take Full-Length Mock #4") with confidence scores |
| **Command Processing** | Natural Language & UI Commands | Parses text inputs, action buttons, and keyboard shortcuts into validated system command objects |
| **Command Processing** | Transactional Confirmation | Requires explicit two-step user confirmation before mutating study schedules or milestone dates |
| **Command Center UI** | Real-Time Dashboard | Interactive central dashboard displaying current focus, brain recommendations, live timer, and multi-horizon reviews |
| **Sprint Planner** | Final 60-Day Sprint Mode | Last-mile revision planner adjusting daily time allocation based on high-yield topic weakness |
| **Focus Engine** | Focus Session Timer | Integrated timer with distraction shielding, custom interval setup, and real-time session telemetry logging |

---

## Out-of-Scope (Explicit Non-Goals)

1. **Third-Party Video Streaming Processing**: Hosting or decoding external video files directly inside the Brain engine.
2. **Automated Payment Processing**: Subscription or billing management logic (handled by external SaaS gateways if needed).
3. **Manual Paper Grading**: Physical handwriting OCR for descriptive tests (GATE is 100% CBT with MCQ/MSQ/NAT).
