import { z } from 'zod';

export const NoteTypeSchema = z.enum(['GENERAL', 'LESSON', 'CONCEPT', 'MISTAKE', 'QUESTION', 'SUMMARY', 'REVISION']);
export type NoteType = z.infer<typeof NoteTypeSchema>;

export const KnowledgeStatusSchema = z.enum(['ACTIVE', 'ARCHIVED']);
export type KnowledgeStatus = z.infer<typeof KnowledgeStatusSchema>;

export const CreatePersonalNoteSchema = z.object({
  subjectId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  mistakeId: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  contentFormat: z.enum(['PLAIN_TEXT', 'MARKDOWN']).default('MARKDOWN'),
  noteType: NoteTypeSchema.default('GENERAL'),
});
export type CreatePersonalNoteInput = z.infer<typeof CreatePersonalNoteSchema>;

export const PersonalNoteSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
  subjectId: z.string().uuid().nullable(),
  topicId: z.string().uuid().nullable(),
  lessonId: z.string().uuid().nullable(),
  mistakeId: z.string().uuid().nullable(),
  title: z.string(),
  content: z.string(),
  contentFormat: z.string(),
  noteType: NoteTypeSchema,
  status: KnowledgeStatusSchema,
  sourceType: z.string(),
  sourceId: z.string().uuid().nullable(),
  provenance: z.record(z.any()),
  isPinned: z.boolean(),
  revision: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable(),
});
export type PersonalNote = z.infer<typeof PersonalNoteSchema>;

export const CreateFormulaEntrySchema = z.object({
  subjectId: z.string().uuid(),
  topicId: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  expression: z.string().min(1),
  expressionFormat: z.enum(['PLAIN_TEXT', 'LATEX']).default('LATEX'),
  description: z.string().optional(),
  variableDefinitions: z.array(z.record(z.any())).optional().default([]),
  conditions: z.string().optional(),
  example: z.string().optional(),
});
export type CreateFormulaEntryInput = z.infer<typeof CreateFormulaEntrySchema>;

export const FormulaEntrySchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
  subjectId: z.string().uuid(),
  topicId: z.string().uuid().nullable(),
  title: z.string(),
  expression: z.string(),
  expressionFormat: z.string(),
  description: z.string().nullable(),
  variableDefinitions: z.array(z.record(z.any())),
  conditions: z.string().nullable(),
  example: z.string().nullable(),
  sourceType: z.string(),
  sourceId: z.string().uuid().nullable(),
  provenance: z.record(z.any()),
  status: KnowledgeStatusSchema,
  isPinned: z.boolean(),
  revision: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable(),
});
export type FormulaEntry = z.infer<typeof FormulaEntrySchema>;

export const BookmarkTargetTypeSchema = z.enum([
  'LESSON',
  'VIDEO_RESOURCE',
  'CONTENT_SOURCE',
  'QUESTION',
  'QUIZ',
  'MISTAKE',
  'REVISION_ITEM',
  'PERSONAL_NOTE',
  'FORMULA',
  'FLASHCARD_DECK',
  'REVISION_SHEET',
  'EXTERNAL_URL',
]);

export const CreateBookmarkSchema = z.object({
  subjectId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  targetType: BookmarkTargetTypeSchema,
  targetId: z.string().uuid().optional(),
  externalUrl: z
    .string()
    .url()
    .refine((url) => url.startsWith('https://'), { message: 'Only HTTPS URLs allowed' })
    .optional(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});
export type CreateBookmarkInput = z.infer<typeof CreateBookmarkSchema>;

export const BookmarkSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
  subjectId: z.string().uuid().nullable(),
  topicId: z.string().uuid().nullable(),
  lessonId: z.string().uuid().nullable(),
  targetType: BookmarkTargetTypeSchema,
  targetId: z.string().uuid().nullable(),
  externalUrl: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  sourceType: z.string(),
  status: KnowledgeStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable(),
});
export type Bookmark = z.infer<typeof BookmarkSchema>;

export const CreateFlashcardDeckSchema = z.object({
  subjectId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});
export type CreateFlashcardDeckInput = z.infer<typeof CreateFlashcardDeckSchema>;

export const FlashcardDeckSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
  subjectId: z.string().uuid().nullable(),
  topicId: z.string().uuid().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  status: KnowledgeStatusSchema,
  sourceType: z.string(),
  provenance: z.record(z.any()),
  cardCount: z.number().int().nonnegative(),
  dueCardCount: z.number().int().nonnegative(),
  revision: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable(),
});
export type FlashcardDeck = z.infer<typeof FlashcardDeckSchema>;

export const FlashcardRatingSchema = z.enum(['AGAIN', 'HARD', 'GOOD', 'EASY']);
export type FlashcardRating = z.infer<typeof FlashcardRatingSchema>;

export const SubmitFlashcardReviewSchema = z.object({
  rating: FlashcardRatingSchema,
  idempotencyKey: z.string().min(1),
});
export type SubmitFlashcardReviewInput = z.infer<typeof SubmitFlashcardReviewSchema>;
