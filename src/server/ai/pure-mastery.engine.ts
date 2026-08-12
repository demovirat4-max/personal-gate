import { TopicMastery, MasteryClassification } from '@/contracts/learning/adaptive.contract';

export interface MasteryInputData {
  topicId: string;
  subjectId: string;
  quizAttemptsCount: number;
  quizAverageAccuracy: number | null; // 0..100
  openMistakesCount: number;
  reviewedMistakesCount: number;
  dueRevisionsCount: number;
  completedRevisionsCount: number;
  completedLecturesCount: number;
  totalLecturesCount: number;
  lastActivityAt: string | null;
}

export class PureMasteryEngine {
  static readonly VERSION = 'v1.0.0';

  /**
   * Deterministically calculates topic mastery score and confidence
   */
  static calculateTopicMastery(input: MasteryInputData): Omit<TopicMastery, 'id' | 'ownerId'> {
    const now = new Date().toISOString();

    // 1. Check if no evidence exists
    const totalEvidence =
      input.quizAttemptsCount +
      input.openMistakesCount +
      input.reviewedMistakesCount +
      input.completedRevisionsCount +
      input.completedLecturesCount;

    if (totalEvidence === 0) {
      return {
        subjectId: input.subjectId,
        topicId: input.topicId,
        masteryScore: 0,
        confidenceScore: 0,
        evidenceStrength: 0,
        classification: 'NOT_STARTED',
        algorithmVersion: PureMasteryEngine.VERSION,
        calculatedAt: now,
        evidenceThrough: now,
        inputFingerprint: this.hashInput(input),
        componentBreakdown: {
          assessmentPerformance: null,
          mistakeRecovery: null,
          revisionConsistency: null,
          lessonCoverage: null,
          recency: null,
        },
      };
    }

    // 2. Component Calculations (bounded 0..100)
    // Assessment Performance (40% weight)
    const assessmentPerformance = input.quizAverageAccuracy !== null ? input.quizAverageAccuracy : null;

    // Lesson Coverage (20% weight)
    const lessonCoverage =
      input.totalLecturesCount > 0 ? (input.completedLecturesCount / input.totalLecturesCount) * 100 : 0;

    // Mistake Recovery (20% weight)
    const totalMistakes = input.openMistakesCount + input.reviewedMistakesCount;
    const mistakeRecovery = totalMistakes > 0 ? (input.reviewedMistakesCount / totalMistakes) * 100 : 100;

    // Revision Consistency (20% weight)
    const totalRevisions = input.dueRevisionsCount + input.completedRevisionsCount;
    const revisionConsistency = totalRevisions > 0 ? (input.completedRevisionsCount / totalRevisions) * 100 : 100;

    // Calculate weighted score
    let totalWeight = 0;
    let weightedSum = 0;

    if (assessmentPerformance !== null) {
      weightedSum += assessmentPerformance * 0.4;
      totalWeight += 0.4;
    }
    weightedSum += lessonCoverage * 0.2;
    totalWeight += 0.2;

    if (totalMistakes > 0) {
      weightedSum += mistakeRecovery * 0.2;
      totalWeight += 0.2;
    }
    if (totalRevisions > 0) {
      weightedSum += revisionConsistency * 0.2;
      totalWeight += 0.2;
    }

    const rawMastery = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const masteryScore = parseFloat(Math.min(100, Math.max(0, rawMastery)).toFixed(2));

    // Confidence Calculation (based on sample size & completeness)
    let confidencePoints = 0;
    if (input.quizAttemptsCount >= 1) confidencePoints += 30;
    if (input.quizAttemptsCount >= 3) confidencePoints += 20;
    if (input.completedLecturesCount > 0) confidencePoints += 25;
    if (input.completedRevisionsCount > 0) confidencePoints += 25;

    const confidenceScore = Math.min(100, confidencePoints);

    // Classification
    let classification: MasteryClassification = 'DEVELOPING';
    if (confidenceScore < 30) {
      classification = 'INSUFFICIENT_DATA';
    } else if (masteryScore >= 85 && confidenceScore >= 70) {
      classification = 'MASTERED';
    } else if (masteryScore >= 70) {
      classification = 'STRONG';
    } else if (masteryScore < 50) {
      classification = 'WEAK';
    }

    return {
      subjectId: input.subjectId,
      topicId: input.topicId,
      masteryScore,
      confidenceScore,
      evidenceStrength: confidenceScore,
      classification,
      algorithmVersion: PureMasteryEngine.VERSION,
      calculatedAt: now,
      evidenceThrough: now,
      inputFingerprint: this.hashInput(input),
      componentBreakdown: {
        assessmentPerformance,
        mistakeRecovery: totalMistakes > 0 ? mistakeRecovery : null,
        revisionConsistency: totalRevisions > 0 ? revisionConsistency : null,
        lessonCoverage,
        recency: 100,
      },
    };
  }

  private static hashInput(input: MasteryInputData): string {
    return `fingerprint_${input.topicId}_${input.quizAttemptsCount}_${input.quizAverageAccuracy}_${input.openMistakesCount}_${input.completedLecturesCount}`;
  }
}
