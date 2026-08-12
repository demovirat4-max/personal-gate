import { z } from 'zod';

export const MissionItemTypeSchema = z.enum([
  'OVERDUE_REVISION',
  'DUE_REVISION',
  'IN_PROGRESS_QUIZ',
  'IN_PROGRESS_LESSON',
  'NEXT_LESSON',
  'AVAILABLE_QUIZ',
  'SETUP_IMPORT',
]);

export type MissionItemType = z.infer<typeof MissionItemTypeSchema>;

export const MissionItemSchema = z.object({
  id: z.string(),
  type: MissionItemTypeSchema,
  title: z.string(),
  subtitle: z.string().optional(),
  targetUrl: z.string(),
  priority: z.number().int(),
  completed: z.boolean(),
  metadata: z.record(z.any()).optional(),
});

export type MissionItem = z.infer<typeof MissionItemSchema>;

export const DailyMissionResponseSchema = z.object({
  date: z.string(), // YYYY-MM-DD in Asia/Kolkata
  items: z.array(MissionItemSchema),
  totalTasks: z.number().int(),
  completedTasks: z.number().int(),
});

export type DailyMissionResponse = z.infer<typeof DailyMissionResponseSchema>;

export const LearningSummarySchema = z.object({
  currentLessonId: z.string().uuid().nullable(),
  lessonsStarted: z.number().int(),
  lessonsCompleted: z.number().int(),
  totalWatchedSeconds: z.number().int(),
  quizAttemptsSubmitted: z.number().int(),
  recentQuizScore: z.number().nullable(),
  openMistakesCount: z.number().int(),
  dueRevisionsCount: z.number().int(),
  overdueRevisionsCount: z.number().int(),
  todayCompletedMissionCount: z.number().int(),
});

export type LearningSummary = z.infer<typeof LearningSummarySchema>;
