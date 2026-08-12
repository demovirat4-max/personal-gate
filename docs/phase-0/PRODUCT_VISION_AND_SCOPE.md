# Product Vision and Scope Specification

## 1. Product Vision

**GATE AIR-1 Command Center** is a high-precision, personal GATE (Graduate Aptitude Test in Engineering) preparation operating system. It is engineered specifically to maximize the probability of achieving All India Rank 1 (AIR 1) in **GATE CS 2028** (Computer Science & Information Technology).

While AIR 1 cannot be guaranteed by any software, the system treats preparation as an empirical optimization problem: minimizing syllabus knowledge gaps, maximizing retention via active recall and spaced repetition, optimizing problem-solving velocity, and adhering strictly to an adaptive study schedule built on evidence from actual student performance.

## 2. Confirmed Product Parameters

* **Target Exam**: GATE Computer Science and Information Technology (`CS`).
* **Target Exam Year**: GATE 2028.
* **Provisional Planning Timestamp**: `2028-02-05T09:30:00+05:30` (Timezone: `Asia/Kolkata`). Fully editable from Settings without app re-deployment.
* **Initial Weekly Availability**: 27 hours per week (1,620 minutes):
  * Monday – Friday: 180 minutes/day.
  * Saturday – Sunday: 360 minutes/day.
  *(Fully dynamic and editable from Settings for blackout dates, college exams, etc.)*
* **Single-User Private Account**: Built specifically for one student with server-backed multi-device synchronization (web + future Expo mobile).
* **Deterministic Core + AI Mentor**: Hard scheduling constraints, time blocking, and revision queues are calculated deterministically. AI acts as a strategic mentor via an `AiProvider` interface using **ZZLM 5.2 via NVIDIA NIM (build.nvidia.com)** with a hard monthly budget ceiling of ₹1,000 INR.

## 3. Product Scope by Core Area

### Area 1: Mission Control
* Real-time GATE exam live countdown timer calculated from configurable target timestamp (`2028-02-05T09:30:00+05:30` in `Asia/Kolkata`).
* Dynamic "Today's Mission" containing prioritized study blocks based on 1,620 minutes/week initial capacity.
* Embedded YouTube lecture player with instant session resume.
* Quick-action launcher ("Next Best Action").
* Immediate weak-topic warnings and AI Mentor daily brief.
* Daily study consistency metric (streak + effective focus hours).
* Exam Readiness Index and AIR-1 Trajectory indicator.

### Area 2: Learn Center
* Configurable GATE CS syllabus hierarchy (Subjects, Topics, Subtopics, Lectures).
* Teacher and Course/Playlist management.
* Embedded official YouTube IFrame Player with telemetry tracking.
* Time-linked notes, key takeaways, and bookmarking.
* Lecture completion gating with mandatory post-lecture confidence checks.
* *Transcripts*: Transcripts are assumed unavailable initially. Learning features rely strictly on lecture titles, subject/topic mappings, user notes, bookmarks, user tags, and verified external study material. Transcript-dependent features remain disabled.

### Area 3: Practice & PYQ Engine
* Verified GATE PYQ repository for GATE CS organized by topic and year.
* Controlled PYQ seed-import pipeline in Phase 6 for reviewed CSV/JSON data (supporting source year, session, question number, MCQ/MSQ/NAT, marks, negative marking, options, verified answer, explanation, subject/topic mapping, and verification status).
* Unverified or AI-generated questions will **never** be labeled as official GATE PYQs.
* Timed practice mode with custom time limits per question.
* Automatic "Mistake Notebook" tagging failure root-causes (Conceptual, Calculation, Misread, Time Pressure).

### Area 4: Spaced Revision System
* SuperMemo/Anki-inspired deterministic spaced repetition queue for weak and decaying topics.
* Active recall card flip interface (Formula Book, Flashcards, Short Notes).
* **Formula Book Hybrid Model**:
  * Includes an optional reviewed seed formula dataset for GATE CS.
  * Seeded formulas are visually distinguished from personal user formulas.
  * Allows user to create, edit, hide, and annotate personal formulas.
  * AI-generated formulas are never automatically treated as verified.
* Mistake notebook revision workflows.
* Real-time topic retention-risk warnings based on forgetting curves.

### Area 5: Progress Analytics & Diagnostics
* Deep topic mastery heatmap (0% to 100% scaled by accuracy, recency, and speed).
* Complete syllabus completion radar.
* Speed vs Accuracy matrix.
* Mock test score trends & percentile tracking.
* Transparent Exam Readiness Score breakdown (no black-box scoring).

### Area 6: Strategy & Adaptive Scheduler
* Deterministic time-block generator considering weekday available hours (1,620 mins/week default) and blackout dates.
* Automatic backlog recovery and missed-task recalculation.
* Target score calculator (aiming for 85+ marks out of 100).
* Cognitive load balancing (alternating heavy theory with practice blocks).

## 4. Out of Scope (Non-Goals for V1 System)

* Public multi-tenant SaaS features (social feed, public leaderboards, user forums).
* Re-hosting or downloading YouTube video files (violates YouTube TOS).
* Fabricating or scraping unconfirmed lecture transcripts.
* Direct write-back to external Google Sheets.
* Coupling domain services directly to NVIDIA NIM payloads.
