# Final Sprint Planner & Exam Countdown Architecture

## Overview

The **Final Sprint Planner** activates automatically when the countdown clock shows fewer than 60 days remaining until the GATE CS/IT 2028 examination. It transforms the study schedule into an intensive, high-yield revision matrix.

---

## Sprint Phasing Strategy (Last 60 Days)

```
+-------------------------------------------------------------------------------+
| Phase 1: High-Yield Topic Consolidation (Days 60 - 31)                        |
| - Focus on top 70% mark-yield subjects (Data Structures, Algo, OS, DBMS, TOC)|
| - Daily 30-min PYQ drills + formula sheet memorization                        |
+-------------------------------------------------------------------------------+
| Phase 2: Full-Length Mock Exam Intensive (Days 30 - 11)                       |
| - 2 full 3-hour mock exams per week in actual GATE time slots (09:30 or 14:30) |
| - 24-hour detailed error analysis & mistake log review                        |
+-------------------------------------------------------------------------------+
| Phase 3: Final Polishing & Peak Tapering (Days 10 - 0)                        |
| - Zero new topic introduction                                                 |
| - Light daily formula revision, quick mock test review, sleep optimization   |
+-------------------------------------------------------------------------------+
```

---

## Dynamic Time Allocation Formula

$$\text{Daily Topic Time (min)} = T_{total} \times \left( \frac{\text{Yield}_i \times (100 - \text{Mastery}_i)}{\sum_{j} (\text{Yield}_j \times (100 - \text{Mastery}_j))} \right)$$

This ensures study time in the final sprint is strictly concentrated on high-impact weak areas.
