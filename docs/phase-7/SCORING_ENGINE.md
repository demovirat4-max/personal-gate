# Scoring Engine

## Deterministic GATE Evaluation Logic (`PureScoringEngine`)

### Rule Specification Matrix
1. **MCQ (Single Correct)**:
   - Match: `+marks` (e.g. +1.00 or +2.00)
   - Mismatch: `-negative_marks` (e.g. -0.33 or -0.66)
   - Unanswered: `0.00`
2. **MSQ (Multiple Select)**:
   - Full Exact Set Match: `+marks`
   - Partial or Mismatch: `0.00` (Zero penalty)
   - Unanswered: `0.00`
3. **NAT (Numerical Answer Type)**:
   - Within Range `[min, max]`: `+marks`
   - Outside Range: `0.00` (Zero penalty)
   - Invalid Format: Marked invalid, `0.00`
