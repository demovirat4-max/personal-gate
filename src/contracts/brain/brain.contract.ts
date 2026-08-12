import { z } from 'zod';

export const TriggerTypeSchema = z.enum([
  'COMMAND',
  'DAILY_REVIEW',
  'WEEKLY_REVIEW',
  'MONTHLY_REVIEW',
  'FOCUS_SESSION',
  'FINAL_SPRINT',
  'MANUAL_REFRESH',
]);
export type TriggerType = z.infer<typeof TriggerTypeSchema>;

export const DecisionTypeSchema = z.enum([
  'STUDY_NEXT',
  'REVISE_TOPIC',
  'REVIEW_MISTAKES',
  'TAKE_PRACTICE_TEST',
  'TAKE_MOCK_TEST',
  'CONTINUE_LESSON',
  'ADJUST_FUTURE_PLAN',
  'START_FOCUS_SESSION',
  'REVIEW_CONTENT_GAP',
  'FINAL_SPRINT_PLAN',
  'NO_ACTION',
]);
export type DecisionType = z.infer<typeof DecisionTypeSchema>;

export const DecisionStatusSchema = z.enum([
  'DRAFT',
  'PROPOSED',
  'CONFIRMED',
  'REJECTED',
  'EXPIRED',
  'EXECUTING',
  'EXECUTED',
  'FAILED',
  'CANCELLED',
]);
export type DecisionStatus = z.infer<typeof DecisionStatusSchema>;

export const BrainDecisionSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
  snapshotId: z.string().uuid().nullable(),
  decisionType: DecisionTypeSchema,
  status: DecisionStatusSchema,
  priority: z.number().int().min(1).max(5),
  title: z.string(),
  summary: z.string(),
  reasonCodes: z.array(z.string()),
  targetEntityType: z.string().nullable(),
  targetEntityId: z.string().uuid().nullable(),
  requiresConfirmation: z.boolean(),
  confirmedAt: z.string().nullable(),
  executedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type BrainDecision = z.infer<typeof BrainDecisionSchema>;

export const SubmitCommandSchema = z.object({
  commandText: z.string().min(1),
  scope: z
    .enum(['GLOBAL', 'TODAY', 'SUBJECT', 'TOPIC', 'REVISION', 'EXAM', 'STRATEGY', 'CONTENT_QUALITY'])
    .default('GLOBAL'),
});
export type SubmitCommandInput = z.infer<typeof SubmitCommandSchema>;

export const FocusSessionPlanSchema = z.object({
  id: z.string().uuid(),
  subjectId: z.string().uuid().nullable(),
  topicId: z.string().uuid().nullable(),
  sessionType: z.enum(['LEARN', 'REVISE', 'PRACTICE', 'MISTAKE_REVIEW', 'MOCK_ANALYSIS', 'MIXED']),
  status: z.enum(['DRAFT', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'EXPIRED']),
  plannedDurationMinutes: z.number().int(),
  objective: z.string(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
});
export type FocusSessionPlan = z.infer<typeof FocusSessionPlanSchema>;
