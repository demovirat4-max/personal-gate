# AI Provider Architecture Specification

> **GATE AIR-1 Command Center** · Multi-Provider Abstraction & Contract Architecture

---

## Architecture Blueprint

The AI Subsystem follows an Abstraction Adapter pattern separating business logic from raw model API details.

```
       +---------------------------------------------+
       |   Client Components / Next.js API Routes    |
       +---------------------------------------------+
                              |
                              v
       +---------------------------------------------+
       |       AiOrchestratorService                 |
       |  (Budget Check, Context Build, Persistence) |
       +---------------------------------------------+
                              |
                              v
       +---------------------------------------------+
       |             AiProvider Interface            |
       |     (Contracts: generate() & stream())      |
       +---------------------------------------------+
                              |
                              v
       +---------------------------------------------+
       |           NvidiaZzlmProvider                |
       |  (NVIDIA NIM REST Endpoint / SSE Generator) |
       +---------------------------------------------+
```

---

## Core Interfaces

### `AiProvider` Interface ([`ai-provider.interface.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/ai/ai-provider.interface.ts))

```typescript
export interface AiProvider {
  id: string;
  generate(request: NormalizedAiRequest): Promise<NormalizedAiResponse>;
  stream(request: NormalizedAiRequest, signal?: AbortSignal): AsyncIterable<NormalizedStreamChunk>;
}
```

### Normalized Data Contracts ([`ai-provider.contract.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/contracts/ai/ai-provider.contract.ts))

- **`NormalizedAiRequest`**: Encapsulates `requestId`, `capability`, `systemInstruction`, `groundedContext`, `userInput`, `maxTokens`, and `temperature`.
- **`NormalizedAiResponse`**: Standardized output payload containing output text, token counts (`inputTokens`, `outputTokens`, `totalTokens`), `finishReason`, and `estimatedCostInr`.
- **`NormalizedStreamChunk`**: Delta streaming payload structure supporting lifecycle states (`ACCEPTED`, `DELTA`, `COMPLETED`, `FAILED`).
