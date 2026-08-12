import { FlashcardRating } from '@/contracts/knowledge/knowledge.contract';

export interface FlashcardStateInput {
  status: 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING' | 'SUSPENDED';
  rating: FlashcardRating;
  currentIntervalDays: number;
  consecutiveSuccesses: number;
  lapseCount: number;
  lastReviewedAt: string | null;
  reviewedAt: string;
}

export interface FlashcardStateOutput {
  nextState: 'LEARNING' | 'REVIEW' | 'RELEARNING' | 'SUSPENDED';
  dueAt: string;
  intervalDays: number;
  consecutiveSuccesses: number;
  lapseCount: number;
  algorithmVersion: string;
  inputFingerprint: string;
  reasonCodes: string[];
}

export class PureFlashcardSchedulerEngine {
  static readonly VERSION = 'v1.0.0';

  /**
   * Pure deterministic flashcard scheduling calculation
   */
  static scheduleNextReview(input: FlashcardStateInput): FlashcardStateOutput {
    let nextState: 'LEARNING' | 'REVIEW' | 'RELEARNING' | 'SUSPENDED' = 'REVIEW';
    let intervalDays = 1;
    let consecutiveSuccesses = input.consecutiveSuccesses;
    let lapseCount = input.lapseCount;
    const reasonCodes: string[] = [];

    switch (input.rating) {
      case 'AGAIN':
        nextState = 'RELEARNING';
        intervalDays = 1;
        consecutiveSuccesses = 0;
        lapseCount += 1;
        reasonCodes.push('LAPSE_RESET');
        break;

      case 'HARD':
        nextState = 'REVIEW';
        intervalDays = Math.max(1, Math.floor(input.currentIntervalDays * 1.2));
        consecutiveSuccesses += 1;
        reasonCodes.push('HARD_MODERATE_INCREASE');
        break;

      case 'GOOD':
        nextState = 'REVIEW';
        intervalDays = input.currentIntervalDays === 0 ? 1 : Math.max(2, Math.floor(input.currentIntervalDays * 2.0));
        consecutiveSuccesses += 1;
        reasonCodes.push('GOOD_STANDARD_INCREASE');
        break;

      case 'EASY':
        nextState = 'REVIEW';
        intervalDays = input.currentIntervalDays === 0 ? 4 : Math.max(4, Math.floor(input.currentIntervalDays * 2.5));
        consecutiveSuccesses += 1;
        reasonCodes.push('EASY_BONUS_INCREASE');
        break;
    }

    // Cap maximum interval at 365 days
    intervalDays = Math.min(365, intervalDays);

    const reviewDate = new Date(input.reviewedAt);
    reviewDate.setDate(reviewDate.getDate() + intervalDays);
    const dueAt = reviewDate.toISOString();

    const fingerprint = `sched_${input.status}_${input.rating}_${input.currentIntervalDays}_${intervalDays}`;

    return {
      nextState,
      dueAt,
      intervalDays,
      consecutiveSuccesses,
      lapseCount,
      algorithmVersion: PureFlashcardSchedulerEngine.VERSION,
      inputFingerprint: fingerprint,
      reasonCodes,
    };
  }
}
