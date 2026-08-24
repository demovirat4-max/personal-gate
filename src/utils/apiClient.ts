import {
  PYQuestion,
  StudyStreakData,
  SubjectWeightConfig,
  UserStudyStateMap,
  WeeklyPlan,
  PYQAttemptMap,
} from '../types';

/**
 * Syncs full study state to backend
 */
export async function syncUserDataToBackend(data: {
  userStates?: UserStudyStateMap;
  pyqAttempts?: PYQAttemptMap;
  studyStreak?: StudyStreakData;
  weeklyPlan?: WeeklyPlan | null;
  subjectWeights?: SubjectWeightConfig | null;
  customSheetUrl?: string | null;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.warn('Background backend sync failed (using local storage):', err);
    return false;
  }
}

/**
 * Fetch persisted user data from backend
 */
export async function fetchUserDataFromBackend(): Promise<{
  userStates?: UserStudyStateMap;
  pyqAttempts?: PYQAttemptMap;
  studyStreak?: StudyStreakData;
  weeklyPlan?: WeeklyPlan | null;
  subjectWeights?: SubjectWeightConfig | null;
  customSheetUrl?: string | null;
} | null> {
  try {
    const res = await fetch('/api/user/data');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Records individual PYQ attempt directly to backend
 */
export async function recordPYQAttemptToBackend(
  questionId: string,
  selectedAnswer: string,
  isCorrect: boolean,
  timeSpentSeconds = 0
): Promise<boolean> {
  try {
    const res = await fetch('/api/user/pyq-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, selectedAnswer, isCorrect, timeSpentSeconds }),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Fetch dedicated 10-MCQ test for a chapter from backend
 */
export async function fetchChapterMCQTestFromBackend(
  subject: string,
  chapter: string,
  count = 10
): Promise<PYQuestion[] | null> {
  try {
    const res = await fetch('/api/pyqs/chapter-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, chapter, count }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.questions || null;
  } catch (err) {
    return null;
  }
}
