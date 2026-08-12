# Phase 9: Responsive & Accessibility QA Guidelines

## KaTeX & Mobile Layout Standards

### Accessibility & Rendering Rules
1. **KaTeX Horizontal Scroll**: Long mathematical expressions in block mode (`$$...$$`) must be wrapped in overflow-x auto containers to avoid breaking mobile viewports.
2. **Table Accessibility**: Complex truth tables and matrix representations must include proper `<th>` headers and ARIA attributes for screen reader compatibility.
3. **Contrast Compliance**: Contrast ratio $\ge 4.5:1$ for all text, LaTeX elements, and option buttons to meet WCAG 2.1 AA standards.
