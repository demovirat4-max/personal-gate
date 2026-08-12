# Phase 9: Content Provenance and Source Tracking

## Provenance Model

Every question, diagram, and solution in the GATE CS/IT 2028 Command Center maintains immutable provenance metadata to guarantee authenticity, copyright compliance, and auditability.

### Verification Attributes
- **Source Type**: `OFFICIAL_PYQ` | `STANDARD_TEXTBOOK` | `CUSTOM_MOCK`
- **Official Exam**: GATE CS/IT (1991–2027), Set number, Question number
- **Cryptographic Hash**: SHA-256 hash generated over normalized question text and option contents
- **Textbook Citation**: Book title, Edition, Author, Chapter, Problem number (for textbook items)
- **Copyright License**: Fair-use Educational / Public Domain classification
