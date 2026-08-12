# Revision Priority Algorithm

> **GATE AIR-1 Command Center** · Spaced Repetition Scheduling Algorithm

---

## Priority Score Formula

Each candidate revision item is assigned a Priority Score $P \in [0, 100]$:

$$P = w_1 \cdot S_{\text{Due}} + w_2 \cdot (100 - M_{\text{Topic}}) + w_3 \cdot G_{\text{Weight}} + w_4 \cdot M_{\text{Count}}$$

where:
- $S_{\text{Due}}$: Overdue urgency factor $\min(100, \text{DaysOverdue} \times 20)$.
- $M_{\text{Topic}}$: Current topic mastery score.
- $G_{\text{Weight}}$: GATE exam weight score (scaled $0 - 100$).
- $M_{\text{Count}}$: Count of open mistakes for topic.
- Weights: $w_1 = 0.40, w_2 = 0.30, w_3 = 0.20, w_4 = 0.10$.

---

## Next Review Interval Calculation (SM-2 Variant)

$$I_n = I_{n-1} \cdot E_F$$

where Ease Factor $E_F$ updates after every revision attempt:

$$E_F' = \max\left(1.3, E_F + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))\right)$$

with performance quality response $q \in \{0, 1, 2, 3, 4, 5\}$.

---

## Code Reference

Implemented in [`src/server/services/revision.service.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/services/revision.service.ts).
