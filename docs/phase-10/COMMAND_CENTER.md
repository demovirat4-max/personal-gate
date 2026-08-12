# Command Center Dashboard & UI Architecture

## Overview

The **Command Center** (`/src/app/brain/page.tsx`) serves as the mission control interface for GATE CS/IT 2028 preparation. It consolidates real-time focus timers, AI Brain recommendations, weak area alerts, yield metrics, and execution mode toggles into a responsive visual layout.

---

## Layout Architecture & Component Hierarchy

```
+-----------------------------------------------------------------------------------+
| Top Bar: Preparation Profile | Countdown Timer (e.g. 542 Days) | Mode Indicator    |
+-----------------------------------------------------------------------------------+
| MAIN HERO GRID (3 Columns)                                                       |
|                                                                                   |
|  COLUMN 1: Command Router & Feed    COLUMN 2: AI Brain Recommendations COLUMN 3: Telemetry |
|  +-------------------------------+  +--------------------------------+ +------------------+ |
|  | Natural Language Input Box    |  | #1 Priority Action Card        | | Focus Session    | |
|  | Quick Command Shortcuts       |  | #2 Memory Decay Warning Card   | | Timer Widget     | |
|  | Recent Action History Log     |  | #3 Prerequisite Remediation    | | Subject Mastery  | |
|  +-------------------------------+  +--------------------------------+ +------------------+ |
+-----------------------------------------------------------------------------------+
| BOTTOM DRAWER: Focus Session Controls & Real-Time Evidence Chain Inspector        |
+-----------------------------------------------------------------------------------+
```

---

## Key Frontend State Management Hooks

- `useBrainContext()`: Queries `/api/v1/brain/context` via SWR/TanStack Query with 30s revalidation.
- `useBrainDecisions()`: Manages action card acceptance, dismissal, and optimistic state updates.
- `useFocusSession()`: Controls timer countdown, session start/stop, and local persistence.

---

## Styling & Design Token Adherence

- **Dark Glassmorphic Aesthetic**: Deep indigo/slate background (`#0B0F19`) with translucent frosted glass panels (`backdrop-blur-md`, `bg-slate-900/60`).
- **Accent Palette**:
  - High Priority / Emergency: Vivid Coral (`#FF4D4D`)
  - AI Brain Recommendation: Cyan Glow (`#00F2FE`)
  - Mastered / Success: Emerald Spark (`#10B981`)
