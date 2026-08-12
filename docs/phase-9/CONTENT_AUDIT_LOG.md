# Phase 9: Content Audit Log & Revision History

## Audit Trail Model

To maintain strict integrity, any modification to a question statement, LaTeX formula, diagram, or answer key is immutably logged.

```sql
CREATE TABLE IF NOT EXISTS gate_content_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES gate_questions(id),
    action VARCHAR(20) CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'VERIFY')),
    changed_by_user_id UUID,
    previous_state JSONB,
    new_state JSONB,
    change_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```
