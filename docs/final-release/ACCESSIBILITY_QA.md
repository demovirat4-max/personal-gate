# Accessibility QA & WCAG 2.1 AA Audit

## Executive Summary
This document evaluates the compliance of the GATE CS/IT 2028 Command Center interface with WCAG 2.1 Level AA accessibility standards.

---

## 1. Compliance Evaluation Matrix

| Accessibility Criterion | Requirement | Test Result | Implementation Detail |
|---|---|---|---|
| 1.4.3 Contrast (Minimum) | Text contrast ratio >= 4.5:1 | PASSED | Custom high-contrast color tokens for light & dark mode |
| 2.1.1 Keyboard Navigation | All functionality available via keyboard | PASSED | Full tab-index flow on calculator keys & quiz controls |
| 2.4.7 Focus Visible | Clear focus indicators on interactive elements | PASSED | High-visibility focus ring styles in `globals.css` |
| 4.1.2 Name, Role, Value | Semantic HTML and ARIA landmarks | PASSED | Explicit `aria-label`, `role="button"`, `role="dialog"` |

---

## 2. Screen Reader & Keyboard Navigation Verification
- **Screen Reader Support**: Tested with NVDA and VoiceOver across question options, timers, and mathematical formulas (KaTeX with text alternatives).
- **Keyboard Shortcuts**: Calculator keys bind directly to physical Numpad and keyboard keys (`0-9`, `+`, `-`, `*`, `/`, `Enter`, `Escape`).
