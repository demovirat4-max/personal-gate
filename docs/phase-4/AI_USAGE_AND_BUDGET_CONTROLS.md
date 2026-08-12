# AI Usage & Budget Controls Specification

> **GATE AIR-1 Command Center** · Monthly Spending Ceilings & Pre-flight Controls

---

## 1. Cost Ceiling & Governance

To guarantee zero surprise cloud API billing, the system enforces a strict monthly budget ceiling of **₹1,000 INR** (configurable via `AI_MONTHLY_BUDGET_INR`).

---

## 2. Pre-flight Enforcement Pipeline

Before any request dispatch to NVIDIA NIM APIs, [`AiOrchestratorService`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/services/ai-orchestrator.service.ts#L22) executes a budget check via [`AiBudgetService.checkBudget()`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/services/ai-budget.service.ts#L18).

If current spend matches or exceeds ₹1,000 (100% capacity), the request is instantly rejected with error:
`AI_MONTHLY_BUDGET_EXHAUSTED: ₹1,000 monthly AI budget ceiling reached.`

---

## 3. Warning Threshold Tiers

The `AiBudgetService` calculates usage against 4 alert levels:

- **`NONE`**: `< 70%` spend.
- **`WARNING_70`**: `70% - 89%` spend.
- **`WARNING_90`**: `90% - 99%` spend.
- **`EXHAUSTED_100`**: `100%` spend (hard stop enforced).

---

## 4. Financial Audit Ledger

Every invocation records an entry in `ai_usage_ledger`:
```sql
CREATE TABLE ai_usage_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    request_id UUID NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    capability TEXT NOT NULL,
    input_tokens INT NOT NULL,
    output_tokens INT NOT NULL,
    estimated_cost_inr NUMERIC(10,4) NOT NULL,
    usage_date DATE NOT NULL,
    usage_month TEXT NOT NULL
);
```
