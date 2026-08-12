# Authority Matrix & Governance Framework

## Executive Summary
The Authority Matrix establishes governance, operational responsibility, approval workflows, and technical sign-off authorities across the GATE CS/IT 2028 Command Center project lifecycle.

---

## 1. RACI Matrix

### Roles Defined
- **PO**: Product Owner / Aspirant Curriculum Lead
- **TA**: Technical Architect / Lead Engineer
- **SE**: Software Engineer (Frontend / Backend)
- **QA**: Quality Assurance & Testing Lead
- **SEC**: Security & Compliance Auditor

### RACI Table

| Domain / Activity | PO | TA | SE | QA | SEC |
|---|---|---|---|---|---|
| Syllabus Core Requirements & Topic Weighting | **A/R** | C | I | I | I |
| App Router Architecture & Core Patterns | I | **A/R** | C | I | C |
| Database Schema & Supabase RLS Policies | C | **A** | **R** | C | C |
| State Machine & Quiz Engine Implementation | C | C | **A/R** | C | I |
| Test Strategy (Vitest & Playwright) | I | C | C | **A/R** | I |
| Security, Auth & Secrets Governance | I | C | C | I | **A/R** |
| Deployment & Production Release Approval | **A** | **R** | I | C | C |

*Legend: R = Responsible, A = Accountable, C = Consulted, I = Informed*

---

## 2. Decision & Escalation Matrix

```
   [ Operational Issues ] ----> Resolved by Software Engineer / QA
            |
            v
   [ Architectural / Schema Discrepancy ] ----> Escalated to Lead Technical Architect
            |
            v
   [ Scope, Syllabus, or Schedule Change ] ----> Escalated to Product Owner / System Lead
```

---

## 3. Sign-off Authorities & Gate Checks
- **Phase 1-5 Technical Approval**: Technical Architect (`TA`)
- **Phase 6-10 QA & Verification Approval**: QA Lead (`QA`)
- **Final Release Governance Sign-Off**: Product Owner (`PO`) & Lead Technical Architect (`TA`)
