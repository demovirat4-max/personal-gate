import { describe, it, expect } from 'vitest';
import { PurePlanningEngine } from '@/server/ai/pure-planning.engine';

describe('Phase 8 Pure Planning Engine Unit Tests', () => {
  it('generates deterministic 7-day schedule blocks matching weekly study budget', () => {
    const res = PurePlanningEngine.generateSchedule({
      weeklyStudyMinutes: 1400,
      strategyMode: 'BALANCED',
      startDate: '2026-08-15',
      daysCount: 7,
    });

    expect(res.planningVersion).toBe('v1.0.0');
    expect(res.blocks.length).toBe(14); // 2 blocks per day for 7 days
    expect(res.totalAllocatedMinutes).toBe(1400);
    expect(res.rationaleCodes).toContain('STRATEGY_MODE_BALANCED');
  });

  it('allocates revision heavy blocks when strategy mode is REVISION_HEAVY', () => {
    const res = PurePlanningEngine.generateSchedule({
      weeklyStudyMinutes: 1050,
      strategyMode: 'REVISION_HEAVY',
      startDate: '2026-08-15',
      daysCount: 7,
    });

    expect(res.blocks[0].activityType).toBe('REVISION');
    expect(res.blocks[1].activityType).toBe('MISTAKE_REVIEW');
  });
});
