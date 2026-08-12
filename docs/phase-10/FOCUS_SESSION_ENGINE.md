# Focus Session Engine & Distraction Shielding

## Purpose

The **Focus Session Engine** provides an integrated, distraction-free environment for deep study work (e.g., solving problem sets, watching lecture modules, reviewing mistakes). It tracks real-time focus time and feeds session completion telemetry back into the Global AI Brain.

---

## Core Capabilities

1. **Timer Options**: Pomodoro (25m / 5m), Deep Work (50m / 10m), or Custom Duration (up to 180m).
2. **Distraction Shielding**:
   - Fullscreen focus overlay mode.
   - Suppresses non-critical UI alerts and notification popups during active timer.
   - Audio focus sounds (white noise, ambient rain, binaural study beats).
3. **Telemetry Collection**:
   - Logs completed focus minutes per subject/topic.
   - Tracks session interruptions and user pause counts.

---

## API & Database Integration

- **API Endpoint**: `POST /api/v1/study-sessions`
- **Database Table**: `study_sessions`
- **Payload logged**: `session_type`, `subject_id`, `topic_id`, `planned_duration_sec`, `actual_duration_sec`, `interruption_count`.
