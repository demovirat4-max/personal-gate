# Reason Codes Taxonomy & Specification

## Purpose

**Reason Codes** represent a standardized catalog of numeric and textual triggers used by the Global AI Brain to justify decisions. They categorize cognitive gaps, timeline risks, test performance patterns, and study habits.

---

## Standard Reason Code Catalog

| Reason Code | Priority Weight | Trigger Condition | Target Action / Recommendation |
|---|---|---|---|
| `RC_WEAK_PREREQ` | 100 (Highest) | Downstream topic attempted while prerequisite mastery is $< 60\%$ | Block downstream topics; schedule 90-min prerequisite remediation |
| `RC_DECAY_ALERT` | 85 | Spaced repetition memory retention estimate $R < 0.60$ for high-yield topic | Trigger immediate flashcard review or 30-min formula practice |
| `RC_HIGH_YIELD_GAP` | 90 | Topic yield weight $> 5.0\%$ of GATE exam, but student accuracy $< 55\%$ | Priority practice quiz (15 PYQs from 2015–2027) |
| `RC_MOCK_PLATEAU` | 75 | Mock test score variance $< 3\%$ across 3 consecutive mocks with score $< 70\%$ | Dynamic strategy recalibration; focus on section speed & accuracy balance |
| `RC_TIME_SKEW` | 70 | Time spent per question in NAT questions is $> 3.5$ minutes (GATE target is $< 2.5$ min) | Speed drill focus session on NAT calculations |
| `RC_MISTAKE_CLUSTER` | 80 | $> 4$ incorrect answers logged in same subtopic within past 48 hours | Mistake log review & teacher video explanation watch |
| `RC_SPRINT_UGL` | 95 | Days until GATE exam $< 60$ and high-yield subject coverage $< 80\%$ | Activate Emergency Sprint Execution Mode |
| `RC_MAINTENANCE_OK` | 30 | All high-yield topics mastery $> 80\%$ and retention $R > 0.85$ | Scheduled full mock exam or advance subject study |

---

## Code Evaluation Engine

```typescript
export function evaluateReasonCodes(snapshot: BrainContextSnapshot): ReasonCodeEvaluation[] {
  const evaluations: ReasonCodeEvaluation[] = [];

  // Check Prerequisite Blockers
  for (const subject of snapshot.subject_states) {
    if (subject.mastery_percentage < 60 && subject.yield_weight > 4.0) {
      evaluations.push({
        code: 'RC_WEAK_PREREQ',
        priority: 100,
        subjectId: subject.subject_id,
        description: `Prerequisite weakness detected in ${subject.subject_name} (Mastery: ${subject.mastery_percentage}%)`,
      });
    }
  }

  return evaluations.sort((a, b) => b.priority - a.priority);
}
```
