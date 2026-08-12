# Video Tracking & Learning Analytics Specification

## 1. Compliance with Official YouTube IFrame Player API

* Playback relies strictly on the official `https://www.youtube.com/iframe_api` script loaded asynchronously.
* No raw video stream downloading or TOS-violating scraping is performed.
* Player state transitions are captured via the `onStateChange` listener (`PLAYING`, `PAUSED`, `ENDED`, `BUFFERING`).

## 2. Event Types & Capture Rules

Standardized video events across client, contract, API, and database:

| Event Name | Trigger Condition | Data Captured |
| :--- | :--- | :--- |
| `PLAY` | User clicks play or resumes playback | `videoTimestamp`, `wallClockTime` |
| `PAUSE` | User clicks pause or video buffers | `videoTimestamp`, `wallClockTime` |
| `SEEK` | User drags scrubber (`abs(currentTime - lastTime) > 2s`) | `fromTimestamp`, `toTimestamp` |
| `RATE_CHANGE` | Playback rate changed (e.g. 1.0x -> 1.5x) | `oldRate`, `newRate` |
| `TAB_HIDDEN` | Browser page visibility changes to hidden | `videoTimestamp`, `pauseTriggered: true` |
| `TAB_VISIBLE` | Browser page restored | `videoTimestamp` |
| `HEARTBEAT` | Periodic 10-second interval timer while playing | `startSec`, `endSec`, `playbackRate` |

## 3. Effective Watched Time & Interval De-duplication Algorithm

To prevent inflated watch times caused by replaying sections, looping, or multiple tabs, watched time is computed using **Interval Set Merging**:

```text
Given raw heartbeat intervals:
[0s - 10s], [5s - 15s], [30s - 40s]

1. Sort intervals by start time: [[0, 10], [5, 15], [30, 40]]
2. Merge overlapping intervals: [[0, 15], [30, 40]]
3. Compute total unique watched duration: (15 - 0) + (40 - 30) = 25 seconds.
```

* **Effective Watched Time**: $\sum (\text{Merged Interval Lengths})$.
* **Lecture Completion Gate**: A lecture is automatically flagged as `COMPLETED` when $\frac{\text{Effective Watched Time}}{\text{Total Video Duration}} \ge 0.90$ (90% unique coverage).

## 4. Telemetry Batching & Session Recovery

* **Event Batching**: Heartbeats and interaction events are accumulated in client memory (`Zustand` store) and flushed to `/api/v1/analytics/video-events` every **30 seconds** or immediately on `PAUSE` / `TAB_HIDDEN` / `ENDED`.
* **Session Recovery**: Player position is auto-saved locally every 5 seconds. If the user refreshes or closes the browser mid-lecture, the player resumes automatically from `last_position_seconds - 3s` (with a 3-second rewind buffer for cognitive context).
