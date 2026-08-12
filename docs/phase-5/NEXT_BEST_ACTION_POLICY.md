# Next Best Action Policy

> **GATE AIR-1 Command Center** · Contextual Next-Action Recommendation Rules

---

## Action Decision Matrix

The Next Best Action engine evaluates real-time state to recommend the immediate optimal study activity.

| Priority | Condition | Action Recommended | Reason Code |
|----------|-----------|--------------------|-------------|
| 1 (Urgent) | Active session currently in PAUSED/ACTIVE state | Resume or Complete current session | `CONTINUE_ACTIVE_SESSION` |
| 2 (High) | Daily plan has pending high-priority item | Start item #1 from Daily Plan | `EXECUTE_DAILY_PLAN` |
| 3 (High) | Overdue revisions count > 5 | Start Spaced Repetition Revision Sprint | `REVISION_DUE_SURGE` |
| 4 (Medium)| Open mistakes count > 10 | Open Mistake Vault Drill | `MISTAKE_VAULT_DRILL` |
| 5 (Normal)| No pending items, good standing | Advance next syllabus lesson | `CONTINUE_CURRICULUM` |

---

## Output Structure

Returns a single structured directive:
```json
{
  "actionType": "START_REVISION",
  "targetId": "topic-dbms-indexing",
  "reasonCode": "REVISION_DUE_SURGE",
  "estimatedMinutes": 20,
  "confidenceScore": 0.95
}
```

Implemented in [`src/server/services/adaptive.service.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/services/adaptive.service.ts).
