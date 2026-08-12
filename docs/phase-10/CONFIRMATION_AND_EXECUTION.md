# Confirmation and Execution Architecture

## Purpose

To prevent accidental modification of critical study schedules or target milestone dates, the Command Processing Pipeline implements a strict **Two-Step Transactional Confirmation** protocol for high-risk operations.

---

## Action Risk Classification Matrix

| Risk Level | Operations | Confirmation Protocol |
|---|---|---|
| **Low Risk** | Start focus timer, open flashcard deck, view analytics | Immediate execution (1-click) |
| **Medium Risk** | Dismiss AI Brain decision, mark topic complete, snooze task | Single confirmation toast / undo snackbar (5s delay) |
| **High Risk** | Recalibrate weekly schedule, reset topic mastery score, switch execution mode | **Explicit Modal Confirmation** with summary of proposed changes |

---

## Transactional Flow (High Risk)

```
[User Command / Button] -> [Parser Identifies HIGH_RISK] 
                        -> [Generate Proposed Delta JSON]
                        -> [Display Confirmation Modal]
                        -> [User Clicks "Confirm & Apply"] 
                        -> [Execute Database Transaction]
```
