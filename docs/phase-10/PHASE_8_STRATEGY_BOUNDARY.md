# Phase 8 Strategy & Planner Interface Boundary

## Boundary Specification

This document defines the formal data contract and integration boundary between the Phase 10 Global AI Brain and the **Phase 8 Strategy & Dynamic Planner Subsystem**.

---

## Data Exchanges

### Inbound to Brain from Phase 8:
- Active target milestone deadlines and target GATE rank/score parameters
- Custom calendar exclusions and study availability slots

### Outbound from Brain to Phase 8:
- Automated study plan recalibrations dispatched when `RC_SPRINT_UGL` or `RC_DECAY_ALERT` reason codes fire.
