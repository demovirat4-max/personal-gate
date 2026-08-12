import { describe, it, expect } from 'vitest';
import { NvidiaZzlmProvider } from '@/server/ai/nvidia-zzlm.provider';

describe('NVIDIA ZZLM Provider Adapter Tests', () => {
  it('instantiates provider with nvidia-zzlm ID', () => {
    const provider = new NvidiaZzlmProvider();
    expect(provider.id).toBe('nvidia-zzlm');
  });

  it('safely generates grounded fallback when API key is missing', async () => {
    const provider = new NvidiaZzlmProvider();
    const res = await provider.generate({
      requestId: 'test-req-123',
      capability: 'LESSON_SUMMARY',
      systemInstruction: 'Test instruction',
      groundedContext: 'Test grounded context',
    });

    expect(res.provider).toBe('nvidia-zzlm');
    expect(res.requestId).toBe('test-req-123');
    expect(res.output).toContain('NVIDIA Nemotron');
    expect(res.inputTokens).toBeGreaterThan(0);
  });
});
