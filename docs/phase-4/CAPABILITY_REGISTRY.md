# AI Capability Registry Specification

> **GATE AIR-1 Command Center** · Registered AI Capabilities & Parameter Configurations

---

## Capabilities Specification ([`capability.registry.ts`](file:///c:/Users/yaksh/Downloads/personal%20gate/src/server/ai/capability.registry.ts))

The system registers 6 core capabilities, each tailored with specific output token limits, temperatures, and system instructions to ensure grounded academic outputs:

| Capability Enum | Display Name | Max Tokens | Temp | System Instruction Summary |
|-----------------|--------------|------------|------|----------------------------|
| `LESSON_SUMMARY` | Lesson Summary | 1024 | 0.2 | Provide concise, grounded summaries using only provided lesson context. Do not invent formulas or external facts. |
| `STUDY_NOTES` | Structured Study Notes | 1536 | 0.3 | Format output as structured markdown study notes with Headings, Key Definitions, and Core Formulas. Ground strictly in provided material. |
| `CONCEPT_EXPLANATION` | Concept Explanation | 1024 | 0.4 | Explain the requested concept clearly for GATE CS aspirants. Use step-by-step logic and mathematical clarity. |
| `FLASHCARD_GENERATION` | Flashcard Generation | 1024 | 0.3 | Generate JSON structured flashcards (front/back) covering key terms and definitions from the grounded context. |
| `MISTAKE_ANALYSIS` | Mistake Analysis | 1024 | 0.2 | Analyze why the user selected an incorrect answer. Provide the conceptual error, correct logic, and a 1-sentence prevention rule. |
| `AI_COACH` | GATE AI Coach | 1024 | 0.5 | You are the personal GATE CS 2028 Command Center AI Coach. Answer student questions using current learning progress and Daily Mission context. |

---

## Validation & Type Safety

Capabilities are validated using Zod schemas (`CapabilityTypeSchema`) at API boundaries to prevent invalid capability invocations.
