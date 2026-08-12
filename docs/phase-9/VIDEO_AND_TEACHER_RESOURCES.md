# Phase 9: Video & Teacher Reference Resources

## Learning Resource Mapping Architecture

Phase 9 links questions directly to standard GATE reference materials and video lecture timestamps.

### Mapped Standard Textbooks
- **Algorithms**: *Introduction to Algorithms* (Cormen, Leiserson, Rivest, Stein - CLRS)
- **Computer Networks**: *Computer Networking: A Top-Down Approach* (Kurose & Ross)
- **Operating Systems**: *Operating System Concepts* (Silberschatz, Galvin, Gagne)
- **DBMS**: *Database System Concepts* (Silberschatz, Korth, Sudarshan)
- **Theory of Computation**: *Introduction to Automata Theory, Languages, and Computation* (Hopcroft, Motwani, Ullman)
- **COA**: *Computer Organization and Embedded Systems* (Hamacher, Vranesic, Zaky)

```sql
CREATE TABLE IF NOT EXISTS gate_question_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES gate_questions(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) CHECK (resource_type IN ('TEXTBOOK_PAGE', 'VIDEO_TIMESTAMP', 'DOCUMENTATION_LINK')),
    title VARCHAR(200) NOT NULL,
    url_or_citation TEXT NOT NULL,
    timestamp_seconds INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```
