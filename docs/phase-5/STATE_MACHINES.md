# State Machines Specification

> **GATE AIR-1 Command Center** · System Entity State Transitions

---

## 1. Study Session State Machine

```mermaid
stateDiagram-v2
    [*] --> ACTIVE : startSession()
    ACTIVE --> PAUSED : pauseSession()
    PAUSED --> ACTIVE : resumeSession()
    ACTIVE --> COMPLETED : completeSession()
    PAUSED --> COMPLETED : completeSession()
    ACTIVE --> ABANDONED : abandonSession()
    PAUSED --> ABANDONED : abandonSession()
    COMPLETED --> [*]
    ABANDONED --> [*]
```

Valid transitions enforced in [`src/server/services/adaptive.service.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/services/adaptive.service.ts).

---

## 2. Daily Plan State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT : generateDailyPlan()
    DRAFT --> CONFIRMED : confirmPlan()
    DRAFT --> SUPERSEDED : regeneratePlan()
    CONFIRMED --> IN_PROGRESS : startItem()
    IN_PROGRESS --> COMPLETED : finishAllItems()
    CONFIRMED --> SUPERSEDED : forceRegenerate()
    COMPLETED --> [*]
    SUPERSEDED --> [*]
```

---

## 3. Mistake Item State Machine

```mermaid
stateDiagram-v2
    [*] --> OPEN : recordMistake()
    OPEN --> UNDER_REVIEW : startReview()
    UNDER_REVIEW --> RESOLVED : verifyCorrectInQuiz()
    UNDER_REVIEW --> OPEN : failVerification()
    RESOLVED --> [*]
```

Enforced in [`src/server/services/mistake.service.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/services/mistake.service.ts).
