# Evidence and Provenance Specification

## Executive Summary

To ensure total transparency and build student trust, every recommendation produced by the Global AI Brain must be backed by an immutable **Evidence Chain**. The AI Brain does not provide opaque or black-box advice; every suggested task explicitly references empirical telemetry data.

---

## Evidence Provenance Data Structure

```json
{
  "evidence_id": "ev_8f9a2b1c-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
  "decision_id": "dec_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "snapshot_id": "snp_9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "reason_code": "RC_DECAY_ALERT",
  "primary_source": {
    "type": "SPACED_REPETITION_DECAY",
    "table_reference": "flashcard_reviews",
    "entity_id": "topic_algorithms_sorting",
    "observed_metric": "Retention R = 0.42 (Threshold < 0.60)",
    "last_interaction": "2026-07-15T14:30:00Z"
  },
  "corroborating_evidence": [
    {
      "type": "MOCK_EXAM_ERROR",
      "table_reference": "exam_attempts",
      "entity_id": "attempt_mock_03",
      "observed_metric": "Incorrect response on Quicksort worst-case question #42"
    }
  ],
  "cryptographic_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

---

## Verifiability & Audit Trail

1. **Hash Verification**: SHA-256 digest calculated over the snapshot ID, metric inputs, and reason code ensures telemetry was not altered post-facto.
2. **UI Transparency**: Clicking "Why am I seeing this?" in the Command Center UI displays the raw evidence metrics in human-readable format.
3. **Historical Audit**: System administrators and students can audit past decisions to evaluate Brain recommendation quality over time.
