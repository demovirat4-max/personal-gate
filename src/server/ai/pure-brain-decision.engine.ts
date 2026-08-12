import { DecisionType, BrainDecision } from '@/contracts/brain/brain.contract';

export class PureBrainDecisionEngine {
  static readonly VERSION = 'v1.0.0';

  /**
   * Evaluates system state and returns deterministic candidate decisions with closed reason codes
   */
  static evaluateDecisions(snapshotPayload: Record<string, any>): Partial<BrainDecision>[] {
    const decisions: Partial<BrainDecision>[] = [];

    const dueRevisions = snapshotPayload.revision?.dueRevisionsCount || 0;
    const openMistakes = snapshotPayload.practice?.openMistakesCount || 0;

    if (dueRevisions > 0) {
      decisions.push({
        decisionType: 'REVISE_TOPIC',
        priority: 1,
        title: `Spaced Revision Due (${dueRevisions} items)`,
        summary: `You have ${dueRevisions} topics waiting in your 1-3-7-14-30 spaced repetition queue.`,
        reasonCodes: ['REVISION_DUE_TODAY', 'REVISION_OVERDUE'],
        requiresConfirmation: true,
      });
    }

    if (openMistakes > 0) {
      decisions.push({
        decisionType: 'REVIEW_MISTAKES',
        priority: 2,
        title: `Mistake Vault Review (${openMistakes} questions)`,
        summary: `Review failed quiz questions and analyze error causes in your mistake vault.`,
        reasonCodes: ['OPEN_MISTAKES_HIGH'],
        requiresConfirmation: true,
      });
    }

    if (decisions.length === 0) {
      decisions.push({
        decisionType: 'STUDY_NEXT',
        priority: 3,
        title: 'Continue GATE CS Curriculum',
        summary: 'All revisions and mistakes are cleared. Continue with next lecture in syllabus.',
        reasonCodes: ['TODAY_MISSION_INCOMPLETE'],
        requiresConfirmation: true,
      });
    }

    return decisions;
  }
}
