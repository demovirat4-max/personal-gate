import { describe, it, expect } from 'vitest';
import { CAPABILITY_REGISTRY } from '@/server/ai/capability.registry';

describe('Phase 4 Unit Tests - AI Capabilities & Registry', () => {
  it('registers all 6 mandatory Phase 4 capabilities', () => {
    const keys = Object.keys(CAPABILITY_REGISTRY);
    expect(keys).toContain('LESSON_SUMMARY');
    expect(keys).toContain('STUDY_NOTES');
    expect(keys).toContain('CONCEPT_EXPLANATION');
    expect(keys).toContain('FLASHCARD_GENERATION');
    expect(keys).toContain('MISTAKE_ANALYSIS');
    expect(keys).toContain('AI_COACH');
  });

  it('enforces maximum output token limits per capability', () => {
    expect(CAPABILITY_REGISTRY.LESSON_SUMMARY.maxOutputTokens).toBeLessThanOrEqual(2048);
    expect(CAPABILITY_REGISTRY.STUDY_NOTES.maxOutputTokens).toBeLessThanOrEqual(2048);
  });
});
