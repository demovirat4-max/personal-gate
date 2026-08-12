# Historical Evidence Preservation Specification

## Purpose

To evaluate long-term learning trajectories, backtest AI Brain recommendation accuracy, and support student retakes over a multi-year timeline (2026–2028), historical telemetry and evidence records must be preserved permanently without degradation.

---

## Archival & Data Tiering Strategy

1. **Hot Tier (Supabase Primary DB)**: Past 90 days of full resolution context snapshots and raw decision logs. Fast index access for Command Center real-time views.
2. **Warm Tier (Partitioned DB Tables)**: 90 days to 1 year. Partitioned by `created_at` month (`brain_snapshots_y2026m08`).
3. **Cold Tier (Encrypted Object Storage)**: Historical evidence chains older than 1 year compressed into columnar Parquet format for long-term analytical queries.
