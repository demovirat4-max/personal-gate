export interface RawSystemContext {
  lessonsCompleted: number;
  openMistakesCount: number;
  dueRevisionsCount: number;
  pyqCount: number;
  notesCount: number;
  profileMode: string;
}

export interface BrainSnapshotResult {
  snapshotVersion: string;
  inputFingerprint: string;
  asOf: string;
  contextPayload: Record<string, any>;
  sourceReferences: string[];
  limitations: string[];
}

export class PureBrainContextEngine {
  static readonly VERSION = 'v1.0.0';

  /**
   * Deterministically aggregates multi-module evidence into a versioned Brain Snapshot
   */
  static buildSnapshot(input: RawSystemContext, triggerType: string): BrainSnapshotResult {
    const fingerprint = `snap_${triggerType}_${input.lessonsCompleted}_${input.openMistakesCount}_${input.dueRevisionsCount}`;

    return {
      snapshotVersion: PureBrainContextEngine.VERSION,
      inputFingerprint: fingerprint,
      asOf: new Date().toISOString(),
      contextPayload: {
        learning: { lessonsCompleted: input.lessonsCompleted },
        practice: { openMistakesCount: input.openMistakesCount },
        revision: { dueRevisionsCount: input.dueRevisionsCount },
        exam: { verifiedPyqCount: input.pyqCount },
        knowledge: { notesCount: input.notesCount },
        strategy: { mode: input.profileMode },
      },
      sourceReferences: [
        'subjects',
        'topics',
        'question_bank_questions',
        'revisions',
        'mistakes',
        'preparation_profiles',
      ],
      limitations: ['SINGLE_USER_LOCAL_TELEMETRY', 'EXCLUDES_UNCOMMITTED_DRAFTS'],
    };
  }
}
