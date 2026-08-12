# Mastery Algorithm Specification

> **GATE AIR-1 Command Center** · Pure Mastery & Decay Mathematical Engine

---

## Mathematical Formulation

The Topic Mastery Engine computes a dynamic score $M_t \in [0, 100]$ using a combination of Bayesian accuracy update and Ebbinghaus memory decay.

### 1. Base Accuracy Factor ($A$)
$$A = \frac{\sum_{i=1}^{n} w_i \cdot c_i}{\sum_{i=1}^{n} w_i}$$
where $c_i \in \{0, 1\}$ is correctness, and $w_i$ is question weight based on difficulty (1 for Easy, 2 for Medium, 3 for Hard).

### 2. Retention Decay ($R$)
$$R(t) = e^{-\lambda \cdot t}$$
where:
- $t$ is elapsed days since last practice session.
- $\lambda$ is decay constant ($\approx 0.05$ per day).

### 3. Effective Mastery Score ($M$)
$$M_t = \min\left(100, \max\left(0, A \times 100 \times R(t) + \beta \cdot \text{PracticeVolumeBonus}\right)\right)$$

---

## Code Reference

Implemented in pure TypeScript with zero side-effects in [`src/server/ai/pure-mastery.engine.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/ai/pure-mastery.engine.ts). Tested in [`src/test/unit/pure-mastery.unit.test.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/test/unit/pure-mastery.unit.test.ts).
