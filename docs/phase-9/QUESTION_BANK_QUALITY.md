# Phase 9: Question Bank Quality Assurance

## QA Validation Standards

To ensure 100% correctness across 3,500+ questions, Phase 9 mandates multi-stage QA verification before publishing questions to the live question bank.

### Verification Pipelines
1. **LaTeX Formula Syntax**: Validated against KaTeX parser rules. Ensures no unescaped underscores, missing brackets, or broken math environments.
2. **Diagram & Visual Assets**: Verified high-DPI SVG/PNG rendering for circuit diagrams, state transition graphs, and execution trees.
3. **NAT Range Integrity**: Numerical Answer Type (NAT) questions must explicitly specify exact decimal precision (e.g. `[12.5, 12.5]` or range `[12.4, 12.6]`).
4. **MSQ Answer Set Validation**: Multi-Select Questions must have at least 1 correct option key and no duplicate option keys.
