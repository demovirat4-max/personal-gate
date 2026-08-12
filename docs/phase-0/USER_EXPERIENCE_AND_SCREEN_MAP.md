# User Experience and Screen Map Specification

## 1. Information Architecture & Navigation Structure

```text
GATE AIR-1 Command Center Layout
├── Global Sidebar / Header Navigation
│   ├── Mission Control (Dashboard / Home) [/mission]
│   ├── Learn Center [/learn]
│   │   ├── Syllabus Navigator [/learn/syllabus]
│   │   └── Embedded Video Player [/learn/lecture/[id]]
│   ├── Practice & PYQ [/practice]
│   │   ├── Topic Quiz [/practice/quiz/[id]]
│   │   ├── PYQ Practice [/practice/pyq]
│   │   └── Mistake Notebook [/practice/mistakes]
│   ├── Revision Hub [/revision]
│   │   ├── Spaced Queue [/revision/queue]
│   │   ├── Active Recall & Flashcards [/revision/cards]
│   │   └── Formula Book [/revision/formulas]
│   ├── Progress & Analytics [/progress]
│   │   ├── Mastery Heatmap [/progress/mastery]
│   │   └── Mock Test Analytics [/progress/mocks]
│   ├── Strategy & Schedule [/strategy]
│   │   ├── Adaptive Calendar [/strategy/calendar]
│   │   └── Syllabus Importer [/strategy/importer]
│   └── Settings & Profile [/settings]
```

## 2. Screen Catalog & Key UI States

| Route | Primary Screen Purpose | Key Components | Required UI States |
| :--- | :--- | :--- | :--- |
| `/mission` | Command Center Dashboard | Configurable Exam Countdown Widget, Today's Mission Cards, Embedded Lecture Mini-Player, Next Action Button, AIR-1 Trajectory Gauge | Loading Skeleton, Empty Mission State, Active Study State, Backlog Alert State |
| `/learn` | Syllabus & Lecture Catalog | Subject Accordion, Topic Progress Bars, Teacher Filter, Lecture List with Watch Indicators | Loading, Empty Subject List, Search Filter No-Results |
| `/learn/lecture/[id]` | Focus Learning Room | Official YouTube Player, Interactive Timed Notes Panel, Video Analytics Heartbeat Indicator, Post-Lecture Confidence Modal | Player Initializing, Video Unavailable / Private, Active Playback, Session Restored Banner |
| `/practice/pyq` | GATE PYQ Test Engine | Filter Bar (Subject/Topic/Year), MCQ Option Selector, MSQ Checkboxes, NAT Virtual Keypad, Timer, Scratchpad | Quiz Loading, Active Question, Question Submitted (Immediate Feedback), Test Summary |
| `/practice/mistakes` | Categorized Mistake Notebook | Root Cause Filter tags (Conceptual, Calculation, Misread), Remediation Action Items | Loading, Empty Mistakes (Clean Sheet!), Filtered View |
| `/revision/queue` | Spaced-Repetition Daily Queue | Flashcard Deck Carousel, Easy/Good/Hard Rating Buttons, Active Recall Prompt, Retention Risk Warning | Queue Empty (All Reviewed), Card Active, Session Completed Summary |
| `/progress` | Readiness & Mastery Hub | Topic Mastery Matrix, Forgetting Curve Visualizer, Speed vs Accuracy Scatter Plot, Score Predictor Range | Calculating Score, Insufficient Data Warning, Fully Populated Analytics |
| `/strategy/importer`| Curriculum Spreadsheet Importer | Drag-and-Drop File Upload (CSV/XLSX), Published Google Sheet URL Input, Field Mapping, Dry-Run Validation Table | Idle, Parsing File, Dry-Run Preview Table, Import Error Drawer, Success Toast |
| `/strategy/calendar`| Adaptive Daily & Weekly Planner | Timetable Grid, Manual Task Locker, AI Schedule Explanation Drawer, Re-sync Button | Schedule Generating, Schedule Sync Error, Conflicting Time-blocks |
| `/settings` | System Settings & Config | Exam Target Date/Timezone, Weekday Availability Hours, AI Provider Selection, Export Data | Loading, Settings Saved Toast, Validation Error |

## 3. UI State Matrix Enforcement

Every single page and interactive component in the application must explicitly implement rendering logic for the 11 standardized UI states:

1. **Initial Loading**: Skeleton placeholders with exact component dimensions.
2. **Empty Data**: Friendly empty state with immediate call to action (e.g. "No lectures imported yet. Click here to import").
3. **Partial Data**: Graceful rendering when optional attributes (e.g. notes or teacher names) are null.
4. **Validation Failure**: Inline form field errors with human-readable error messages driven by Zod schemas.
5. **Authentication Failure**: Automatic redirect to `/login` or session expired dialog.
6. **Network Failure**: Offline toast notification with retry button.
7. **Server Failure**: Error boundary component with diagnostic correlation ID.
8. **Retry State**: Active spinner over disabled controls while re-fetching.
9. **Stale Data**: Background revalidation indicator without locking the UI.
10. **Optimistic Update Rollback**: Revert UI state immediately if an API call fails with error notification.
11. **Session Recovery State**: Banner notifying user that active video playback or test progress has been recovered.
