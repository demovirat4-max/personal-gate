# Phase 9: Phase 3 Learning Boundary Integration

## Interface Contracts

The Phase 9 Question Bank connects to the Phase 3 Learning Engine to power active recall, flashcard generation, and concept reinforcement.

### Data Flow Specifications
1. **Flashcard Generation**: Questions tagged as `CONCEPTUAL` or `FORMULA_BASED` are automatically transformed into Phase 3 Spaced Repetition items.
2. **Prerequisite Check**: If a student fails a question in Phase 3 practice, the system uses the topic prerequisite DAG to recommend foundational revision items.
