import { QuestionType } from '@/contracts/exam/exam.contract';

export interface EvaluationInput {
  questionType: QuestionType;
  userAnswerPayload: any;
  correctAnswerSnapshot: any;
  marks: number;
  negativeMarks: number;
}

export interface EvaluationResult {
  status: 'CORRECT' | 'INCORRECT' | 'UNANSWERED' | 'INVALID';
  awardedMarks: number;
  maxMarks: number;
  reasonCodes: string[];
  evaluationVersion: string;
}

export class PureScoringEngine {
  static readonly VERSION = 'v1.0.0';

  /**
   * Evaluates an individual question answer deterministically according to GATE rules
   */
  static evaluateQuestion(input: EvaluationInput): EvaluationResult {
    const { questionType, userAnswerPayload, correctAnswerSnapshot, marks, negativeMarks } = input;

    // Check unanswered
    if (userAnswerPayload === null || userAnswerPayload === undefined || userAnswerPayload === '') {
      return {
        status: 'UNANSWERED',
        awardedMarks: 0,
        maxMarks: marks,
        reasonCodes: ['UNANSWERED_NO_PENALTY'],
        evaluationVersion: PureScoringEngine.VERSION,
      };
    }

    if (questionType === 'MCQ') {
      const isCorrect = String(userAnswerPayload).trim() === String(correctAnswerSnapshot).trim();
      if (isCorrect) {
        return {
          status: 'CORRECT',
          awardedMarks: marks,
          maxMarks: marks,
          reasonCodes: ['MCQ_EXACT_MATCH'],
          evaluationVersion: PureScoringEngine.VERSION,
        };
      } else {
        return {
          status: 'INCORRECT',
          awardedMarks: -Math.abs(negativeMarks),
          maxMarks: marks,
          reasonCodes: ['MCQ_MISMATCH_PENALTY'],
          evaluationVersion: PureScoringEngine.VERSION,
        };
      }
    }

    if (questionType === 'MSQ') {
      const userArr = Array.isArray(userAnswerPayload) ? userAnswerPayload.map(String).sort() : [];
      const correctArr = Array.isArray(correctAnswerSnapshot) ? correctAnswerSnapshot.map(String).sort() : [];

      const isExactMatch =
        userArr.length === correctArr.length && userArr.every((val, index) => val === correctArr[index]);

      if (isExactMatch) {
        return {
          status: 'CORRECT',
          awardedMarks: marks,
          maxMarks: marks,
          reasonCodes: ['MSQ_FULL_MATCH'],
          evaluationVersion: PureScoringEngine.VERSION,
        };
      } else {
        // GATE MSQ has NO negative marking
        return {
          status: 'INCORRECT',
          awardedMarks: 0,
          maxMarks: marks,
          reasonCodes: ['MSQ_INCOMPLETE_NO_PENALTY'],
          evaluationVersion: PureScoringEngine.VERSION,
        };
      }
    }

    if (questionType === 'NAT_INTEGER' || questionType === 'NAT_DECIMAL') {
      const userVal = parseFloat(userAnswerPayload);
      if (isNaN(userVal)) {
        return {
          status: 'INVALID',
          awardedMarks: 0,
          maxMarks: marks,
          reasonCodes: ['NAT_INVALID_NUMERIC'],
          evaluationVersion: PureScoringEngine.VERSION,
        };
      }

      let isCorrect = false;
      if (typeof correctAnswerSnapshot === 'number') {
        isCorrect = Math.abs(userVal - correctAnswerSnapshot) < 0.01;
      } else if (typeof correctAnswerSnapshot === 'object' && correctAnswerSnapshot !== null) {
        const min = correctAnswerSnapshot.min ?? correctAnswerSnapshot.exact;
        const max = correctAnswerSnapshot.max ?? correctAnswerSnapshot.exact;
        isCorrect = userVal >= min && userVal <= max;
      } else {
        isCorrect = parseFloat(correctAnswerSnapshot) === userVal;
      }

      if (isCorrect) {
        return {
          status: 'CORRECT',
          awardedMarks: marks,
          maxMarks: marks,
          reasonCodes: ['NAT_WITHIN_TOLERANCE'],
          evaluationVersion: PureScoringEngine.VERSION,
        };
      } else {
        // GATE NAT has NO negative marking
        return {
          status: 'INCORRECT',
          awardedMarks: 0,
          maxMarks: marks,
          reasonCodes: ['NAT_OUTSIDE_TOLERANCE_NO_PENALTY'],
          evaluationVersion: PureScoringEngine.VERSION,
        };
      }
    }

    return {
      status: 'INVALID',
      awardedMarks: 0,
      maxMarks: marks,
      reasonCodes: ['UNKNOWN_QUESTION_TYPE'],
      evaluationVersion: PureScoringEngine.VERSION,
    };
  }
}
