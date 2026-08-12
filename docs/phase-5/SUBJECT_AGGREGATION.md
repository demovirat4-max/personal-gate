# Subject Aggregation Specification

> **GATE AIR-1 Command Center** · Topic-to-Subject Mastery & Weighting Model

---

## Aggregation Formula

Subject-level mastery $M_{\text{Subject}}$ is aggregated from child topic masteries $M_{\text{Topic}, i}$ using official GATE CS/IT subject weightings:

$$M_{\text{Subject}} = \frac{\sum_{i=1}^{K} W_i \cdot M_{\text{Topic}, i}}{\sum_{i=1}^{K} W_i}$$

where $W_i$ represents the topic weight parameter defined in syllabus metadata (e.g., Data Structures carries higher weight in GATE CS than minor sub-topics).

---

## GATE CS/IT Subject Weight Matrix

| Subject Name | Exam Weight (%) | Target Mastery Threshold |
|--------------|-----------------|--------------------------|
| Engineering Mathematics | 13% | 85.0% |
| General Aptitude | 15% | 90.0% |
| Data Structures & Algorithms | 15% | 85.0% |
| Computer Networks | 9% | 80.0% |
| Operating Systems | 9% | 80.0% |
| Databases (DBMS) | 8% | 85.0% |
| Theory of Computation | 9% | 80.0% |
| Compiler Design | 6% | 75.0% |
| Digital Logic | 6% | 80.0% |
| Computer Organization (COA) | 10% | 80.0% |

---

## Implementation Details

Calculated in [`src/server/services/progress.service.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/services/progress.service.ts). Aggregated on demand and cached in memory or database views.
