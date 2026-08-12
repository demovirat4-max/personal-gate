# AI Architecture Specification (Provider-Independent Layer)

## 1. Provider-Independent Abstraction Layer

The AI module is strictly provider-independent. It exposes an OpenAI-compatible payload contract `AiProvider` that targets **ZZLM 5.2 via NVIDIA NIM (`build.nvidia.com`)** as its initial configured adapter, while allowing seamless switching to OpenAI, Anthropic, or local Ollama instances via server configuration.

```typescript
// src/lib/ai/ai-provider.interface.ts
export interface AiCompletionRequest {
  capabilityId: string;
  systemPrompt: string;
  userPrompt: string;
  jsonSchema: z.ZodTypeAny; // Mandatory Zod schema for structured output
  temperature?: number;
  maxTokens?: number;
}

export interface AiProvider {
  generateCompletion<T>(request: AiCompletionRequest): Promise<T>;
}
```

## 2. Configurable Budget, Rate Limits & Hard Ceiling Protocol

To adhere to the confirmed **₹1,000 INR per month hard budget**, the server-side AI manager enforces strict pre-execution checks before calling external APIs:

```text
Incoming AI Request -> Check Server AI Controls:
  ├── 1. Check Monthly Cost Sum (ai_usage_logs for current calendar month)
  │      ├── If >= ₹1,000 INR (100%): REJECT request with AI_BUDGET_EXCEEDED (429)
  │      ├── If >= ₹900 INR (90%): WARN in response meta + proceed for essential prompts
  │      └── If >= ₹700 INR (70%): Log usage warning alert
  ├── 2. Check Daily Request Count vs Configured Ceiling
  ├── 3. Check Per-Capability Token Limits & Concurrency Guards
  └── If Allowed -> Dispatch HTTP Request with Server Timeout & Retry Limit
```

### Configurable Server AI Control Properties (Not Hardcoded)

| Control Property | Environment / Server Setting Key | Initial Default Value |
| :--- | :--- | :--- |
| **Monthly Hard Budget Ceiling** | `AI_MONTHLY_BUDGET_INR` | `1000.00` (₹1,000 INR) |
| **Daily Request Limit** | `AI_DAILY_REQUEST_CEILING` | `100 requests` |
| **Per-Capability Max Output Tokens**| `AI_MAX_OUTPUT_TOKENS` | `1024 tokens` |
| **Request Timeout** | `AI_REQUEST_TIMEOUT_MS` | `10000` (10 seconds) |
| **Retry Limit** | `AI_RETRY_LIMIT` | `1 retry` |
| **Concurrency Ceiling** | `AI_CONCURRENCY_LIMIT` | `3 concurrent requests` |

## 3. Capability Registry & Structured Prompt Contracts

| Capability ID | Purpose | Zod Output Schema |
| :--- | :--- | :--- |
| `CONCEPT_EXPLAINER` | Explain complex GATE CS concepts | `z.object({ markdownText: z.string(), keyFormulas: z.array(z.string()), commonPitfalls: z.array(z.string()) })` |
| `MISTAKE_ANALYZER` | Diagnose failure root cause in PYQ | `z.object({ rootCause: z.enum(['CONCEPTUAL', 'CALCULATION', 'MISREAD']), correctiveStep: z.string() })` |
| `QUIZ_GENERATOR` | Generate 3-5 NAT/MCQ questions | `z.array(QuestionSchema)` |
| `MENTOR_DAILY_BRIEF`| Generate daily motivational summary | `z.object({ briefMarkdown: z.string(), priorityFocusTopic: z.string() })` |

## 4. Operational Integrity Safeguards

1. **Standalone Core Operations**: All study scheduling, countdown calculations, video tracking, spaced repetition queues, and PYQ tests run 100% deterministically without AI. Reaching the AI budget limit does not impact core study tracking.
2. **Strict Verification Branding**: AI-generated questions or formulas are **never** labeled as verified GATE PYQs or seed formulas.
