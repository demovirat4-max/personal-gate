import { describe, it, expect } from 'vitest';
import { PHASE_1_MISSION_FIXTURE, MissionDashboardFixtureSchema } from '@/features/mission/fixtures/mission.fixture';

describe('Fixture Schema Runtime Validation', () => {
  it('validates Phase 1 Mission Fixture against Zod schema without throwing', () => {
    const parsed = MissionDashboardFixtureSchema.parse(PHASE_1_MISSION_FIXTURE);
    expect(parsed.examSettings.paper).toContain('GATE CS');
    expect(parsed.todaysMission.length).toBe(3);
    expect(parsed.dailyProgress.plannedMinutes).toBe(180);
  });

  it('rejects invalid fixture data structure', () => {
    const invalidFixture = {
      ...PHASE_1_MISSION_FIXTURE,
      todaysMission: [
        {
          id: 'invalid-task',
          taskType: 'UNKNOWN_TYPE', // Invalid enum
        },
      ],
    };

    expect(() => MissionDashboardFixtureSchema.parse(invalidFixture)).toThrow();
  });
});
