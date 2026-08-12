# Answer Persistence & Concurrency

## Real-Time Saving & Optimistic Control
- Candidate answers save automatically upon option select or text input via debounced API requests (`saveAnswer`).
- `exam_answers` updates use `upsert` with constraint `UNIQUE(attempt_id, test_question_id)`.
- `client_sequence` and `server_sequence` track monotonic revisions, preventing out-of-order background saves from overwriting newer local state.
- Offline backup state is stored in `IndexedDB` and flushed to server upon network restoration.
