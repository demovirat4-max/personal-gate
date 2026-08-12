# State and Recovery Model Specification

## 1. Client vs Server State Partitioning

To ensure the application survives page refreshes, tab closures, and network drops, state is explicitly categorized and persisted:

| State Scope | Storage Mechanism | Recovery Strategy on Refresh |
| :--- | :--- | :--- |
| **User Session / Auth** | Supabase Auth HTTP Cookies | Auto-validated by server middleware on page load. |
| **YouTube Playback Position** | LocalStorage + Server Heartbeat | Resume from `last_position_seconds - 3s`. |
| **Unbatched Video Analytics** | LocalStorage (`Zustand` persist) | Flushed to `/api/v1/analytics/video-events` on next boot. |
| **Active Practice Test / NAT Keypad** | `IndexedDB` / SessionStorage | Restores exact question index, elapsed timer, and selected choices. |
| **Today's Mission Tasks** | Supabase PostgreSQL | Re-fetched from `/api/v1/mission/today` (cached 5 mins). |
| **Spreadsheet Importer Preview** | React Component Memory | Lost on refresh by design (requires re-uploading file). |

## 2. Session Recovery Workflow Diagram

```text
Browser Refresh / Re-open Event
       │
       ▼
App Initialization (src/app/layout.tsx)
       │
       ├── 1. Check LocalStorage for pending unbatched video analytics events
       │      └── If present: Flush payload to /api/v1/analytics/video-events
       │
       ├── 2. Check SessionStorage for active PYQ test state
       │      └── If present: Display "Resume Unfinished Test?" banner
       │
       └── 3. Fetch latest user session & Mission state from Server
              └── Populate React Query Cache
```
