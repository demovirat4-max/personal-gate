# Algorithm Versioning and Fingerprints

> **GATE AIR-1 Command Center** · Reproducibility & Fingerprint Audit Policy

---

## Strategy Versioning Standard

All adaptive recommendation outputs incorporate a semantic version string (`strategy_version`):

- **v1.0.0**: Baseline Knapsack + SM-2 Spaced Repetition.
- **v1.1.0**: Enhanced Bayesian Weighting with Mistake Vault integration.

---

## Input Fingerprint Generation

To guarantee absolute determinism and enable audit trails, daily plans store an `input_fingerprint` calculated as:

$$\text{Fingerprint} = \text{SHA256}\left(\text{owner\_id} + \text{date} + \text{available\_minutes} + \text{strategy\_version} + \text{state\_hash}\right)$$

```typescript
const inputFingerprint = `fingerprint_${today}_${availableMinutes}`;
```

---

## Reproducibility Verification

Given the exact same input fingerprint and state snapshot, re-running plan generation yields an identical set of ordered daily plan items.
