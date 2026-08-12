# Progress Metric Definitions

> **GATE AIR-1 Command Center** · KPI & Analytics Definitions

---

## Core Metrics Index

### 1. Overall Syllabus Progress ($\%$)
$$\text{Progress}_{\text{Syllabus}} = \frac{\text{Completed Lessons}}{\text{Total Curriculum Lessons}} \times 100$$

### 2. Weighted Command Score ($C_{\text{GATE}}$)
$$C_{\text{GATE}} = \sum_{j=1}^{M} W_{\text{Subject}, j} \cdot M_{\text{Subject}, j}$$
where $W_{\text{Subject}, j}$ is the official GATE weight percentage.

### 3. Study Velocity ($V$)
$$V = \frac{\text{Active Study Hours Completed}}{\text{Target Daily Hours}} \times 100$$

### 4. Retention Index ($R_{\text{Global}}$)
Average decay-adjusted retention score across all revised topics over the past 30 days.

---

## Metric Data Sources

- `study_sessions`: Raw active duration and unit completions.
- `topic_mastery`: Instantaneous and historical topic mastery ratings.
- `mistakes`: Error resolution velocity and recurring mistake index.
