import { describe, it, expect } from 'vitest';
import { PureContentCoverageEngine } from '@/server/ai/pure-coverage.engine';

describe('Phase 9 Pure Content Coverage Engine Unit Tests', () => {
  it('calculates deterministic PYQ coverage ratio and health index', () => {
    const res = PureContentCoverageEngine.calculateCoverage({
      totalSubjects: 11,
      totalTopics: 50,
      totalLectures: 120,
      totalQuestions: 100,
      verifiedPyqCount: 80,
      unverifiedQuestionCount: 5,
      missingAnswerCount: 0,
      videoNeedsReviewCount: 2,
    });

    expect(res.coverageVersion).toBe('v1.0.0');
    expect(res.pyqCoverageRatio).toBe(0.8);
    expect(res.questionHealthRatio).toBe(0.95);
    expect(res.qualityIssueCodes).toContain('UNVERIFIED_OFFICIAL_CLAIM');
    expect(res.qualityIssueCodes).toContain('RESOURCE_NEEDS_REVIEW');
  });

  it('detects missing verified PYQs when count is zero', () => {
    const res = PureContentCoverageEngine.calculateCoverage({
      totalSubjects: 11,
      totalTopics: 50,
      totalLectures: 120,
      totalQuestions: 10,
      verifiedPyqCount: 0,
      unverifiedQuestionCount: 0,
      missingAnswerCount: 0,
      videoNeedsReviewCount: 0,
    });

    expect(res.pyqCoverageRatio).toBe(0.0);
    expect(res.qualityIssueCodes).toContain('MISSING_VERIFIED_PYQS');
  });
});
