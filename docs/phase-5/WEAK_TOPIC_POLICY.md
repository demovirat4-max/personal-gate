# Weak Topic Identification Policy

> **GATE AIR-1 Command Center** · Weak Topic Detection & Remediation Rules

---

## Identification Thresholds

A topic is classified under the **Weak Topic Policy** if ANY of the following criteria are met:

1. **Mastery Threshold**: $M_{\text{Topic}} < 60.0\%$.
2. **Mistake Density**: Open mistake count in topic $> 3$ unresolved errors.
3. **High GATE Weight Vulnerability**: Topic GATE weight $> 2.0\%$ AND $M_{\text{Topic}} < 70.0\%$.
4. **Accuracy Drop**: Last 3 quiz attempts accuracy $< 50.0\%$.

---

## Remediation Workflow

```
[ Topic Flags Weak ]
        │
        ▼
[ Auto-inject into Daily Plan ] ──► Priority Boost (+25.0 pts)
        │
        ▼
[ Remediation Session ]
  ├── 1. Review Concept Notes
  ├── 2. Resolve Open Mistake Vault items
  └── 3. 5-Question Drill Quiz
        │
        ▼
[ Re-evaluate Mastery ]
  ├── If M >= 60.0%: Clear Weak Flag
  └── If M < 60.0%: Schedule Follow-up Revision in 48h
```

---

## Service Hooks

Weak topic classification logic is implemented inside [`src/server/services/adaptive.service.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/services/adaptive.service.ts) and [`src/server/services/mistake.service.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/services/mistake.service.ts).
