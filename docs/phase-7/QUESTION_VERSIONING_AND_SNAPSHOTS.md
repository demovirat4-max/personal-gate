# Question Versioning & Snapshots

## Immutability Architecture
When an exam test is published or started, question updates in the central Question Bank must not alter ongoing or historical attempt evaluations.

### Snapshot Strategy
1. `exam_test_questions` copies the complete `question_snapshot` and `scoring_snapshot` when questions are attached to a test.
2. `exam_attempts` stores a complete `test_snapshot` JSON representation when an attempt is initialized.
3. Subsequent edits to `question_bank_questions` increment the question `revision` column without mutating existing test snapshots.
