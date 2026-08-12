# Phase 5 Adaptive Engine (IRT) Interface Boundary

## Boundary Specification

This document defines the formal data contract and integration boundary between the Phase 10 Global AI Brain and the **Phase 5 Item Response Theory (IRT) Adaptive Engine**.

---

## Data Exchanges

### Inbound to Brain from Phase 5:
- Student ability parameter estimate ($\theta$) per subject and topic
- Standard error of measurement ($SE(\theta)$)
- Item difficulty ($b$) and discrimination ($a$) parameters for PYQs

### Outbound from Brain to Phase 5:
- Requests for adaptive target question selection matching student ability $\theta \pm 0.5$
