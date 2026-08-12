# PYQ Provenance & Verification

## Provenance Tracking Schema
Every question in the Question Bank maintains strict origin details within `provenance` and `source_snapshot` JSON fields.

### Verification Status Lifecycle
- `UNVERIFIED`: Freshly imported or scraped PYQ question requiring official key match.
- `NEEDS_REVIEW`: Flagged for discrepancy between different official answer keys or rendering errors.
- `VERIFIED`: Confirmed against official GATE master answer key released by organizing IIT.
- `REJECTED`: Invalid formatting, dropped question, or duplicate entry.

## Audit Fields
- `verified_by`: Auditor username or system batch ID.
- `verified_at`: Timestamp of verification sign-off.
- `source_type`: `VERIFIED_PYQ`, `AUTHOR_CREATED`, `AI_DRAFT`.
