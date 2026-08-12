import { z } from 'zod';

export const RevisionSourceTypeSchema = z.enum(['MISTAKE', 'LESSON', 'TOPIC']);
export type RevisionSourceType = z.infer<typeof RevisionSourceTypeSchema>;

export const RevisionStatusSchema = z.enum(['DUE', 'UPCOMING', 'COMPLETED']);
export type RevisionStatus = z.infer<typeof RevisionStatusSchema>;

export const RevisionItemSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  sourceType: RevisionSourceTypeSchema,
  sourceId: z.string().uuid(),
  topicId: z.string().uuid().nullable(),
  lessonId: z.string().uuid().nullable(),
  title: z.string().optional(),
  status: RevisionStatusSchema,
  dueDate: z.string(), // YYYY-MM-DD
  intervalDays: z.number().int(),
  reviewCount: z.number().int(),
  lastReviewedAt: z.string().datetime().nullable(),
  nextReviewAt: z.string().datetime().nullable(),
});

export type RevisionItem = z.infer<typeof RevisionItemSchema>;

export const ReviewOutcomeSchema = z.enum(['SUCCESS', 'FAIL']);
export type ReviewOutcome = z.infer<typeof ReviewOutcomeSchema>;

export const CompleteRevisionRequestSchema = z.object({
  outcome: ReviewOutcomeSchema,
});

export type CompleteRevisionRequest = z.infer<typeof CompleteRevisionRequestSchema>;
