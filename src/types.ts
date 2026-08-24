/**
 * Core type definitions for GATE CSE Hub
 */

export type ProgressStatus = 'not_started' | 'in_progress' | 'done';
export type RevisionStatus = 'needs_revision' | 'solid';
export type PriorityLevel = 'High' | 'Medium' | 'Low';

export type ResourceType = 'video' | 'playlist' | 'revision' | 'nptel' | 'topic_playlist' | 'notes';

export interface TestLink {
  name: string;
  url: string;
}

export interface VideoResource {
  id: string;
  subject: string;
  topic: string;
  url: string;
  videoId: string | null;
  playlistId?: string | null;
  resourceType?: ResourceType;
  channel: string;
  priority: PriorityLevel;
  textbookRef?: string;
  recommendedChapters?: string;
  testLinks?: TestLink[];
  defaultStatus?: ProgressStatus;
  defaultNotes?: string;
  rowIndex: number;
}

export interface UserStudyState {
  progress: ProgressStatus;
  revision: RevisionStatus;
  notes: string;
  updatedAt: string;
  timeSpentSeconds?: number;
}

export type UserStudyStateMap = Record<string, UserStudyState>;

export interface SubjectWeightConfig {
  [subject: string]: number; // Weight percentage, e.g. 10 for 10%
}

export interface SubjectStat {
  subject: string;
  code: string;
  weight: number; // in percentage, e.g. 10
  totalTopics: number;
  notStarted: number;
  inProgress: number;
  done: number;
  needsRevision: number;
  solid: number;
  rawProgressPercent: number;
  weightedScore: number;
  totalTimeSpentSeconds?: number;
}

export interface QuizOption {
  text: string;
  key: 'A' | 'B' | 'C' | 'D';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  explanation: string;
  tip?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface NewsResponse {
  rawText: string;
  groundingSources: GroundingSource[];
  searchQueries?: string[];
  timestamp: string;
}

export type ActiveTab = 'dashboard' | 'subjects' | 'revision' | 'weekly_plan' | 'news';

export interface WeeklyPlanTask {
  id: string;
  title: string;
  topicName: string;
  subjectName: string;
  type: 'lecture' | 'pyq' | 'revision' | 'quiz' | 'rest';
  durationMinutes: number;
  actionTip?: string;
  completed: boolean;
  resourceId?: string;
}

export interface WeeklyPlanDay {
  dayIndex: number;
  dayName: string;
  dateStr: string;
  isHoliday: boolean;
  holidayNote?: string;
  allocatedMinutes: number;
  focusSubject: string;
  dailyObjective: string;
  tasks: WeeklyPlanTask[];
}

export interface WeeklyPlan {
  id: string;
  weekKey: string; // e.g. "2026-W34"
  weekStartDate: string;
  weekEndDate: string;
  weekTheme: string;
  weeklyGoalSummary: string;
  dailyTargetHours: number;
  holidayDays: string[];
  strategy: string;
  totalPlannedHours: number;
  days: WeeklyPlanDay[];
  createdAt: string;
  updatedAt: string;
}

export interface ConceptFeynmanResponse {
  analogy: string;
  technicalMechanics: string;
  gateTrapsAndEdgeCases: string[];
  highYieldTips: string[];
}

export interface FormulaSheetResponse {
  formulas: { title: string; equation: string; context: string }[];
  complexities: { operation: string; best: string; average: string; worst: string; space: string }[];
  keyTheorems: string[];
}

export interface FilterState {
  subject: string;
  channel: string;
  priority: string;
  status: string;
  searchQuery: string;
}

export interface PYQOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export type VolumeNumber = 1 | 2 | 3;

export interface EraInfo {
  id: string;
  label: string;
  minYear: number;
  maxYear: number;
}

export interface VolumeInfo {
  volume: VolumeNumber;
  name: string;
  shortName: string;
  category: string;
  description?: string;
  subjects: string[];
  pdfFileName: string;
  totalQuestions?: number;
}

export interface PYQuestion {
  id: string;
  volume?: VolumeNumber;
  category?: string;
  subject: string;
  chapter?: string;
  topic: string;
  subtopic?: string;
  year: number; // 1987 to 2026
  examTag: string; // e.g. "GATE 2024 Set-1", "GATE 2015", "GATE 1996", "GATE 1987"
  marks: 1 | 2;
  type: 'MCQ' | 'MSQ' | 'NAT';
  questionText: string;
  codeSnippet?: string;
  options?: PYQOption[];
  correctAnswer: string; // "A", "B", "A, C" for MSQ, or "12.5" / "24" for NAT
  numericalRange?: { min: number; max: number };
  explanation: string;
  conceptTested: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  relatedChapterKeywords: string[];
  referenceUrl?: string;
}

export interface PYQAttemptState {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  attempted: boolean;
  bookmarked?: boolean;
  timeSpentSeconds?: number;
  attemptedAt?: string;
  notes?: string;
}

export type PYQAttemptMap = Record<string, PYQAttemptState>;

export interface ChapterDetailInfo {
  id: string;
  title: string;
  questionCount: number;
  keyConcepts: string[];
}

export interface ChapterCategoryInfo {
  id: string;
  volume: VolumeNumber;
  subject: string;
  categoryName: string;
  description: string;
  totalQuestions: number;
  chapters: ChapterDetailInfo[];
}

export interface PYQRecommendation {
  resourceId: string;
  subject: string;
  topic: string;
  chapter?: string;
  volume?: VolumeNumber;
  completedAt: string;
  pyqCount: number;
  solvedCount: number;
  questions: PYQuestion[];
}

export interface ChapterMCQTestResult {
  chapter: string;
  subject: string;
  score: number;
  totalMarks: number;
  correctCount: number;
  totalQuestions: number;
  completedAt: string;
  timeSpentSeconds: number;
}

export interface StudyStreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date "YYYY-MM-DD"
  activeDates: string[]; // List of "YYYY-MM-DD" dates with recorded activity
  history: Record<string, number>; // date -> activity count
  dailyMinutes?: Record<string, number>; // date -> total minutes recorded that day
}

export interface StudyHoursTrendPoint {
  dateStr: string;
  dayLabel: string;
  dayNum: string;
  fullDateLabel: string;
  isToday: boolean;
  hours: number;
  minutes: number;
  activities: number;
  formattedDuration: string;
}
