# Formula Model and Rendering Specification

## Overview
Formulas in GATE CS/IT (e.g. Master Theorem, Page Table Size, Pipeline Speedup) require LaTeX expression rendering and variable mapping.

## Formula Schema
- `id`: UUID (PK)
- `subject_id`: UUID (FK -> `public.subjects`)
- `topic_id`: UUID (FK -> `public.topics`)
- `title`: TEXT
- `expression`: TEXT (LaTeX syntax e.g. `$T(n) = aT(n/b) + f(n)$`)
- `expression_format`: TEXT ('PLAIN_TEXT' | 'LATEX')
- `variable_definitions`: JSONB Array of `{ name, symbol, description, unit }`
- `conditions`: TEXT (Applicable domain constraints e.g., `$a \ge 1, b > 1$`)
- `example`: TEXT (Sample numerical computation)

## Rendering Engine
Formulas are rendered client-side using KaTeX / React Markdown KaTeX plugins. Fallbacks to formatted plain text are maintained if LaTeX parsing fails.
