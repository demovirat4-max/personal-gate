# Global AI Brain Architecture & Engine Specification

## Overview

The **Global AI Brain** is the central reasoning engine of the GATE CS/IT 2028 Command Center. It functions as an autonomous, self-correcting study copilot that continuously analyzes student performance telemetry across all 11 GATE CS/IT subjects, evaluates cognitive mastery models, and synthesizes optimal, evidence-backed daily study actions.

---

## Core System Architecture

```
                                +---------------------------+
                                | Phase 3-9 Telemetry Feeds |
                                +---------------------------+
                                              |
                                              v
                                +---------------------------+
                                | Context Adapter Layer     |
                                +---------------------------+
                                              |
                                              v
                                +---------------------------+
                                | Context Snapshot Compiler |
                                +---------------------------+
                                              |
                                              v
                                +---------------------------+
                                | Deterministic Rule Matrix |
                                +---------------------------+
                                              |
                                              v
                                +---------------------------+
                                | Reason Code & Decision    |
                                | Synthesis Engine          |
                                +---------------------------+
                                              |
                                              v
                                +---------------------------+
                                | Command Center UI & API   |
                                +---------------------------+
```

---

## Technical Component Details

### 1. Context Snapshot Compiler
- Compiles real-time metrics into a single point-in-time JSON payload.
- Calculates subject-level mastery: $M_s = \sum_{i \in T_s} w_i \cdot a_i$ where $w_i$ is topic yield weight and $a_i$ is accuracy.
- Evaluates memory retention using SuperMemo SM-2 / Ebbinhaus retention curve: $R = e^{-t / S}$.

### 2. Deterministic Rule Evaluator
- Evaluates rule predicates against the compiled context snapshot.
- Example Rules:
  - **Rule R-01 (Prerequisite Blocker)**: If Topic $B$ mastery $< 50\%$ and Topic $A$ (prerequisite for $B$) mastery $< 70\%$, trigger `RC_WEAK_PREREQ` targeting Topic $A$.
  - **Rule R-02 (High Yield Decay)**: If Topic $C$ yield weight $> 4.0\%$ and memory retention $R_C < 0.60$, trigger `RC_DECAY_ALERT`.
  - **Rule R-03 (Mock Score Plateau)**: If last 3 mock exam percentile variance $< 2.0\%$ and overall score $< 65\%$, trigger `RC_MOCK_PLATEAU`.

### 3. Decision & Recommendation Synthesizer
- Rank-orders generated decisions by Priority Score: $P = (\text{Yield Weight} \times 0.4) + (\text{Weakness Severity} \times 0.4) + (\text{Exam Urgency} \times 0.2)$.
- Generates structured recommendations with actionable payload targets (e.g., target practice quiz, formula review session).
