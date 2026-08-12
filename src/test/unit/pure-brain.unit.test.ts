import { describe, it, expect } from 'vitest';
import { PureBrainContextEngine } from '@/server/ai/pure-brain-context.engine';
import { PureBrainDecisionEngine } from '@/server/ai/pure-brain-decision.engine';

describe('Phase 10 Pure Brain Engine Unit Tests', () => {
  it('builds a deterministic Brain Snapshot with input fingerprinting', () => {
    const res = PureBrainContextEngine.buildSnapshot(
      {
        lessonsCompleted: 15,
        openMistakesCount: 3,
        dueRevisionsCount: 5,
        pyqCount: 120,
        notesCount: 8,
        profileMode: 'BALANCED',
      },
      'COMMAND'
    );

    expect(res.snapshotVersion).toBe('v1.0.0');
    expect(res.inputFingerprint).toBe('snap_COMMAND_15_3_5');
    expect(res.contextPayload.learning.lessonsCompleted).toBe(15);
    expect(res.contextPayload.revision.dueRevisionsCount).toBe(5);
  });

  it('evaluates candidate decisions with closed reason codes', () => {
    const decisions = PureBrainDecisionEngine.evaluateDecisions({
      revision: { dueRevisionsCount: 4 },
      practice: { openMistakesCount: 2 },
    });

    expect(decisions.length).toBe(2);
    expect(decisions[0].decisionType).toBe('REVISE_TOPIC');
    expect(decisions[0].reasonCodes).toContain('REVISION_DUE_TODAY');
    expect(decisions[1].decisionType).toBe('REVIEW_MISTAKES');
    expect(decisions[1].reasonCodes).toContain('OPEN_MISTAKES_HIGH');
  });
});
