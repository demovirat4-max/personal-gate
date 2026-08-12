# Curriculum Model — Phase 2

> **GATE AIR-1 Command Center** · Phase 2  
> Subject → Topic → Subtopic → Lecture hierarchy, subject codes, and GATE CS 2028 seeded data.

---

## Hierarchy Overview

The GATE AIR-1 curriculum is organized as a strict 4-level tree:

```
Subject
  └── Topic
        └── Subtopic
              └── Lecture (YouTube video)
```

Each level has a unique ID, a human-readable name, and a `display_order` for deterministic ordering. The leaf node (`Lecture`) carries the actual content reference: a YouTube URL.

---

## Level 1: Subject

A **Subject** is a top-level grouping that corresponds to a distinct knowledge area tested in GATE CS. Each subject has a **canonical code** that is stable across years and used as a foreign-key reference in import sheets.

### Subject Schema (TypeScript)

```typescript
interface Subject {
  id: string;            // uuid
  code: string;          // e.g. "GATE_CS_DS"
  name: string;          // e.g. "Data Structures"
  displayOrder: number;  // ordering in the syllabus
  createdAt: string;
  updatedAt: string;
}
```

### Canonical Subject Codes

The `code` field is the stable, human-readable identifier used in import sheets. It is case-sensitive and must match exactly.

| Code | Subject Name | Display Order |
|------|-------------|---------------|
| `GATE_CS_DS` | Data Structures | 1 |
| `GATE_CS_ALGO` | Algorithms | 2 |
| `GATE_CS_TOC` | Theory of Computation | 3 |
| `GATE_CS_CO` | Computer Organization & Architecture | 4 |
| `GATE_CS_OS` | Operating Systems | 5 |
| `GATE_CS_DBMS` | Database Management Systems | 6 |
| `GATE_CS_CN` | Computer Networks | 7 |
| `GATE_CS_DM` | Discrete Mathematics | 8 |
| `GATE_CS_LA` | Linear Algebra | 9 |
| `GATE_CS_PROB` | Probability & Statistics | 10 |
| `GATE_CS_PROG` | Programming & Data Structures (C) | 11 |

---

## Level 2: Topic

A **Topic** is a second-level grouping within a subject. Topics are defined at the time of import — the import sheet includes a `topic` column that names the topic within the specified subject.

### Topic Schema (TypeScript)

```typescript
interface Topic {
  id: string;
  subjectId: string;     // FK → Subject.id
  name: string;          // e.g. "Arrays and Strings"
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

Topics are created via **upsert** during the commit phase: if a topic with the same `(subject_id, name)` already exists, it is reused; otherwise a new one is created.

---

## Level 3: Subtopic

A **Subtopic** provides fine-grained categorization within a topic. It is the immediate parent of one or more lectures.

### Subtopic Schema (TypeScript)

```typescript
interface Subtopic {
  id: string;
  topicId: string;       // FK → Topic.id
  name: string;          // e.g. "Stack Operations"
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

Subtopics are also created via upsert on `(topic_id, name)`.

---

## Level 4: Lecture

A **Lecture** is a single YouTube video resource. It is the leaf node of the hierarchy.

### Lecture Schema (TypeScript)

```typescript
interface Lecture {
  id: string;
  subtopicId: string;          // FK → Subtopic.id
  title: string;               // Lecture title
  youtubeUrl: string;          // Full YouTube watch URL
  youtubeVideoId: string;      // 11-character video ID
  durationSeconds: number | null;
  displayOrder: number;
  isFree: boolean;
  importedFromBatchId: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### YouTube Video ID Extraction

The `youtubeVideoId` is extracted by `src/lib/parsers/youtube-url.parser.ts`. The parser handles all common YouTube URL formats:

| URL Format | Example |
|-----------|---------|
| Standard watch URL | `https://www.youtube.com/watch?v=dQw4w9WgXcQ` |
| Short URL | `https://youtu.be/dQw4w9WgXcQ` |
| Embed URL | `https://www.youtube.com/embed/dQw4w9WgXcQ` |
| URL with extra params | `https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s` |

```typescript
// src/lib/parsers/youtube-url.parser.ts
export function extractYouTubeVideoId(url: string): string | null {
  // Handles all 4 formats above
  // Returns null if no valid 11-char video ID found
}
```

---

## GATE CS 2028 Seeded Data

At migration time, the following seed data is inserted:

### Subjects Seed SQL

```sql
INSERT INTO subjects (code, name, display_order) VALUES
  ('GATE_CS_DS',   'Data Structures',                         1),
  ('GATE_CS_ALGO', 'Algorithms',                              2),
  ('GATE_CS_TOC',  'Theory of Computation',                   3),
  ('GATE_CS_CO',   'Computer Organization & Architecture',    4),
  ('GATE_CS_OS',   'Operating Systems',                       5),
  ('GATE_CS_DBMS', 'Database Management Systems',             6),
  ('GATE_CS_CN',   'Computer Networks',                       7),
  ('GATE_CS_DM',   'Discrete Mathematics',                    8),
  ('GATE_CS_LA',   'Linear Algebra',                          9),
  ('GATE_CS_PROB', 'Probability & Statistics',               10),
  ('GATE_CS_PROG', 'Programming & Data Structures (C)',      11)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = now();
```

### Course Seed SQL

```sql
INSERT INTO courses (name, slug, description, is_active) VALUES
  ('GATE CS 2028', 'gate-cs-2028',
   'Complete GATE Computer Science syllabus for the 2028 exam cycle', true)
ON CONFLICT (slug) DO NOTHING;
```

---

## Import Sheet Column Mapping

When importing lectures via any channel, the import sheet must provide these columns:

| Column Name | Maps To | Required | Notes |
|-------------|---------|----------|-------|
| `subject_code` | `subjects.code` | ✅ | Must match a seeded code exactly |
| `topic` | `topics.name` | ✅ | Created if not exists |
| `subtopic` | `subtopics.name` | ✅ | Created if not exists |
| `title` | `lectures.title` | ✅ | Any non-empty string |
| `youtube_url` | `lectures.youtube_url` | ✅ | Must be a valid YouTube URL |
| `display_order` | `lectures.display_order` | ❌ | Defaults to row index if absent |
| `is_free` | `lectures.is_free` | ❌ | Defaults to `false` |
| `duration_seconds` | `lectures.duration_seconds` | ❌ | Positive integer |

---

## Traversal Query Example

To retrieve the full tree for "Data Structures":

```sql
SELECT
  s.code AS subject_code,
  s.name AS subject_name,
  t.name AS topic_name,
  st.name AS subtopic_name,
  l.title AS lecture_title,
  l.youtube_video_id,
  l.is_free,
  l.display_order
FROM subjects s
  JOIN topics t ON t.subject_id = s.id
  JOIN subtopics st ON st.topic_id = t.id
  JOIN lectures l ON l.subtopic_id = st.id
WHERE s.code = 'GATE_CS_DS'
ORDER BY t.display_order, st.display_order, l.display_order;
```

---

## `GET /api/v1/curriculum` Response Shape

```json
{
  "subjects": [
    {
      "id": "...",
      "code": "GATE_CS_DS",
      "name": "Data Structures",
      "displayOrder": 1,
      "topics": [
        {
          "id": "...",
          "name": "Arrays and Strings",
          "displayOrder": 1,
          "subtopics": [
            {
              "id": "...",
              "name": "Stack Operations",
              "displayOrder": 1,
              "lectures": [
                {
                  "id": "...",
                  "title": "Stack Intro",
                  "youtubeVideoId": "dQw4w9WgXcQ",
                  "isFree": true,
                  "displayOrder": 1
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```
