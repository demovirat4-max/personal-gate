# Context Adapters Specification

## Purpose

**Context Adapters** serve as the standard data pipeline bridge between upstream subsystem databases (Phases 3–9) and the Global AI Brain context snapshot compiler. They decouple domain-specific schemas from the Brain's reasoning engine.

---

## Adapter Registry & Interfaces

```
                                  +-----------------------+
                                  | Context Adapter Hub   |
                                  +-----------------------+
                                              |
      +-------------------+-------------------+-------------------+-------------------+
      |                   |                   |                   |                   |
      v                   v                   v                   v                   v
+-----------+       +-----------+       +-----------+       +-----------+       +-----------+
| Learning  |       | IRT       |       | Knowledge |       | Mock Exam |       | Strategy  |
| Adapter   |       | Adapter   |       | Adapter   |       | Adapter   |       | Adapter   |
| (Phase 3) |       | (Phase 5) |       | (Phase 6) |       | (Phase 7) |       | (Phase 8) |
+-----------+       +-----------+       +-----------+       +-----------+       +-----------+
```

---

## Adapter Specifications

### 1. LearningAdapter (`/src/server/brain/adapters/learning.ts`)
- **Source**: `study_sessions`, `lesson_completions`, `flashcard_reviews`
- **Output**: Aggregated topic study hours, completion percentages, spaced repetition decay vectors.

### 2. IRTAdapter (`/src/server/brain/adapters/irt.ts`)
- **Source**: `user_ability_estimates` ($\theta$), `question_item_parameters` ($a, b, c$)
- **Output**: Subject and topic ability estimates ($\theta_{subject}$) and confidence intervals.

### 3. KnowledgeAdapter (`/src/server/brain/adapters/knowledge.ts`)
- **Source**: `topic_prerequisites`, `concept_nodes`
- **Output**: DAG topological orderings and prerequisite blocker lists.

### 4. MockExamAdapter (`/src/server/brain/adapters/mock-exam.ts`)
- **Source**: `exam_attempts`, `exam_section_scores`
- **Output**: Mock test score trends, time management per section, negative marking error frequencies.

### 5. StrategyAdapter (`/src/server/brain/adapters/strategy.ts`)
- **Source**: `preparation_profiles`, `target_milestones`
- **Output**: Days remaining until GATE 2028, target GATE score (e.g., 75+ / 100), weekly hour commitments.
