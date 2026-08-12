# AI Assistance Boundary Policy

## Boundary Guidelines
1. **Deterministic Core**: Spaced repetition interval algorithms (`PureFlashcardSchedulerEngine`) and mastery calculations MUST remain 100% deterministic pure TypeScript functions. AI models are strictly barred from modifying review intervals directly.
2. **Generative Assistance Scope**: AI models (NVIDIA NIM / LLM API) are restricted to:
   - Summarizing notes into flashcard Q&A pairs.
   - Formatting LaTeX expressions.
   - Explaining mistake root causes upon user request.
3. **Explicit Source Tagging**: Any content created with AI assistance MUST set `source_type = 'AI_ASSISTED'` and populate `provenance.ai_model`.
