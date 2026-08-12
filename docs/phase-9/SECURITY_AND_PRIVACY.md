# Phase 9: Security and Privacy Controls

## Row-Level Security (RLS) & Anti-Scraping

### Supabase RLS Policies
```sql
ALTER TABLE gate_questions ENABLE ROW LEVEL SECURITY;

-- Public Read Policy for verified questions
CREATE POLICY "Public Read Verified Questions" ON gate_questions
    FOR SELECT USING (is_verified = TRUE);

-- Admin Full Access Policy
CREATE POLICY "Admin Full Access Questions" ON gate_questions
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### Protection Controls
- Rate limiting on query endpoints to prevent automated scraping.
- Dynamic watermarking for question images and diagrams.
