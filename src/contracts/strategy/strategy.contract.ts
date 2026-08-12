import { z } from 'zod';

export const StrategyModeSchema = z.enum([
  'BALANCED',
  'FOUNDATION_FIRST',
  'REVISION_HEAVY',
  'PYQ_HEAVY',
  'MOCK_FOCUSED',
  'RECOVERY',
  'CUSTOM',
]);
export type StrategyMode = z.infer<typeof StrategyModeSchema>;

export const PreparationProfileSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
  targetExam: z.string(),
  targetYear: z.number().int(),
  examDate: z.string().nullable(),
  timezone: z.string(),
  weeklyStudyMinutes: z.number().int().positive(),
  minimumDailyMinutes: z.number().int().nonnegative().nullable(),
  maximumDailyMinutes: z.number().int().positive().nullable(),
  preferredStudyDays: z.array(z.string()),
  strategyMode: StrategyModeSchema,
  targetStatement: z.string().nullable(),
  profileStatus: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PreparationProfile = z.infer<typeof PreparationProfileSchema>;

export const GoalTypeSchema = z.enum([
  'CURRICULUM_COVERAGE',
  'REVISION_CYCLE',
  'PYQ_PRACTICE',
  'MOCK_FREQUENCY',
  'STUDY_TIME',
  'CUSTOM',
]);
export type GoalType = z.infer<typeof GoalTypeSchema>;

export const LongTermGoalSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
  preparationProfileId: z.string().uuid().nullable(),
  goalType: GoalTypeSchema,
  title: z.string(),
  description: z.string().nullable(),
  subjectId: z.string().uuid().nullable(),
  topicId: z.string().uuid().nullable(),
  targetDate: z.string(),
  targetValue: z.number().nullable(),
  unit: z.string().nullable(),
  priority: z.number().int(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type LongTermGoal = z.infer<typeof LongTermGoalSchema>;

export const ActivityTypeSchema = z.enum([
  'LEARN',
  'REVISION',
  'PYQ',
  'QUIZ',
  'MOCK',
  'MISTAKE_REVIEW',
  'KNOWLEDGE_REVIEW',
  'BUFFER',
  'CUSTOM',
]);
export type ActivityType = z.infer<typeof ActivityTypeSchema>;

export const StudyScheduleBlockSchema = z.object({
  id: z.string().uuid(),
  scheduleId: z.string().uuid(),
  ownerId: z.string(),
  blockDate: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  plannedMinutes: z.number().int().positive(),
  activityType: ActivityTypeSchema,
  subjectId: z.string().uuid().nullable(),
  topicId: z.string().uuid().nullable(),
  lessonId: z.string().uuid().nullable(),
  title: z.string(),
  rationaleCodes: z.array(z.string()),
  priority: z.number().int(),
  status: z.string(),
  actualMinutes: z.number().int().nullable(),
  completedAt: z.string().nullable(),
  position: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StudyScheduleBlock = z.infer<typeof StudyScheduleBlockSchema>;

export const CreatePreparationProfileSchema = z.object({
  targetExam: z.string().default('GATE CS/IT'),
  targetYear: z.number().int().default(2028),
  weeklyStudyMinutes: z.number().int().positive().default(1200),
  strategyMode: StrategyModeSchema.default('BALANCED'),
  targetStatement: z.string().optional(),
});
export type CreatePreparationProfileInput = z.infer<typeof CreatePreparationProfileSchema>;

export const CreateGoalSchema = z.object({
  goalType: GoalTypeSchema,
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  targetDate: z.string(),
  targetValue: z.number().optional(),
  unit: z.string().optional(),
  priority: z.number().int().default(1),
});
export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
