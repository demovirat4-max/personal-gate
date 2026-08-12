# Multi-Horizon Reviews Architecture

## Overview

The Global AI Brain automates multi-horizon performance analysis across three timeframe intervals: **Daily Debriefs**, **Weekly Progress Analytics**, and **Monthly Strategic Reviews**.

---

## Review Horizon Specifications

```
+-------------------------------------------------------------------------------+
| Multi-Horizon Review Hierarchy                                                |
+-------------------------------------------------------------------------------+
| 1. DAILY DEBRIEF (Automated at 21:00 Daily)                                   |
|    - Questions solved, focus session minutes completed, accuracy delta       |
|    - Memory retention update & tomorrow's priority task lineup                |
+-------------------------------------------------------------------------------+
| 2. WEEKLY PROGRESS ANALYTICS (Automated every Sunday evening)                 |
|    - Target vs actual study hours across 11 CS/IT subjects                    |
|    - Weak topic identification & yield weight coverage trends                 |
|    - AI Brain plan adjustments for upcoming week                              |
+-------------------------------------------------------------------------------+
| 3. MONTHLY STRATEGIC REVIEW (Automated 1st of each month)                     |
|    - Full Mock Exam score trajectory & percentile movement                   |
|    - Long-term GATE rank projection ($\hat{R}_{GATE}$)                         |
|    - Syllabus completion milestone audit & sprint mode adjustments            |
+-------------------------------------------------------------------------------+
```

---

## Data Aggregation & Score Calculations

- **Daily Accuracy Metric**: $A_{daily} = \frac{\text{Correct Questions Solved Today}}{\text{Total Questions Attempted Today}} \times 100$
- **Weekly Yield Coverage**: $C_{weekly} = \sum_{s \in \text{Studied Subjects}} Y_s$ where $Y_s$ is subject GATE weightage.
- **Estimated GATE Rank Projection**: Formulated using IRT $\theta$ scores normalized across historical GATE candidate score distributions.
