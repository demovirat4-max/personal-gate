import { z } from 'zod';
import { PrioritySchema } from './curriculum.contract';

export const ImportSourceTypeSchema = z.enum(['GOOGLE_SHEETS', 'CSV_UPLOAD', 'XLSX_UPLOAD']);
export type ImportSourceType = z.infer<typeof ImportSourceTypeSchema>;

export const ImportBatchStatusSchema = z.enum([
  'RECEIVED',
  'PARSING',
  'VALIDATED',
  'READY',
  'COMMITTING',
  'COMPLETED',
  'PARTIAL',
  'FAILED',
  'CANCELLED',
]);
export type ImportBatchStatus = z.infer<typeof ImportBatchStatusSchema>;

export const CanonicalImportRowSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  subtopic: z.string().optional().nullable(),
  lectureTitle: z.string().min(1, 'Lecture Title is required'),
  youtubeUrl: z.string().min(1, 'YouTube URL is required'),
  teacher: z.string().optional().nullable(),
  courseOrPlaylist: z.string().optional().nullable(),
  lectureOrder: z.number().int().positive(),
  priority: PrioritySchema,
  notes: z.string().optional().nullable(),
  durationSeconds: z.number().int().nonnegative(),
});
export type CanonicalImportRow = z.infer<typeof CanonicalImportRowSchema>;

export const NormalizedRowResultSchema = z.object({
  rowNumber: z.number().int().positive(),
  rawData: z.record(z.string(), z.unknown()),
  normalizedRow: CanonicalImportRowSchema.optional().nullable(),
  status: z.enum(['VALID', 'WARNING', 'REJECTED', 'INSERTED', 'UPDATED', 'UNCHANGED']),
  youtubeVideoId: z.string().optional().nullable(),
  errorCode: z.string().optional().nullable(),
  errorMessage: z.string().optional().nullable(),
  fieldName: z.string().optional().nullable(),
});
export type NormalizedRowResult = z.infer<typeof NormalizedRowResultSchema>;

export const ImportDryRunRequestSchema = z.object({
  sourceType: ImportSourceTypeSchema,
  sourceLabel: z.string().min(1),
  googleSheetsUrl: z.string().url().optional(),
  fileContentBase64: z.string().optional(),
});
export type ImportDryRunRequest = z.infer<typeof ImportDryRunRequestSchema>;

export const ImportDryRunResponseSchema = z.object({
  batchId: z.string().uuid(),
  reviewToken: z.string().min(1),
  sourceType: ImportSourceTypeSchema,
  sourceLabel: z.string().min(1),
  rowCount: z.number().int().nonnegative(),
  validCount: z.number().int().nonnegative(),
  warningCount: z.number().int().nonnegative(),
  rejectedCount: z.number().int().nonnegative(),
  insertCount: z.number().int().nonnegative(),
  updateCount: z.number().int().nonnegative(),
  unchangedCount: z.number().int().nonnegative(),
  rows: z.array(NormalizedRowResultSchema),
});
export type ImportDryRunResponse = z.infer<typeof ImportDryRunResponseSchema>;

export const ImportCommitRequestSchema = z.object({
  batchId: z.string().uuid(),
  reviewToken: z.string().min(1),
  idempotencyKey: z.string().min(1),
});
export type ImportCommitRequest = z.infer<typeof ImportCommitRequestSchema>;

export const ImportCommitResponseSchema = z.object({
  batchId: z.string().uuid(),
  status: ImportBatchStatusSchema,
  insertedSubjectsCount: z.number().int().nonnegative(),
  insertedTopicsCount: z.number().int().nonnegative(),
  insertedLecturesCount: z.number().int().nonnegative(),
  updatedLecturesCount: z.number().int().nonnegative(),
  completedAt: z.string(),
});
export type ImportCommitResponse = z.infer<typeof ImportCommitResponseSchema>;

export const ImportBatchSummarySchema = z.object({
  id: z.string().uuid(),
  sourceType: ImportSourceTypeSchema,
  sourceLabel: z.string().min(1),
  status: ImportBatchStatusSchema,
  rowCount: z.number().int().nonnegative(),
  insertedCount: z.number().int().nonnegative(),
  updatedCount: z.number().int().nonnegative(),
  rejectedCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  completedAt: z.string().optional().nullable(),
});
export type ImportBatchSummary = z.infer<typeof ImportBatchSummarySchema>;
