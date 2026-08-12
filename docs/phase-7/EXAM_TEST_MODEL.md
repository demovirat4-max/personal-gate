# Exam Test Model

## Entity Model (`exam_tests`)
Defines the parameters and structure of an exam paper.

- `title`: Test name e.g. "Full Mock Test - 01 (GATE CS 2028 Format)"
- `test_type`: `TOPIC`, `SUBJECT`, `PYQ`, `FULL_MOCK`, `CUSTOM`
- `duration_seconds`: Standard GATE duration (180 minutes / 10800 seconds for full mock).
- `total_questions`: Total questions in test (e.g. 65 questions).
- `total_marks`: Total available marks (e.g. 100.00 marks).
- `source_policy`: `VERIFIED_PYQ_ONLY` vs `ALL_SOURCES`.
- `instructions`: Exam markdown instructions presented prior to test start.
