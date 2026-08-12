export interface ContentCoverageInput {
  totalSubjects: number;
  totalTopics: number;
  totalLectures: number;
  totalQuestions: number;
  verifiedPyqCount: number;
  unverifiedQuestionCount: number;
  missingAnswerCount: number;
  videoNeedsReviewCount: number;
}

export interface ContentCoverageSnapshot {
  coverageVersion: string;
  inputFingerprint: string;
  calculatedAt: string;
  pyqCoverageRatio: number;
  questionHealthRatio: number;
  qualityIssueCodes: string[];
  limitations: string[];
}

export class PureContentCoverageEngine {
  static readonly VERSION = 'v1.0.0';

  /**
   * Deterministically calculates GATE CS content coverage, PYQ verification ratio, and audit issues
   */
  static calculateCoverage(input: ContentCoverageInput): ContentCoverageSnapshot {
    const totalQ = Math.max(1, input.totalQuestions);
    const pyqRatio = parseFloat((input.verifiedPyqCount / totalQ).toFixed(4));
    const validQCount = totalQ - input.missingAnswerCount - input.unverifiedQuestionCount;
    const healthRatio = parseFloat((Math.max(0, validQCount) / totalQ).toFixed(4));

    const issues: string[] = [];
    if (input.verifiedPyqCount === 0) issues.push('MISSING_VERIFIED_PYQS');
    if (input.missingAnswerCount > 0) issues.push('MISSING_QUESTION_ANSWERS');
    if (input.unverifiedQuestionCount > 0) issues.push('UNVERIFIED_OFFICIAL_CLAIM');
    if (input.videoNeedsReviewCount > 0) issues.push('RESOURCE_NEEDS_REVIEW');

    const fingerprint = `cov_${input.totalSubjects}_${input.verifiedPyqCount}_${input.missingAnswerCount}`;

    return {
      coverageVersion: PureContentCoverageEngine.VERSION,
      inputFingerprint: fingerprint,
      calculatedAt: new Date().toISOString(),
      pyqCoverageRatio: pyqRatio,
      questionHealthRatio: healthRatio,
      qualityIssueCodes: issues,
      limitations: ['COVERAGE_LIMITED_TO_STORED_GATE_CS_FIXTURES', 'NON_AUTHORITATIVE_FOR_UNINDEXED_YEARS'],
    };
  }
}
