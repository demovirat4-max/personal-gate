# Phase 9: Question Tagging & Evaluation Rules

## Tagging System Framework

Questions are annotated across multiple dimensions to power search, filtering, adaptive testing, and analytics.

### Dimensions
1. **Cognitive Type**: `CONCEPTUAL` | `CALCULATION` | `TRICK` | `FORMULA_BASED` | `MULTI_STEP`
2. **GATE Question Type Specific Rules**:
   - **MCQ**: 1 correct answer. 1-mark (+1, -0.33), 2-mark (+2, -0.66).
   - **MSQ**: 1 to 4 correct options. No negative marking, no partial marking (all correct choices must be selected, no wrong choices selected).
   - **NAT**: Numerical Answer Type. No options. Range evaluation logic (`min_value <= student_answer <= max_value`). No negative marking.
