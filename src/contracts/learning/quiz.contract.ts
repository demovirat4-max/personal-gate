import { z } from 'zod';

export const QuestionTypeSchema = z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'NUMERIC', 'TRUE_FALSE']);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

export const QuizQuestionClientSchema = z.object({
  id: z.string().uuid(),
  quizId: z.string().uuid(),
  questionText: z.string(),
  questionType: QuestionTypeSchema,
  optionsJson: z.any().nullable(),
  explanation: z.string().nullable(),
  marks: z.number(),
  negativeMarks: z.number(),
  orderIndex: z.number().int(),
});

export type QuizQuestionClient = z.infer<typeof QuizQuestionClientSchema>;

export const QuizClientSchema = z.object({
  id: z.string().uuid(),
  topicId: z.string().uuid().nullable(),
  lessonId: z.string().uuid().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  passPercentage: z.number(),
  questions: z.array(QuizQuestionClientSchema),
});

export type QuizClient = z.infer<typeof QuizClientSchema>;

export const AttemptStatusSchema = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'ABANDONED']);
export type AttemptStatus = z.infer<typeof AttemptStatusSchema>;

export const QuizAttemptSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  quizId: z.string().uuid(),
  status: AttemptStatusSchema,
  score: z.number(),
  maxScore: z.number(),
  startedAt: z.string().datetime(),
  submittedAt: z.string().datetime().nullable(),
});

export type QuizAttempt = z.infer<typeof QuizAttemptSchema>;

export const SaveAnswerRequestSchema = z.object({
  selectedAnswerJson: z.any(),
});

export type SaveAnswerRequest = z.infer<typeof SaveAnswerRequestSchema>;

export const SubmitAttemptRequestSchema = z.object({
  idempotencyKey: z.string(),
});

export type SubmitAttemptRequest = z.infer<typeof SubmitAttemptRequestSchema>;

export const QuizResultSchema = z.object({
  attemptId: z.string().uuid(),
  status: AttemptStatusSchema,
  score: z.number(),
  maxScore: z.number(),
  passed: z.boolean(),
  submittedAt: z.string().datetime(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selectedAnswerJson: z.any(),
      correctAnswerJson: z.any(),
      isCorrect: z.boolean(),
      awardedMarks: z.number(),
      explanation: z.string().nullable(),
    })
  ),
});

export type QuizResult = z.infer<typeof QuizResultSchema>;
