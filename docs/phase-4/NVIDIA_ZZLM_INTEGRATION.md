# NVIDIA ZZLM 5.2 Provider Integration

> **GATE AIR-1 Command Center** · Primary LLM Integration Details

---

## 1. Provider Overview

- **Provider Identifier**: `nvidia-zzlm`
- **Default Model**: `zzlm-5.2` (configurable via `ZZLM_MODEL` environment variable)
- **Base Endpoint**: `https://integrate.api.nvidia.com/v1` (configurable via `ZZLM_BASE_URL`)
- **Authentication**: `Authorization: Bearer ${ZZLM_API_KEY}`

---

## 2. Configuration & Environment Variables

| Variable Name | Required | Default Value | Description |
|---------------|----------|---------------|-------------|
| `ZZLM_API_KEY` | Optional (Demo mode fallback if missing) | `fake-key-fallback` | NVIDIA NIM API Bearer Token |
| `ZZLM_BASE_URL` | Optional | `https://integrate.api.nvidia.com/v1` | NIM API Base Gateway |
| `ZZLM_MODEL` | Optional | `zzlm-5.2` | Target model engine tag |
| `AI_MONTHLY_BUDGET_INR` | Optional | `1000` | Monthly spending cap in INR |

---

## 3. Pricing Calculation Model

Costs are normalized in Indian Rupees (INR) based on token usage:
$$\text{Cost (INR)} = \frac{\text{Input Tokens} + \text{Output Tokens}}{1000} \times 0.05$$

Every response reports estimated costs, allowing real-time tracking in the `ai_usage_ledger` database table.

---

## 4. Fallback Behavior

When `ZZLM_API_KEY` is not present, the provider seamlessly switches to safe offline mock generation ([`nvidia-zzlm.provider.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/ai/nvidia-zzlm.provider.ts#L92-L105)), returning deterministic grounded output and fixed token accounting for test/dev stability.
