# Known Limitations and Technical Debt

## Executive Summary
This document records known technical limitations, edge cases, trade-offs, and recommended technical enhancements for future post-1.0 iterations of the GATE CS/IT 2028 Command Center.

---

## 1. Technical Limitations & Edge Cases

| ID | Limitation / Edge Case | Description | Workaround / Mitigation |
|---|---|---|---|
| TL-01 | WebGL Dependency in Analytics Charts | Complex multi-layer radar charts require canvas rendering on low-spec hardware. | Dynamic fallback to SVG chart view for low-power mobile devices. |
| TL-02 | Scientific Calculator Clipboard Operations | Browser security restrictions may block programmatic copy/paste in Safari. | Standard on-screen memory display buttons (`MS`, `MR`, `MC`). |
| TL-03 | AI Study Companion Rate Limits | External LLM API provider imposes per-minute rate limits during peak usage. | Exponential backoff retry handler + client toast notifications. |

---

## 2. Technical Debt & Future Roadmap Recommendations
1. **PWA Offline Mode (v1.1)**: Introduce Service Worker background caching for offline question practice.
2. **IndexedDB Local Storage Adapter**: Upgrade local state persistence layer from `localStorage` to `IndexedDB` for high-volume offline mock test attempt caching.
