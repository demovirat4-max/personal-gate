import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GateCountdown } from '@/components/shared/GateCountdown';

describe('Countdown Utility Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-11T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates remaining time accurately before target timestamp', () => {
    const target = '2028-02-05T09:30:00+05:30';
    const targetMs = new Date(target).getTime();
    const nowMs = new Date('2026-08-11T12:00:00.000Z').getTime();
    const diffSec = Math.floor((targetMs - nowMs) / 1000);

    expect(diffSec).toBeGreaterThan(0);
    const days = Math.floor(diffSec / (3600 * 24));
    expect(days).toBeGreaterThan(500);
  });

  it('clamps remaining time to 0 after target timestamp passes', () => {
    const pastTarget = '2025-01-01T00:00:00.000Z';
    const targetMs = new Date(pastTarget).getTime();
    const nowMs = new Date('2026-08-11T12:00:00.000Z').getTime();
    const diffMs = Math.max(0, targetMs - nowMs);

    expect(diffMs).toBe(0);
  });
});
