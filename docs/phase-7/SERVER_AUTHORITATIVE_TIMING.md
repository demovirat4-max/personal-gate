# Server-Authoritative Timing

## Timing Engine Rules
1. **Server Deadline Standard**: `server_deadline_at = started_at + duration_seconds`.
2. **Anti-Clock Tampering**: Time remaining is computed exclusively on the server as `server_deadline_at - NOW()`. Client local clock alterations do not affect time left.
3. **Grace Period & Auto-Submission**: A 15-second grace window absorbs network latency. Submissions beyond `server_deadline_at + 15s` are marked `EXPIRED` and force-evaluated using currently saved `exam_answers`.
