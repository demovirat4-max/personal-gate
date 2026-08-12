# Phase 4 AI Tutor Interface Boundary

## Boundary Specification

This document defines the formal data contract and integration boundary between the Phase 10 Global AI Brain and the **Phase 4 AI RAG & Tutor Subsystem**.

---

## Data Exchanges

### Inbound to Brain from Phase 4:
- Frequency of AI tutor queries per topic
- Weak concept flags extracted from student question prompts

### Outbound from Brain to Phase 4:
- Context Snapshot injection into AI Tutor system prompt (`system_instruction`)
- Enables AI Tutor to personalize explanations based on the student's exact IRT ability level and reason-coded weaknesses.
