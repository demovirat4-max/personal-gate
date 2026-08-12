import { z } from 'zod';

export const QuestionTypeSchema = z.enum(['MCQ', 'MSQ', 'NAT_INTEGER', 'NAT_DECIMAL']);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

export const SourceTypeSchema = z.enum(['VERIFIED_PYQ', 'IMPORTED_UNVERIFIED', 'AUTHOR_CREATED', 'AI_DRAFT']);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const VerificationStatusSchema = z.enum(['UNVERIFIED', 'NEEDS_REVIEW', 'VERIFIED', 'REJECTED']);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const QuestionBankQuestionSchema = z.object({
  id: z.string().uuid(),
  ownerScope: z.string(),
  subjectId: z.string().uuid(),
  topicId: z.string().uuid().nullable(),
  lessonId: z.string().uuid().nullable(),
  questionType: QuestionTypeSchema,
  questionText: z.string(),
  questionContentFormat: z.string(),
  options: z.array(z.record(z.any())),
  correctAnswer: z.any(),
  explanation: z.string().nullable(),
  marks: z.number().positive(),
  negativeMarks: z.number().nonnegative(),
  examName: z.string().nullable(),
  examYear: z.number().int().nullable(),
  sourceType: SourceTypeSchema,
  verificationStatus: VerificationStatusSchema,
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type QuestionBankQuestion = z.infer<typeof QuestionBankQuestionSchema>;

export const ExamTestTypeSchema = z.enum(['TOPIC', 'SUBJECT', 'PYQ', 'FULL_MOCK', 'CUSTOM']);
export type ExamTestType = z.infer<typeof ExamTestTypeSchema>;

export const ExamTestSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  testType: ExamTestTypeSchema,
  subjectId: z.string().uuid().nullable(),
  topicId: z.string().uuid().nullable(),
  sourcePolicy: z.string(),
  status: z.string(),
  durationSeconds: z.number().int().positive().nullable(),
  totalQuestions: z.number().int().nonnegative(),
  totalMarks: z.number().nonnegative(),
  instructions: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ExamTest = z.infer<typeof ExamTestSchema>;

export const ExamAttemptStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTING',
  'SUBMITTED',
  'EXPIRED',
  'ABANDONED',
]);
export type ExamAttemptStatus = z.infer<typeof ExamAttemptStatusSchema>;

export const ExamAttemptSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
  testId: z.string().uuid(),
  status: ExamAttemptStatusSchema,
  startedAt: z.string(),
  serverDeadlineAt: z.string().nullable(),
  submittedAt: z.string().nullable(),
  elapsedSeconds: z.number().int().nonnegative(),
  score: z.number().nullable(),
  maxScore: z.number().nullable(),
  correctCount: z.number().int().nullable(),
  incorrectCount: z.number().int().nullable(),
  unansweredCount: z.number().int().nullable(),
  idempotencyKey: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ExamAttempt = z.infer<typeof ExamAttemptSchema>;

export const SaveAnswerSchema = z.object({
  answerPayload: z.any(),
});
export type SaveAnswerInput = z.infer<typeof SaveAnswerSchema>;
