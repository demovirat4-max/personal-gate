import { z } from 'zod';

export const MistakeStatusSchema = z.enum(['OPEN', 'REVIEWED', 'MASTERED']);
export type MistakeStatus = z.infer<typeof MistakeStatusSchema>;

export const MistakeSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  questionId: z.string().uuid(),
  attemptId: z.string().uuid().nullable(),
  subjectId: z.string().uuid().nullable(),
  topicId: z.string().uuid().nullable(),
  questionText: z.string().optional(),
  userAnswerJson: z.any(),
  correctAnswerJson: z.any(),
  explanation: z.string().nullable().optional(),
  status: MistakeStatusSchema,
  occurrenceCount: z.number().int(),
  firstSeenAt: z.string().datetime(),
  lastSeenAt: z.string().datetime(),
  reviewedAt: z.string().datetime().nullable(),
  reflection: z.string().nullable(),
});

export type Mistake = z.infer<typeof MistakeSchema>;

export const UpdateMistakeRequestSchema = z.object({
  status: MistakeStatusSchema.optional(),
  reflection: z.string().nullable().optional(),
});

export type UpdateMistakeRequest = z.infer<typeof UpdateMistakeRequestSchema>;
