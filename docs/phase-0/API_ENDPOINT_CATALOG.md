# API Endpoint Catalog Specification

All endpoints are versioned under `/api/v1` and strictly adhere to the `API_CONTRACT_STANDARD.md` response envelope.

## 1. Mission Control Endpoints

### `GET /api/v1/mission/today`
* **Auth**: Required (Bearer JWT)
* **Description**: Returns today's active study mission, countdown, current lecture, weak topic warnings, and AIR-1 trajectory score based on configured target exam timestamp.
* **Request Contract**: Query params `z.object({ date: z.string().optional() })`
* **Response Contract**: `z.object({ examCountdown: z.object({ targetDate: z.string(), daysRemaining: z.number(), hoursRemaining: z.number(), timezone: z.string() }), todaysMission: z.array(z.object({ id: z.string().uuid(), topicId: z.string().uuid(), topicName: z.string(), type: z.enum(['LECTURE', 'PRACTICE', 'REVISION']), allocatedMinutes: z.number(), status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']), orderIndex: z.number() })), nextBestAction: z.object({ title: z.string(), actionUrl: z.string(), priority: z.string() }), air1Trajectory: z.object({ readinessScore: z.number(), targetScore: z.number(), percentileEstimate: z.string() }), weakTopicWarnings: z.array(z.object({ topicId: z.string(), topicName: z.string(), masteryScore: z.number() })) })`

---

## 2. Curriculum & Importer Endpoints

### `POST /api/v1/curriculum/import`
* **Auth**: Required
* **Description**: Upload CSV/XLSX or provide a published Google Sheet CSV URL for validation or final insertion.
* **Request Contract**: `z.object({ sourceType: z.enum(['GOOGLE_SHEET_URL', 'CSV_UPLOAD', 'XLSX_UPLOAD']), sheetUrl: z.string().url().optional(), fileBase64: z.string().optional(), dryRun: z.boolean().default(true) })`
* **Response Contract**: `z.object({ totalRows: z.number(), validRowsCount: z.number(), invalidRowsCount: z.number(), errors: z.array(z.object({ rowNumber: z.number(), field: z.string(), reason: z.string() })), previewData: z.array(z.object({ subject: z.string(), topic: z.string(), subtopic: z.string(), lectureTitle: z.string(), youtubeVideoId: z.string(), teacher: z.string(), durationSeconds: z.number().nullable() })) })`

---

## 3. Embedded Player & Analytics Endpoints

### `POST /api/v1/analytics/video-events`
* **Auth**: Required
* **Description**: Batched heartbeat playback telemetry sent periodically from the YouTube player component.
* **Request Contract**: `z.object({ lectureId: z.string().uuid(), sessionId: z.string().uuid(), events: z.array(z.object({ eventType: z.enum(['PLAY', 'PAUSE', 'SEEK', 'RATE_CHANGE', 'TAB_HIDDEN', 'TAB_VISIBLE', 'HEARTBEAT']), videoTimestamp: z.number(), wallClockTime: z.string().datetime(), playbackRate: z.number() })), watchedIntervals: z.array(z.object({ startSec: z.number(), endSec: z.number() })) })`
* **Response Contract**: `z.object({ lectureId: z.string().uuid(), totalWatchedSeconds: z.number(), completionPercentage: z.number(), isCompleted: z.boolean() })`

---

## 4. Practice & PYQ Endpoints

### `GET /api/v1/practice/questions`
* **Auth**: Required
* **Request Contract**: `z.object({ topicId: z.string().uuid().optional(), subjectId: z.string().uuid().optional(), type: z.enum(['MCQ', 'MSQ', 'NAT']).optional(), year: z.number().optional() })`
* **Response Contract**: List of questions without correct answer keys (for exam mode integrity).

### `POST /api/v1/practice/submit`
* **Auth**: Required
* **Request Contract**: `z.object({ questionId: z.string().uuid(), userAnswer: z.union([z.string(), z.array(z.string()), z.number()]), timeTakenSeconds: z.number(), confidenceLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']) })`
* **Response Contract**: `z.object({ isCorrect: z.boolean(), marksAwarded: z.number(), explanation: z.string(), correctAnswer: z.union([z.string(), z.array(z.string()), z.number()]), mistakeLogged: z.boolean() })`

---

## 5. Settings Endpoints

### `GET /api/v1/settings`
* **Auth**: Required
* **Response Contract**: `z.object({ targetBranch: z.string(), targetExamDate: z.string(), timezone: z.string(), weekdayAvailability: z.record(z.string(), z.number()), aiProvider: z.string(), aiModel: z.string() })`

### `PATCH /api/v1/settings`
* **Auth**: Required
* **Request Contract**: `z.object({ targetBranch: z.string().optional(), targetExamDate: z.string().optional(), timezone: z.string().optional(), weekdayAvailability: z.record(z.string(), z.number()).optional(), aiProvider: z.string().optional(), aiModel: z.string().optional() })`
* **Response Contract**: Settings object matching GET.

---

## 6. AI Mentor Endpoints

### `POST /api/v1/ai/explain-concept`
* **Auth**: Required
* **Request Contract**: `z.object({ topicId: z.string().uuid(), doubtContext: z.string() })`
* **Response Contract**: `z.object({ markdownExplanation: z.string(), citations: z.array(z.string()) })`

### `POST /api/v1/ai/generate-quiz`
* **Auth**: Required
* **Request Contract**: `z.object({ topicId: z.string().uuid(), questionCount: z.number().min(1).max(10) })`
* **Response Contract**: List of generated quiz questions validated with Zod.
