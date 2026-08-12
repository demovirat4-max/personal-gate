import { z } from 'zod';

export const CompletionSourceSchema = z.enum(['AUTOMATIC', 'MANUAL']);
export type CompletionSource = z.infer<typeof CompletionSourceSchema>;

export const LessonProgressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  lessonId: z.string().uuid(),
  youtubeVideoId: z.string(),
  watchedSeconds: z.number().int().min(0),
  furthestWatchedSeconds: z.number().int().min(0),
  durationSeconds: z.number().int().min(0),
  progressPercent: z.number().int().min(0).max(100),
  completed: z.boolean(),
  completionSource: CompletionSourceSchema,
  lastWatchedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type LessonProgress = z.infer<typeof LessonProgressSchema>;

export const UpdateProgressRequestSchema = z.object({
  youtubeVideoId: z.string(),
  watchedSeconds: z.number().int().min(0),
  furthestWatchedSeconds: z.number().int().min(0),
  durationSeconds: z.number().int().min(0),
});

export type UpdateProgressRequest = z.infer<typeof UpdateProgressRequestSchema>;
