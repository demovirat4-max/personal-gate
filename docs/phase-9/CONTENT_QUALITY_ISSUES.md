# Phase 9: Content Quality Issues & Error Resolution Engine

## Flagging & Repair System

Phase 9 implements an integrated error tracking and correction workflow for all stored question content.

### Issue Categories
1. **LaTeX Syntax Error**: Unrendered math symbols, missing delimiters.
2. **Ambiguous Stems**: Missing details or conflicting diagrams.
3. **Key Dispute**: Difference between official answer key vs textbook standard solution.
4. **Formatting / Diagram Glitch**: Image scaling or crop errors.

```sql
CREATE TABLE IF NOT EXISTS gate_content_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES gate_questions(id),
    reported_by_user_id UUID,
    issue_category VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED')),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
```
