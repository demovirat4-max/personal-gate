# Data Model & Database Migrations

## Migration Overview
Phase 7 schema is established by migration script `20260812000002_phase7_exam_simulator_schema.sql`.

## Primary Tables & Schema Definitions

### 1. `question_bank_questions`
Stores granular questions across subjects, topics, and lectures. Supports PYQs, author created, and AI draft questions.

### 2. `exam_tests`
Defines fixed or dynamic test instances (Topic Tests, Subject Tests, PYQs, Full Mocks).

### 3. `exam_test_questions`
Junction table linking exam tests to question bank items, snapshotting scoring rules and question definitions per test.

### 4. `exam_attempts`
Tracks candidate test attempt lifecycle, server deadline, elapsed time, total score, and evaluation status.

### 5. `exam_answers`
Stores candidate responses per question within an attempt, including client sequence, server sequence, and evaluation result.
