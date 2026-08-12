# Responsive and Accessibility QA Report

## Layout & Responsive QA
- **Desktop (1920x1080 / 1440x900)**: Multi-tab layout with side-by-side note previewer and KaTeX formula editor.
- **Tablet (768px)**: Stacked tab buttons and collapsible filtering panels.
- **Mobile (375px - 414px)**: Touch-friendly flashcard flip controls, full-width formula viewports with horizontal scroll for complex LaTeX formulas.

## Accessibility (a11y)
- All interactive controls feature explicit `aria-label` tags.
- Flashcard rating buttons support keyboard shortcuts (`1`: AGAIN, `2`: HARD, `3`: GOOD, `4`: EASY).
- Color contrast compliant with WCAG 2.1 AA standards (cyan/slate high contrast mode).
