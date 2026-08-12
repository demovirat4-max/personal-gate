# Streaming Protocol Specification

> **GATE AIR-1 Command Center** · Real-Time SSE Delta Streaming Specification

---

## Protocol Design

The streaming engine uses Server-Sent Events (SSE) / Async Generators to deliver real-time token streams to client interfaces ([`ai-provider.contract.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/contracts/ai/ai-provider.contract.ts)).

---

## Event Lifecycle & Chunk Contracts

Streaming chunks follow a strict schema tagged by `type`:

1. **`ACCEPTED`**: Immediate acknowledgement upon request dispatch.
   ```json
   { "type": "ACCEPTED" }
   ```
2. **`DELTA`**: Incremental token stream payload.
   ```json
   { "type": "DELTA", "deltaText": "Algorithm " }
   ```
3. **`COMPLETED`**: Stream completion with token usage and cost accounting.
   ```json
   {
     "type": "COMPLETED",
     "finishReason": "stop",
     "usage": {
       "inputTokens": 120,
       "outputTokens": 85,
       "totalTokens": 205,
       "estimatedCostInr": 0.0103
     }
   }
   ```
4. **`FAILED`**: Exception or user cancellation state.
   ```json
   { "type": "FAILED", "error": "Stream cancelled by user" }
   ```

---

## Abort & Cancellation Signals

Streams accept standard Web API `AbortSignal` parameters ([`NvidiaZzlmProvider.stream`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/ai/nvidia-zzlm.provider.ts#L65)). When `signal.aborted` is detected, stream generation terminates immediately and emits a `FAILED` event.
