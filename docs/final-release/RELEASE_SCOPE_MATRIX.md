# Release Scope Matrix

## Executive Summary
This document defines the functional and non-functional scope boundaries for the Final Release (v1.0.0) of the GATE CS/IT 2028 Command Center.

---

## 1. In-Scope Functional Modules

| Module ID | Feature Name | Description / Scope Boundary | Status |
|---|---|---|---|
| M-01 | Syllabus Tracker | Full 10 GATE CS/IT subject progress, topic status tracking, weightage breakdown | DELIVERED |
| M-02 | Revision Engine | Spaced repetition queue (Leitner algorithm), review scheduling, flashcard revision | DELIVERED |
| M-03 | Practice Engine | Topic-wise question practice, PYQ filtering, instant explanations, marking scheme | DELIVERED |
| M-04 | Mock Test Simulator | Timed 3-hour GATE environment, 65-question format, NAT/MSQ/MCQ support | DELIVERED |
| M-05 | Scientific Calculator | Authentic replica of GATE virtual scientific calculator with memory & trig functions | DELIVERED |
| M-06 | Performance Analytics | Topic accuracy heatmaps, time-per-question metrics, weak area identification | DELIVERED |
| M-07 | AI Study Companion | Contextual solution breakdown, prompt-injection defended AI tutor interface | DELIVERED |
| M-08 | Authentication & RLS | Supabase email/password auth, user data isolation via Row Level Security | DELIVERED |

---

## 2. Explicit Out-of-Scope Items (Deferred to v1.1 / Future Releases)

- **Multi-user Real-time Multiplayer Quizzes**: Deferred. Focus remains strictly on individual GATE preparation.
- **Native Mobile Applications (iOS/Android)**: Deferred. Mobile responsiveness is achieved via PWA / Mobile Web views.
- **Off-line Native Sync Storage (IndexedDB background sync)**: Deferred to v1.1. Local storage caching provided for active test sessions.

---

## 3. Non-Functional Requirements Verification
- **Performance**: Page load < 1.5s, TTI < 2.0s
- **Security**: 100% RLS enforcement on user data tables
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Cross-Browser**: Tested and verified on Chrome, Firefox, Safari, Edge
