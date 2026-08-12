# Mastery, Revision, and Exam Readiness Specification

## 1. Transparent Topic Mastery Formula

Topic Mastery $M_i$ is a percentage ($0\% - 100\%$) computed deterministically without black-box metrics:

$$M_i = (\text{pyqAccuracy} \times 0.40) + (\text{lectureCoverage} \times 0.30) + (\text{activeRecallScore} \times 0.20) + (\text{speedFactor} \times 0.10)$$

Where:
* `pyqAccuracy`: Weighted percentage of correct GATE PYQ attempts for topic $i$.
* `lectureCoverage`: Percentage of lecture video duration completed with unique watch coverage $\ge 90\%$.
* `activeRecallScore`: Self-rated recall performance on flashcards ($1 - 5$ scale normalized to $0 - 100\%$).
* `speedFactor`: Ratio of standard GATE time limit (3 mins per question) vs actual time taken.

## 2. SuperMemo-2 Spaced Repetition Algorithm

Revision card queues are scheduled using a modified SuperMemo-2 (SM-2) algorithm:

* **Quality Rating ($q$)**: User selects rating after active recall ($0$: Total Blackout, $3$: Hard, $4$: Good, $5$: Easy).
* **Easiness Factor ($EF$)**: Updated after each review:

$$EF' = EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$$

*(Constraint: $EF \ge 1.3$)*

* **Interval Calculation ($I$)**:
  * $I(1) = 1 \text{ day}$
  * $I(2) = 6 \text{ days}$
  * $I(n) = I(n-1) \times EF$

## 3. Transparent AIR-1 Readiness & Exam Trajectory Model

The overall **GATE Exam Readiness Score** ($0 - 100$) determines the AIR-1 Trajectory status:

$$\text{readinessScore} = (\text{syllabusMastery} \times 0.45) + (\text{pyqAccuracy} \times 0.35) + (\text{mockPercentile} \times 0.15) + (\text{consistencyIndex} \times 0.05)$$

### AIR-1 Trajectory Bands

| Readiness Score | Status Label | Visual Indicator | Guidance |
| :--- | :--- | :--- | :--- |
| **85.0 - 100.0** | `AIR-1 TRAJECTORY` | Glowing Neon Cyan | Outstanding velocity; focus on NAT precision & mock speed. |
| **70.0 - 84.9** | `TOP 100 TRAJECTORY` | Emerald Green | Solid progress; resolve weak topic backlogs. |
| **50.0 - 69.9** | `QUALIFYING TRAJECTORY` | Amber Yellow | Syllabus coverage lagging; increase daily focus hours. |
| **< 50.0** | `ACTION REQUIRED` | Coral Red | High retention risk; execute daily mission recovery blocks. |

*Disclaimer: Scores represent relative empirical preparation velocity and are never presented as guaranteed exam rank predictions.*
