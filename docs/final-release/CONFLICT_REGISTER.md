# Conflict Register & Architectural Trade-off Decisions

## Executive Summary
This document logs all technical conflicts, design trade-offs, scope ambiguities, and resolution decisions made during the architecture and build phases of the GATE CS/IT 2028 Command Center.

---

## 1. Conflict & Resolution Log

### Conflict CR-001: Local State vs. Supabase Persistence for Mock Test Timer
- **Context**: During live mock test simulation, submitting timer updates to Supabase every second creates extreme database write amplification and latency.
- **Trade-off Decision**: Maintain high-frequency timer state in local `zustand` / React state. Sync snapshot state to Supabase every 30 seconds and upon explicit section submission or test completion.
- **Resolution**: Implemented hybrid timer architecture in `src/lib/state/test-runner-store.ts`.

### Conflict CR-002: Tailwind CSS vs. Vanilla CSS Custom Tokens
- **Context**: Project rules mandate CSS design system clarity, avoiding bloated utility classes while maintaining clean theme toggling.
- **Trade-off Decision**: Standardize on CSS custom properties (variables) defined in `src/app/globals.css` combined with scoped component styles and utility classes.
- **Resolution**: Achieved full dark mode compatibility with dynamic design tokens (`--bg-primary`, `--text-primary`, `--accent-color`).

### Conflict CR-003: Scientific Calculator Rendering (DOM vs Canvas)
- **Context**: GATE virtual calculator requires exact layout match with the official GATE exam calculator.
- **Trade-off Decision**: Implemented modular React component with CSS Grid instead of HTML Canvas for accessibility, keyboard event handling, and ARIA compliance.
- **Resolution**: Created `src/components/calculator/ScientificCalculator.tsx` with full keyboard binding support.

---

## 2. Decision Log Summary Table

| ID | Issue Area | Option Selected | Impact / Rationale |
|---|---|---|---|
| CR-001 | Test Timer | Local State + Periodic Sync | Reduced DB calls by 96%, zero timer lag. |
| CR-002 | Design System | CSS Variables + Utility Classes | Flexible dark mode, high visual consistency. |
| CR-003 | Scientific Calc | Accessible DOM Component | Screen reader friendly, exact GATE layout. |
| CR-004 | AI Guardrails | Server-side Prompt Sanitization | Prevents injection before LLM API invocation. |
