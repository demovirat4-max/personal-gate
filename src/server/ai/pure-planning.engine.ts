import { StrategyMode, ActivityType } from '@/contracts/strategy/strategy.contract';

export interface PlanningInput {
  weeklyStudyMinutes: number;
  strategyMode: StrategyMode;
  startDate: string; // ISO Date YYYY-MM-DD
  daysCount?: number;
}

export interface GeneratedBlock {
  blockDate: string;
  plannedMinutes: number;
  activityType: ActivityType;
  title: string;
  rationaleCodes: string[];
  priority: number;
  position: number;
}

export interface PlanningOutput {
  planningVersion: string;
  inputFingerprint: string;
  totalAllocatedMinutes: number;
  blocks: GeneratedBlock[];
  rationaleCodes: string[];
  limitations: string[];
}

export class PurePlanningEngine {
  static readonly VERSION = 'v1.0.0';

  /**
   * Pure deterministic schedule generator based on strategy mode and weekly time budget
   */
  static generateSchedule(input: PlanningInput): PlanningOutput {
    const daysCount = input.daysCount || 7;
    const dailyBudget = Math.floor(input.weeklyStudyMinutes / 7);
    const start = new Date(input.startDate);

    const blocks: GeneratedBlock[] = [];
    let totalAllocated = 0;
    const mainRationale = [`STRATEGY_MODE_${input.strategyMode}`, 'BALANCED_DISTRIBUTION'];

    for (let i = 0; i < daysCount; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      // Divide daily budget into 2 focused blocks: 1 primary study/learn, 1 revision/practice
      const mainBlockMinutes = Math.floor(dailyBudget * 0.65);
      const secondBlockMinutes = dailyBudget - mainBlockMinutes;

      let primaryType: ActivityType = 'LEARN';
      let secondaryType: ActivityType = 'REVISION';

      if (input.strategyMode === 'REVISION_HEAVY') {
        primaryType = 'REVISION';
        secondaryType = 'MISTAKE_REVIEW';
      } else if (input.strategyMode === 'PYQ_HEAVY') {
        primaryType = 'PYQ';
        secondaryType = 'QUIZ';
      } else if (input.strategyMode === 'MOCK_FOCUSED') {
        primaryType = 'MOCK';
        secondaryType = 'REVISION';
      }

      blocks.push({
        blockDate: dateStr,
        plannedMinutes: mainBlockMinutes,
        activityType: primaryType,
        title: `${primaryType} Core Session - Day ${i + 1}`,
        rationaleCodes: ['FOUNDATION_GAP', 'CURRICULUM_PREREQUISITE'],
        priority: 1,
        position: 1,
      });

      blocks.push({
        blockDate: dateStr,
        plannedMinutes: secondBlockMinutes,
        activityType: secondaryType,
        title: `${secondaryType} Reinforcement - Day ${i + 1}`,
        rationaleCodes: ['DUE_REVISION', 'OPEN_MISTAKE'],
        priority: 2,
        position: 2,
      });

      totalAllocated += dailyBudget;
    }

    const fingerprint = `plan_${input.strategyMode}_${input.weeklyStudyMinutes}_${input.startDate}`;

    return {
      planningVersion: PurePlanningEngine.VERSION,
      inputFingerprint: fingerprint,
      totalAllocatedMinutes: totalAllocated,
      blocks,
      rationaleCodes: mainRationale,
      limitations: ['SCHEDULE_ASSUMES_STABLE_DAILY_AVAILABILITY', 'NON_PREDICTIVE_GOAL_ALIGNMENT'],
    };
  }
}
