# Prompt Template Policy

> **GATE AIR-1 Command Center** · Prompt Engineering Standards & Security Isolation

---

## 1. System Instruction Structure

System instructions are defined immutably per capability in [`capability.registry.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/ai/capability.registry.ts). They dictate:
- Role identity (e.g., "GATE CS 2028 Academic Coach")
- Output format expectations (e.g., Markdown headers, definitions, structured JSON)
- Anti-hallucination boundaries ("Use only provided lesson context. Do not invent formulas or external facts.")

---

## 2. Prompt Injection Defense Structure

In [`NvidiaZzlmProvider.generate`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/ai/nvidia-zzlm.provider.ts#L31-L34), user input is strictly separated from system directives:

```typescript
messages: [
  { role: 'system', content: request.systemInstruction },
  { role: 'user', content: `Context:\n${request.groundedContext}\n\nTask: ${request.userInput || ''}` },
]
```

### Safety Enforcements
- System instructions remain isolated in `role: 'system'`.
- Grounded context is wrapped distinctly from optional user prompts.
- User input cannot override system capability rules or model parameters.
