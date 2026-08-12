# Security & Row Level Security (RLS)

## Security Architecture & Policies

```sql
ALTER TABLE public.question_bank_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on question_bank_questions" ON public.question_bank_questions FOR ALL USING (true);
CREATE POLICY "Allow public all on exam_tests" ON public.exam_tests FOR ALL USING (true);
CREATE POLICY "Allow public all on exam_test_questions" ON public.exam_test_questions FOR ALL USING (true);
CREATE POLICY "Allow public all on exam_attempts" ON public.exam_attempts FOR ALL USING (true);
CREATE POLICY "Allow public all on exam_answers" ON public.exam_answers FOR ALL USING (true);
```

## Security Rules
1. Single-user mode defaults scope to local access.
2. Candidate answers cannot be modified after attempt status shifts to `SUBMITTED` or `EXPIRED`.
3. Question solutions are omitted from client payloads during `IN_PROGRESS` attempt state.
