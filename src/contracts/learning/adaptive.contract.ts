import { z } from 'zod';

export const StudySessionTypeSchema = z.enum(['LEARN', 'REVISION', 'QUIZ', 'MISTAKE_REVIEW', 'PRACTICE']);
export type StudySessionType = z.infer<typeof StudySessionTypeSchema>;

export const StudySessionStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'ABANDONED']);
export type StudySessionStatus = z.infer<typeof StudySessionStatusSchema>;

export const CreateStudySessionSchema = z.object({
  subjectId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  dailyMissionItemId: z.string().uuid().optional(),
  sessionType: StudySessionTypeSchema,
  metadata: z.record(z.any()).optional().default({}),
});
export type CreateStudySessionInput = z.infer<typeof CreateStudySessionSchema>;

export const StudySessionSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
  subjectId: z.string().uuid().nullable(),
  topicId: z.string().uuid().nullable(),
  lessonId: z.string().uuid().nullable(),
  dailyMissionItemId: z.string().uuid().nullable(),
  sessionType: StudySessionTypeSchema,
  status: StudySessionStatusSchema,
  source: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  activeDurationSeconds: z.number().int().nonnegative(),
  pausedDurationSeconds: z.number().int().nonnegative(),
  completedUnits: z.number().int().nonnegative(),
  metadata: z.record(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StudySession = z.infer<typeof StudySessionSchema>;

export const MasteryClassificationSchema = z.enum([
  'NOT_STARTED',
  'INSUFFICIENT_DATA',
  'WEAK',
  'DEVELOPING',
  'STRONG',
  'MASTERED',
  'STALE',
]);
export type MasteryClassification = z.infer<typeof MasteryClassificationSchema>;

export const TopicMasterySchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
  subjectId: z.string().uuid(),
  topicId: z.string().uuid(),
  masteryScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  evidenceStrength: z.number().min(0).max(100),
  classification: MasteryClassificationSchema,
  algorithmVersion: z.string(),
  calculatedAt: z.string(),
  evidenceThrough: z.string(),
  inputFingerprint: z.string(),
  componentBreakdown: z.object({
    assessmentPerformance: z.number().nullable(),
    mistakeRecovery: z.number().nullable(),
    revisionConsistency: z.number().nullable(),
    lessonCoverage: z.number().nullable(),
    recency: z.number().nullable(),
  }),
});
export type TopicMastery = z.infer<typeof TopicMasterySchema>;

export const SubjectMasterySchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
  subjectId: z.string().uuid(),
  masteryScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  coverageScore: z.number().min(0).max(100),
  classification: MasteryClassificationSchema,
  algorithmVersion: z.string(),
  calculatedAt: z.string(),
  evidenceThrough: z.string(),
  inputFingerprint: z.string(),
  componentBreakdown: z.record(z.any()),
});
export type SubjectMastery = z.infer<typeof SubjectMasterySchema>;

export const DailyPlanStatusSchema = z.enum([
  'DRAFT',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'SUPERSEDED',
  'CANCELLED',
]);
export type DailyPlanStatus = z.infer<typeof DailyPlanStatusSchema>;

export const DailyPlanItemStatusSchema = z.enum([
  'PLANNED',
  'IN_PROGRESS',
  'COMPLETED',
  'SKIPPED',
  'DEFERRED',
  'CANCELLED',
]);
export type DailyPlanItemStatus = z.infer<typeof DailyPlanItemStatusSchema>;

export const DailyPlanItemSchema = z.object({
  id: z.string().uuid(),
  dailyPlanId: z.string().uuid(),
  ownerId: z.string(),
  itemType: StudySessionTypeSchema,
  subjectId: z.string().uuid().nullable(),
  topicId: z.string().uuid().nullable(),
  lessonId: z.string().uuid().nullable(),
  mistakeId: z.string().uuid().nullable(),
  revisionItemId: z.string().uuid().nullable(),
  estimatedMinutes: z.number().positive(),
  priorityScore: z.number(),
  sequence: z.number().int().nonnegative(),
  reasonCodes: z.array(z.string()),
  explanationData: z.record(z.any()),
  status: DailyPlanItemStatusSchema,
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});
export type DailyPlanItem = z.infer<typeof DailyPlanItemSchema>;

export const DailyPlanSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
  planDate: z.string(),
  timezone: z.string(),
  status: DailyPlanStatusSchema,
  availableMinutes: z.number().positive(),
  plannedMinutes: z.number().nonnegative(),
  strategyVersion: z.string(),
  inputFingerprint: z.string(),
  generatedAt: z.string(),
  confirmedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  supersedesPlanId: z.string().uuid().nullable(),
  items: z.array(DailyPlanItemSchema),
});
export type DailyPlan = z.infer<typeof DailyPlanSchema>;

export const RecommendationSchema = z.object({
  recommendationId: z.string().uuid(),
  actionType: StudySessionTypeSchema,
  targetType: z.string(),
  targetId: z.string().uuid().nullable(),
  title: z.string(),
  reasonCodes: z.array(z.string()),
  plainLanguageReason: z.string(),
  estimatedMinutes: z.number().positive(),
  priorityScore: z.number(),
  algorithmVersion: z.string(),
  inputFingerprint: z.string(),
  limitations: z.array(z.string()),
  generatedAt: z.string(),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;
