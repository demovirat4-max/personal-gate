# Architectural Decisions and Open Questions Log

## 1. Resolved Core Decisions Register

All 11 mandatory product decisions have been explicitly confirmed by the user and baked into the Phase 0 specifications:

1. **GATE Paper**: GATE Computer Science and Information Technology (`CS`).
2. **Target Examination Year**: GATE 2028.
3. **Provisional Exam Timestamp & Timezone**: `2028-02-05T09:30:00+05:30` in `Asia/Kolkata` (Editable from Settings without re-deployment).
4. **Initial Weekly Availability**: 27 hours/week (1,620 minutes): Mon–Fri (180 mins/day), Sat–Sun (360 mins/day). Fully dynamic via Settings.
5. **Device Synchronization**: Server-backed multi-device synchronization (Supabase PostgreSQL + JWT Auth) supporting web primary app and future Expo mobile app. Single-user private account.
6. **Curriculum Import Method**: Published public Google Sheet CSV URLs, manual CSV uploads, and manual XLSX uploads.
7. **Lecture Transcripts**: Transcripts assumed unavailable initially. Features rely on video titles, user notes, bookmarks, and verified user study materials.
8. **Primary AI Provider**: ZZLM 5.2 via NVIDIA NIM (`build.nvidia.com`), maintaining the provider-independent `AiProvider` interface wrapper.
9. **AI Budget & Limits**: Hard monthly budget of ₹1,000 INR per month, daily ceilings, per-capability token limits, usage warnings (70%, 90%, 100%), and automatic rejection of non-essential AI calls at 100% cap.
10. **PYQ Dataset**: No existing verified dataset. Phase 6 includes a controlled PYQ seed pipeline supporting audited metadata (year, session, question number, MCQ/MSQ/NAT, marks, negative marking, explanations, verification status). Unverified questions are never labeled as official PYQs.
11. **Formula Book Model**: Hybrid model with optional reviewed seed dataset for GATE CS, visually distinguishing seed vs personal user formulas.

---

## 2. Non-Blocking Operational Settings (Adjustable at Runtime)

The following operational preferences require no architectural changes and can be adjusted at runtime via the `/settings` screen or environment variables:

* UI Dark Theme accent color preferences.
* Pomodoro study block duration (e.g. 50 mins study / 10 mins rest vs 60 mins straight).
* Spaced repetition initial easiness factor ($EF = 2.5$ default).
* Custom blackout calendar dates (e.g. college semester exams).
