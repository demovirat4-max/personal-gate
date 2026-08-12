import { describe, it, expect } from 'vitest';
import { PureMasteryEngine } from '@/server/ai/pure-mastery.engine';

describe('Phase 5 Pure Mastery Engine Unit Tests', () => {
  it('returns NOT_STARTED when zero evidence exists', () => {
    const res = PureMasteryEngine.calculateTopicMastery({
      topicId: 'topic-1',
      subjectId: 'subject-1',
      quizAttemptsCount: 0,
      quizAverageAccuracy: null,
      openMistakesCount: 0,
      reviewedMistakesCount: 0,
      dueRevisionsCount: 0,
      completedRevisionsCount: 0,
      completedLecturesCount: 0,
      totalLecturesCount: 10,
      lastActivityAt: null,
    });

    expect(res.classification).toBe('NOT_STARTED');
    expect(res.masteryScore).toBe(0);
    expect(res.confidenceScore).toBe(0);
  });

  it('calculates MASTERED classification when accuracy and confidence are high', () => {
    const res = PureMasteryEngine.calculateTopicMastery({
      topicId: 'topic-1',
      subjectId: 'subject-1',
      quizAttemptsCount: 5,
      quizAverageAccuracy: 95,
      openMistakesCount: 0,
      reviewedMistakesCount: 2,
      dueRevisionsCount: 0,
      completedRevisionsCount: 4,
      completedLecturesCount: 10,
      totalLecturesCount: 10,
      lastActivityAt: new Date().toISOString(),
    });

    expect(res.classification).toBe('MASTERED');
    expect(res.masteryScore).toBeGreaterThanOrEqual(85);
    expect(res.confidenceScore).toBeGreaterThanOrEqual(70);
  });
});
