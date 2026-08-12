# Phase 9: PYQ Ingestion Pipeline Specification

## Pipeline Architecture

The Phase 9 PYQ Ingestion Engine converts raw PDF exam papers, OCR outputs, and structured JSON files into normalized, validated database entries.

```mermaid
graph TD
    A["Raw PDF / OCR File"] --> B["Parser Engine"]
    B --> C["LaTeX & Diagram Extraction"]
    C --> D["Zod Payload Validation"]
    D --> E["SHA-256 Deduplication Check"]
    E --> F["Supabase DB Write"]
```

### Stage Description
- **Extraction**: Separates question stem, options, diagrams, and official key.
- **Normalizer**: Standardizes mathematical formatting into KaTeX compliant syntax.
- **Deduplication Engine**: Calculates SHA-256 fingerprint over normalized statement to prevent duplicate entries across sets.
