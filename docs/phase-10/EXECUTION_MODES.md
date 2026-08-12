# System Execution Modes Specification

## Purpose

The GATE CS/IT 2028 Command Center operates under five distinct **Execution Modes**. Each mode alters the Global AI Brain's decision synthesis priorities, daily planner density, UI notifications, and recommendation rules based on student context.

---

## Execution Modes Catalog

| Execution Mode | Operational Trigger | System Behavior & Brain Rules |
|---|---|---|
| **Normal Mode** | Default baseline mode | Balanced allocation across concept learning, practice PYQs, and spaced repetition |
| **Final Sprint Mode** | Days to GATE $< 60$ or user activated | Prioritizes high-yield topic revision, mock exams, and speed drills; suppresses non-essential features |
| **Emergency Weakness Mode** | Subject accuracy falls $< 45\%$ on topic weightage $> 5\%$ | Temporarily freezes new topic introduction; forces intensive 3-day prerequisite remediation |
| **Maintenance Mode** | Syllabus completion $> 90\%$ and overall mastery $> 80\%$ | Maintains retention via daily flashcard sessions and weekly full-length mock tests |
| **Read-Only Mode** | Unauthenticated user or offline read state | Disables state mutation endpoints; allows local browsing of notes and flashcards |

---

## Mode State Management

- Controlled via `execution_mode` column in `preparation_profiles` database table.
- Mode changes dispatch event signals to the Command Center UI, dynamically refreshing action cards and navigation priorities.
