import { describe, it, expect } from 'vitest';
import { PureScoringEngine } from '@/server/ai/pure-scoring.engine';

describe('Phase 7 Pure Scoring Engine Unit Tests', () => {
  it('awards full marks for correct MCQ and applies negative marking for wrong MCQ', () => {
    const correctRes = PureScoringEngine.evaluateQuestion({
      questionType: 'MCQ',
      userAnswerPayload: 'B',
      correctAnswerSnapshot: 'B',
      marks: 2.0,
      negativeMarks: 0.66,
    });
    expect(correctRes.status).toBe('CORRECT');
    expect(correctRes.awardedMarks).toBe(2.0);

    const wrongRes = PureScoringEngine.evaluateQuestion({
      questionType: 'MCQ',
      userAnswerPayload: 'A',
      correctAnswerSnapshot: 'B',
      marks: 2.0,
      negativeMarks: 0.66,
    });
    expect(wrongRes.status).toBe('INCORRECT');
    expect(wrongRes.awardedMarks).toBe(-0.66);
  });

  it('evaluates MSQ exact match without negative marking', () => {
    const correctRes = PureScoringEngine.evaluateQuestion({
      questionType: 'MSQ',
      userAnswerPayload: ['A', 'C'],
      correctAnswerSnapshot: ['A', 'C'],
      marks: 2.0,
      negativeMarks: 0.0,
    });
    expect(correctRes.status).toBe('CORRECT');
    expect(correctRes.awardedMarks).toBe(2.0);

    const partialRes = PureScoringEngine.evaluateQuestion({
      questionType: 'MSQ',
      userAnswerPayload: ['A'],
      correctAnswerSnapshot: ['A', 'C'],
      marks: 2.0,
      negativeMarks: 0.0,
    });
    expect(partialRes.status).toBe('INCORRECT');
    expect(partialRes.awardedMarks).toBe(0.0);
  });

  it('evaluates NAT decimal tolerance without negative marking', () => {
    const res = PureScoringEngine.evaluateQuestion({
      questionType: 'NAT_DECIMAL',
      userAnswerPayload: 3.1415,
      correctAnswerSnapshot: { min: 3.14, max: 3.15 },
      marks: 1.0,
      negativeMarks: 0.0,
    });
    expect(res.status).toBe('CORRECT');
    expect(res.awardedMarks).toBe(1.0);
  });
});
