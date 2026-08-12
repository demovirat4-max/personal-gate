# Daily Planning Algorithm

> **GATE AIR-1 Command Center** · Knapsack Allocation & Plan Generation Engine

---

## Bounded Knapsack Formulation

The daily plan generator selects candidate learning tasks to maximize total priority while respecting available study time budget $T_{\text{Available}}$:

$$\max \sum_{i \in S} P_i \quad \text{subject to} \quad \sum_{i \in S} t_i \le T_{\text{Available}}$$

where:
- $P_i$: Priority score of item $i$.
- $t_i$: Estimated duration in minutes.
- $S$: Selected set of daily plan items.

---

## Allocation Order Rules

1. **Top Priority Revisions**: Up to 40% of time allocated to due spaced repetitions.
2. **Mistake Resolution**: Up to 30% allocated to high-yield mistake reviews.
3. **Curriculum Forward Progress**: Remaining time allocated to next chronological curriculum topic lessons.

---

## Deterministic Generation Workflow

```
Fetch Overdue Revisions + Open Mistakes + Next Syllabus Lessons
                       │
                       ▼
            Compute Priority Scores (P_i)
                       │
                       ▼
      Greedy Knapsack Fitting into T_Available
                       │
                       ▼
         Assign Sequence (0, 1, 2, ...)
                       │
                       ▼
       Compute Input Fingerprint & Persist Plan
```

Implemented in [`src/server/services/adaptive.service.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/services/adaptive.service.ts).
