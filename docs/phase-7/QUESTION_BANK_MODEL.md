# Question Bank Model

## Question Types & Payload Specifications

### 1. Multiple Choice Questions (MCQ)
- `question_type`: `'MCQ'`
- `options`: List of JSON objects `[{ "key": "A", "text": "..." }, { "key": "B", "text": "..." }]`
- `correct_answer`: Single string matching correct key e.g. `"A"`
- Marking: Standard +1/+2 marks, penalty of -0.33/-0.66 marks.

### 2. Multiple Select Questions (MSQ)
- `question_type`: `'MSQ'`
- `options`: List of JSON objects with keys e.g. `A, B, C, D`.
- `correct_answer`: JSON Array of strings e.g. `["A", "C"]`
- Marking: Full marks awarded ONLY if exact array set matches. Zero partial marks, ZERO negative marking.

### 3. Numerical Answer Type (NAT)
- `question_type`: `'NAT_INTEGER'` or `'NAT_DECIMAL'`
- `options`: Empty array `[]`.
- `correct_answer`: Single numeric value or range object `{"min": 10.5, "max": 11.2}`.
- Marking: Full marks awarded if user numerical input falls within `[min, max]`. ZERO negative marking.
