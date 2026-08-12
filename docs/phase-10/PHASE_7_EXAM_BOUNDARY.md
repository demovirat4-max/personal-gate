# Phase 7 Exam Engine Interface Boundary

## Boundary Specification

This document defines the formal data contract and integration boundary between the Phase 10 Global AI Brain and the **Phase 7 Mock Exam Engine**.

---

## Data Exchanges

### Inbound to Brain from Phase 7:
- Full-length and sectional mock exam results (`exam_attempts`)
- Sectional time breakdown, skipped question counts, negative marking statistics

### Outbound from Brain to Phase 7:
- Mock exam schedule recommendations and dynamic mock test assembly criteria based on historical weakness.
