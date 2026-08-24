import {
  DEFAULT_SHEET_CSV_URL,
  DEFAULT_SUBJECT_WEIGHTS,
  SUBJECT_CODES,
} from '../data/defaultSyllabus';
import {
  NewsResponse,
  ProgressStatus,
  PYQAttemptMap,
  PYQAttemptState,
  RevisionStatus,
  StudyStreakData,
  SubjectStat,
  SubjectWeightConfig,
  UserStudyState,
  UserStudyStateMap,
  VideoResource,
  WeeklyPlan,
} from '../types';

const STORAGE_KEYS = {
  USER_STATES: 'gate_cse_user_study_states_v1',
  SHEET_URL: 'gate_cse_custom_sheet_url_v1',
  SUBJECT_WEIGHTS: 'gate_cse_subject_weights_v1',
  NEWS_CACHE: 'gate_cse_news_cache_v1',
  WEEKLY_PLAN: 'gate_cse_weekly_plan_v1',
  STUDY_STREAK: 'gate_cse_study_streak_v1',
  PYQ_ATTEMPTS: 'gate_cse_pyq_attempts_v1',
};

/**
 * Get current ISO week key (e.g. "2026-W34") and date range (Monday - Sunday)
 */
export function getCurrentWeekInfo(): {
  weekKey: string;
  startDate: Date;
  endDate: Date;
  startStr: string;
  endStr: string;
  dayDates: { name: string; dateStr: string; date: Date }[];
} {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
  // Distance to Monday (if Sunday 0 -> -6, if Mon 1 -> 0, Tue 2 -> -1 ...)
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Compute ISO Week Number
  const target = new Date(monday.valueOf());
  const dayNr = (monday.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const weekKey = `${monday.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const dayDates = dayNames.map((name, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    return {
      name,
      dateStr: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      date: d,
    };
  });

  const startStr = `${monthNames[monday.getMonth()]} ${monday.getDate()}`;
  const endStr = `${monthNames[sunday.getMonth()]} ${sunday.getDate()}`;

  return {
    weekKey,
    startDate: monday,
    endDate: sunday,
    startStr,
    endStr,
    dayDates,
  };
}

/**
 * Load weekly plan from localStorage
 */
export function loadWeeklyPlan(): WeeklyPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_PLAN);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load weekly plan:', err);
    return null;
  }
}

/**
 * Save weekly plan to localStorage
 */
export function saveWeeklyPlan(plan: WeeklyPlan | null): void {
  try {
    if (!plan) {
      localStorage.removeItem(STORAGE_KEYS.WEEKLY_PLAN);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.WEEKLY_PLAN, JSON.stringify(plan));
  } catch (err) {
    console.error('Failed to save weekly plan:', err);
  }
}

/**
 * Load user study states from localStorage
 */
export function loadUserStudyStates(): UserStudyStateMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_STATES);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load user study states:', err);
    return {};
  }
}

/**
 * Save user study states to localStorage
 */
export function saveUserStudyStates(states: UserStudyStateMap): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_STATES, JSON.stringify(states));
  } catch (err) {
    console.error('Failed to save user study states:', err);
  }
}

/**
 * Load saved sheet URL or default Google Sheet URL
 */
export function loadSavedSheetUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SHEET_URL);
    if (saved !== null && saved !== undefined) {
      return saved;
    }
    return DEFAULT_SHEET_CSV_URL;
  } catch {
    return DEFAULT_SHEET_CSV_URL;
  }
}

/**
 * Save custom sheet URL
 */
export function saveCustomSheetUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SHEET_URL, url.trim());
  } catch (err) {
    console.error('Failed to save sheet URL:', err);
  }
}

/**
 * Load subject weights or fallback to standard GATE weights
 */
export function loadSubjectWeights(): SubjectWeightConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECT_WEIGHTS);
    if (!raw) return { ...DEFAULT_SUBJECT_WEIGHTS };
    return { ...DEFAULT_SUBJECT_WEIGHTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SUBJECT_WEIGHTS };
  }
}

/**
 * Save subject weights
 */
export function saveSubjectWeights(weights: SubjectWeightConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECT_WEIGHTS, JSON.stringify(weights));
  } catch (err) {
    console.error('Failed to save subject weights:', err);
  }
}

/**
 * Load cached news
 */
export function loadNewsCache(): NewsResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NEWS_CACHE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save cached news
 */
export function saveNewsCache(news: NewsResponse): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NEWS_CACHE, JSON.stringify(news));
  } catch (err) {
    console.error('Failed to save news cache:', err);
  }
}

/**
 * Get single topic state with safe defaults
 */
export function getTopicState(
  states: UserStudyStateMap,
  resource: VideoResource
): UserStudyState {
  if (states[resource.id]) {
    return {
      progress: states[resource.id].progress,
      revision: states[resource.id].revision,
      notes: states[resource.id].notes,
      updatedAt: states[resource.id].updatedAt,
      timeSpentSeconds: states[resource.id].timeSpentSeconds || 0,
    };
  }
  return {
    progress: resource.defaultStatus || 'not_started',
    revision: 'solid',
    notes: resource.defaultNotes || '',
    timeSpentSeconds: 0,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Format seconds into concise human readable study duration
 * e.g., 45s, 12m, 2h 15m
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const totalMins = Math.floor(seconds / 60);
  if (totalMins < 1) {
    return `${seconds}s`;
  }
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Format seconds into MM:SS or HH:MM:SS stopwatch clock string
 */
export function formatStopwatchTime(seconds: number): string {
  if (!seconds || seconds < 0) seconds = 0;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Calculate full weighted coverage statistics per subject and overall
 */
export function calculateSubjectStats(
  resources: VideoResource[],
  states: UserStudyStateMap,
  weights: SubjectWeightConfig
): {
  subjectStats: SubjectStat[];
  overallWeightedScore: number;
  totalTopics: number;
  totalDone: number;
  totalInProgress: number;
  totalNeedsRevision: number;
  totalWeight: number;
  totalStudyTimeSeconds: number;
} {
  // Group resources by subject
  const subjectGroups: Record<string, VideoResource[]> = {};
  for (const res of resources) {
    const subj = res.subject || 'General';
    if (!subjectGroups[subj]) subjectGroups[subj] = [];
    subjectGroups[subj].push(res);
  }

  // Also include any standard subjects from weights if not yet in resources
  const allSubjectNames = Array.from(
    new Set([...Object.keys(weights), ...Object.keys(subjectGroups)])
  );

  let totalWeight = 0;
  let accumulatedWeightedScore = 0;
  let totalTopics = 0;
  let totalDone = 0;
  let totalInProgress = 0;
  let totalNeedsRevision = 0;
  let totalStudyTimeSeconds = 0;

  const subjectStats: SubjectStat[] = [];

  for (const subject of allSubjectNames) {
    const items = subjectGroups[subject] || [];
    const count = items.length;
    const weight = weights[subject] ?? 5; // Default 5 marks weight if custom subject
    totalWeight += weight;

    let notStarted = 0;
    let inProgress = 0;
    let done = 0;
    let needsRevision = 0;
    let solid = 0;
    let subjectTimeSpent = 0;

    for (const item of items) {
      const state = getTopicState(states, item);
      const timeSpent = state.timeSpentSeconds || 0;
      subjectTimeSpent += timeSpent;
      totalStudyTimeSeconds += timeSpent;

      if (state.progress === 'done') {
        done++;
      } else if (state.progress === 'in_progress') {
        inProgress++;
      } else {
        notStarted++;
      }

      if (state.revision === 'needs_revision') {
        needsRevision++;
      } else {
        solid++;
      }
    }

    const rawProgressPercent = count > 0 ? (done / count) * 100 : 0;
    const weightedScore = (rawProgressPercent / 100) * weight;

    accumulatedWeightedScore += weightedScore;
    totalTopics += count;
    totalDone += done;
    totalInProgress += inProgress;
    totalNeedsRevision += needsRevision;

    const code =
      SUBJECT_CODES[subject] ||
      subject
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4);

    subjectStats.push({
      subject,
      code,
      weight,
      totalTopics: count,
      notStarted,
      inProgress,
      done,
      needsRevision,
      solid,
      rawProgressPercent,
      weightedScore,
      totalTimeSpentSeconds: subjectTimeSpent,
    });
  }

  // Sort subjects by weight descending
  subjectStats.sort((a, b) => b.weight - a.weight);

  const overallWeightedScore =
    totalWeight > 0 ? (accumulatedWeightedScore / totalWeight) * 100 : 0;

  return {
    subjectStats,
    overallWeightedScore,
    totalTopics,
    totalDone,
    totalInProgress,
    totalNeedsRevision,
    totalWeight,
    totalStudyTimeSeconds,
  };
}

/**
 * Compute the "What's Next" decision engine recommendations (3-5 ranked items)
 * Priority formula:
 * Score = (In Progress ? 100 : 50) + (Priority === 'High' ? 30 : Priority === 'Medium' ? 15 : 0) + (Subject Weight * 2) - (Row Index * 0.1)
 */
export function computeWhatsNextRecommendations(
  resources: VideoResource[],
  states: UserStudyStateMap,
  weights: SubjectWeightConfig
): { resource: VideoResource; score: number; reason: string }[] {
  const candidates: { resource: VideoResource; score: number; reason: string }[] = [];

  for (const res of resources) {
    const state = getTopicState(states, res);
    // Only incomplete items can be recommended for "What's Next"
    if (state.progress === 'done') continue;

    const subjWeight = weights[res.subject] ?? 5;
    let score = 0;
    const reasonParts: string[] = [];

    if (state.progress === 'in_progress') {
      score += 100;
      reasonParts.push('Resume In-Progress');
    } else {
      score += 40;
    }

    if (res.priority === 'High') {
      score += 40;
      reasonParts.push('High Yield Priority');
    } else if (res.priority === 'Medium') {
      score += 20;
    }

    // Weight factor (DSA, OS, COA, Algo carry ~10 marks each)
    score += subjWeight * 3;
    if (subjWeight >= 8) {
      reasonParts.push(`Core GATE Marks (${subjWeight}%)`);
    }

    // Secondary slight tie-breaker for earlier syllabus order
    score -= res.rowIndex * 0.05;

    candidates.push({
      resource: res,
      score,
      reason: reasonParts.join(' • ') || `${res.subject} Syllabus`,
    });
  }

  // Sort descending by calculated score
  candidates.sort((a, b) => b.score - a.score);

  return candidates.slice(0, 5);
}

/**
 * Format local Date to 'YYYY-MM-DD'
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date string for N days offset (positive for future, negative for past)
 */
export function getOffsetDateString(offsetDays: number, fromDate: Date = new Date()): string {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + offsetDays);
  return getLocalDateString(d);
}

const DEFAULT_STREAK_DATA: StudyStreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  activeDates: [],
  history: {},
  dailyMinutes: {},
};

/**
 * Load Study Streak data from localStorage
 */
export function loadStudyStreak(): StudyStreakData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDY_STREAK);
    if (!raw) return { ...DEFAULT_STREAK_DATA };
    const parsed = JSON.parse(raw);
    return {
      currentStreak: Number(parsed.currentStreak) || 0,
      longestStreak: Number(parsed.longestStreak) || 0,
      lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : '',
      activeDates: Array.isArray(parsed.activeDates) ? parsed.activeDates : [],
      history: typeof parsed.history === 'object' && parsed.history !== null ? parsed.history : {},
      dailyMinutes: typeof parsed.dailyMinutes === 'object' && parsed.dailyMinutes !== null ? parsed.dailyMinutes : {},
    };
  } catch (err) {
    console.error('Failed to load study streak:', err);
    return { ...DEFAULT_STREAK_DATA };
  }
}

/**
 * Save Study Streak data to localStorage
 */
export function saveStudyStreak(data: StudyStreakData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save study streak:', err);
  }
}

/**
 * Record a study activity (completing topic, running timer, quiz, notes, check-in)
 * and update the consecutive day study streak.
 */
export function recordStudyActivity(activityCount: number = 1, minutesSpent: number = 0): StudyStreakData {
  const current = loadStudyStreak();
  const todayStr = getLocalDateString();
  const yesterdayStr = getOffsetDateString(-1);

  const history = { ...current.history };
  const currentCount = history[todayStr] || 0;
  history[todayStr] = currentCount + activityCount;

  const dailyMinutes = { ...(current.dailyMinutes || {}) };
  const currentMinutes = dailyMinutes[todayStr] || 0;
  // If specific minutes were provided, add them; otherwise give an estimate based on session count (25 min per session)
  const addedMins = minutesSpent > 0 ? minutesSpent : (activityCount > 0 ? activityCount * 25 : 0);
  dailyMinutes[todayStr] = Math.round((currentMinutes + addedMins) * 10) / 10;

  const activeDatesSet = new Set(current.activeDates || []);
  activeDatesSet.add(todayStr);
  const activeDates = Array.from(activeDatesSet).sort();

  let nextCurrentStreak = current.currentStreak;
  let nextLongestStreak = current.longestStreak;

  if (current.lastActiveDate === todayStr) {
    // Already active today, streak count remains active
    if (nextCurrentStreak === 0) {
      nextCurrentStreak = 1;
    }
  } else if (current.lastActiveDate === yesterdayStr) {
    // Consecutive day activity!
    nextCurrentStreak = (current.currentStreak || 0) + 1;
    nextLongestStreak = Math.max(nextLongestStreak, nextCurrentStreak);
  } else {
    // Streak was broken or starting fresh
    nextCurrentStreak = 1;
    nextLongestStreak = Math.max(nextLongestStreak, 1);
  }

  nextLongestStreak = Math.max(nextLongestStreak, nextCurrentStreak);

  const updated: StudyStreakData = {
    currentStreak: nextCurrentStreak,
    longestStreak: nextLongestStreak,
    lastActiveDate: todayStr,
    activeDates,
    history,
    dailyMinutes,
  };

  saveStudyStreak(updated);
  return updated;
}

/**
 * Compute 7-day study hours trend based on study streak history and daily minutes
 */
export function getStudyHoursTrendData(streakData: StudyStreakData): {
  data: {
    dateStr: string;
    dayLabel: string;
    dayNum: string;
    fullDateLabel: string;
    isToday: boolean;
    hours: number;
    minutes: number;
    activities: number;
    formattedDuration: string;
  }[];
  totalHours: number;
  totalMinutes: number;
  avgHoursPerDay: number;
  peakHours: number;
  peakDayLabel: string;
} {
  const todayStr = getLocalDateString();
  const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const data: {
    dateStr: string;
    dayLabel: string;
    dayNum: string;
    fullDateLabel: string;
    isToday: boolean;
    hours: number;
    minutes: number;
    activities: number;
    formattedDuration: string;
  }[] = [];

  let totalMinutes = 0;
  let peakHours = 0;
  let peakDayLabel = 'None';

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const isToday = dateStr === todayStr;

    const activities = streakData.history[dateStr] || 0;
    // Calculate minutes: use recorded dailyMinutes if available, else derive from activity count
    const recordedMins = streakData.dailyMinutes?.[dateStr];
    const mins = typeof recordedMins === 'number' && recordedMins > 0
      ? recordedMins
      : (activities > 0 ? activities * 25 : 0);

    const hours = Math.round((mins / 60) * 10) / 10;
    totalMinutes += mins;

    const dayName = dayShortNames[d.getDay()];
    const monthName = monthShortNames[d.getMonth()];
    const fullDateLabel = `${monthName} ${d.getDate()}`;

    if (hours > peakHours) {
      peakHours = hours;
      peakDayLabel = isToday ? 'Today' : dayName;
    }

    const hrsPart = Math.floor(mins / 60);
    const minsPart = Math.round(mins % 60);
    let formattedDuration = '0m';
    if (hrsPart > 0 && minsPart > 0) {
      formattedDuration = `${hrsPart}h ${minsPart}m`;
    } else if (hrsPart > 0) {
      formattedDuration = `${hrsPart}h`;
    } else if (minsPart > 0) {
      formattedDuration = `${minsPart}m`;
    }

    data.push({
      dateStr,
      dayLabel: isToday ? 'Today' : dayName,
      dayNum: String(d.getDate()),
      fullDateLabel,
      isToday,
      hours,
      minutes: Math.round(mins),
      activities,
      formattedDuration,
    });
  }

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const avgHoursPerDay = Math.round((totalHours / 7) * 10) / 10;

  return {
    data,
    totalHours,
    totalMinutes: Math.round(totalMinutes),
    avgHoursPerDay,
    peakHours,
    peakDayLabel,
  };
}

/**
 * Compute the effective streak status for display in UI
 */
export function getEffectiveStreakInfo(streakData: StudyStreakData): {
  effectiveStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
  activeTodayCount: number;
  lastActiveDate: string;
  totalActiveDays: number;
  past7Days: {
    dateStr: string;
    dayLabel: string;
    dayNum: string;
    isToday: boolean;
    hasActivity: boolean;
    count: number;
  }[];
} {
  const todayStr = getLocalDateString();
  const yesterdayStr = getOffsetDateString(-1);
  const todayCount = streakData.history[todayStr] || 0;
  const isActiveToday = todayCount > 0 || streakData.lastActiveDate === todayStr;

  let effectiveStreak = 0;
  if (isActiveToday) {
    effectiveStreak = Math.max(1, streakData.currentStreak);
  } else if (streakData.lastActiveDate === yesterdayStr) {
    // Missed nothing yet today; current streak is waiting for today's action
    effectiveStreak = streakData.currentStreak;
  } else {
    // Missed yesterday or no prior activity
    effectiveStreak = 0;
  }

  // Calculate past 7 days (6 days ago -> today)
  const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const past7Days: {
    dateStr: string;
    dayLabel: string;
    dayNum: string;
    isToday: boolean;
    hasActivity: boolean;
    count: number;
  }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const isToday = dateStr === todayStr;
    const count = streakData.history[dateStr] || 0;
    const hasActivity = count > 0 || (streakData.activeDates && streakData.activeDates.includes(dateStr));

    past7Days.push({
      dateStr,
      dayLabel: dayShortNames[d.getDay()],
      dayNum: String(d.getDate()),
      isToday,
      hasActivity,
      count,
    });
  }

  return {
    effectiveStreak,
    longestStreak: Math.max(streakData.longestStreak, effectiveStreak),
    isActiveToday,
    activeTodayCount: todayCount,
    lastActiveDate: streakData.lastActiveDate,
    totalActiveDays: streakData.activeDates ? streakData.activeDates.length : Object.keys(streakData.history).length,
    past7Days,
  };
}

/**
 * Load PYQ attempts map from localStorage
 */
export function loadPYQAttempts(): PYQAttemptMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PYQ_ATTEMPTS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load PYQ attempts:', err);
    return {};
  }
}

/**
 * Save PYQ attempts map to localStorage
 */
export function savePYQAttempts(attempts: PYQAttemptMap): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PYQ_ATTEMPTS, JSON.stringify(attempts));
  } catch (err) {
    console.error('Failed to save PYQ attempts:', err);
  }
}

/**
 * Record a single PYQ attempt
 */
export function recordPYQAttempt(
  questionId: string,
  selectedAnswer: string,
  isCorrect: boolean,
  timeSpentSeconds: number = 0,
  notes?: string
): PYQAttemptMap {
  const current = loadPYQAttempts();
  const existing = current[questionId];
  const updated: PYQAttemptState = {
    questionId,
    selectedAnswer,
    isCorrect,
    attempted: true,
    bookmarked: existing?.bookmarked || false,
    timeSpentSeconds: (existing?.timeSpentSeconds || 0) + timeSpentSeconds,
    attemptedAt: new Date().toISOString(),
    notes: notes !== undefined ? notes : existing?.notes,
  };
  const nextMap: PYQAttemptMap = {
    ...current,
    [questionId]: updated,
  };
  savePYQAttempts(nextMap);
  return nextMap;
}

/**
 * Toggle bookmark on a PYQ
 */
export function togglePYQBookmark(questionId: string): PYQAttemptMap {
  const current = loadPYQAttempts();
  const existing = current[questionId];
  const nextMap: PYQAttemptMap = {
    ...current,
    [questionId]: {
      questionId,
      selectedAnswer: existing?.selectedAnswer || '',
      isCorrect: existing?.isCorrect || false,
      attempted: existing?.attempted || false,
      bookmarked: !existing?.bookmarked,
      timeSpentSeconds: existing?.timeSpentSeconds || 0,
      attemptedAt: existing?.attemptedAt || new Date().toISOString(),
      notes: existing?.notes,
    },
  };
  savePYQAttempts(nextMap);
  return nextMap;
}
