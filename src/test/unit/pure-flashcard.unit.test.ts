import { describe, it, expect } from 'vitest';
import { PureFlashcardSchedulerEngine } from '@/server/ai/pure-flashcard.engine';

describe('Phase 6 Pure Flashcard Scheduler Unit Tests', () => {
  it('resets interval and increments lapse count on AGAIN rating', () => {
    const now = new Date().toISOString();
    const res = PureFlashcardSchedulerEngine.scheduleNextReview({
      status: 'REVIEW',
      rating: 'AGAIN',
      currentIntervalDays: 10,
      consecutiveSuccesses: 3,
      lapseCount: 1,
      lastReviewedAt: null,
      reviewedAt: now,
    });

    expect(res.nextState).toBe('RELEARNING');
    expect(res.intervalDays).toBe(1);
    expect(res.consecutiveSuccesses).toBe(0);
    expect(res.lapseCount).toBe(2);
    expect(res.reasonCodes).toContain('LAPSE_RESET');
  });

  it('multiplies interval on GOOD rating', () => {
    const now = new Date().toISOString();
    const res = PureFlashcardSchedulerEngine.scheduleNextReview({
      status: 'REVIEW',
      rating: 'GOOD',
      currentIntervalDays: 4,
      consecutiveSuccesses: 2,
      lapseCount: 0,
      lastReviewedAt: null,
      reviewedAt: now,
    });

    expect(res.nextState).toBe('REVIEW');
    expect(res.intervalDays).toBe(8);
    expect(res.consecutiveSuccesses).toBe(3);
    expect(res.reasonCodes).toContain('GOOD_STANDARD_INCREASE');
  });
});
