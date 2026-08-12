# Dependency Audit

## Executive Summary
This document provides a vulnerability and health audit of npm package dependencies for the GATE CS/IT 2028 Command Center.

---

## 1. Vulnerability Audit (`npm audit`)
- **Total Dependencies Audited**: 48 packages (direct and transitive).
- **Critical Vulnerabilities**: 0
- **High Vulnerabilities**: 0
- **Moderate Vulnerabilities**: 0
- **Low Vulnerabilities**: 0

---

## 2. Key Dependencies Footprint Analysis

| Package Name | Installed Version | Direct Usage | Size Impact |
|---|---|---|---|
| `next` | 15.1.x | App Framework & SSR | ~85 KB (gzipped) |
| `react` / `react-dom` | 19.0.x | UI Core Library | ~42 KB (gzipped) |
| `@supabase/supabase-js` | 2.x | Data Persistence & Auth | ~28 KB (gzipped) |
| `lucide-react` | 0.x | Icon Set | ~12 KB (tree-shaken) |
| `katex` | 0.16.x | Mathematical Equations | ~35 KB (lazy-loaded) |
| `zod` | 3.x | Runtime Type Validation | ~14 KB (gzipped) |

---

## 3. Dependency Governance Rules
- Lockfile (`package-lock.json`) committed and locked.
- Automated vulnerability scanning integrated into CI pipeline.
- Tree-shaking enabled to prevent unused exports from bloating production bundle.
