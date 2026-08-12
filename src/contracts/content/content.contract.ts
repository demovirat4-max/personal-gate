import { z } from 'zod';

export const ContentSourceTypeSchema = z.enum([
  'OFFICIAL_EXAM',
  'OFFICIAL_SYLLABUS',
  'OFFICIAL_ANSWER_KEY',
  'INSTITUTIONAL',
  'TEACHER_CURATED',
  'USER_PROVIDED',
  'MANUAL_ENTRY',
  'IMPORT_FILE',
  'GOOGLE_SHEET',
  'YOUTUBE',
  'GENERATED_PRACTICE',
  'UNKNOWN',
]);
export type ContentSourceType = z.infer<typeof ContentSourceTypeSchema>;

export const ContentVerificationStatusSchema = z.enum([
  'UNVERIFIED',
  'NEEDS_REVIEW',
  'PARTIALLY_VERIFIED',
  'VERIFIED',
  'REJECTED',
  'ARCHIVED',
]);
export type ContentVerificationStatus = z.infer<typeof ContentVerificationStatusSchema>;

export const ContentSourceSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
  sourceType: ContentSourceTypeSchema,
  publisher: z.string(),
  title: z.string(),
  sourceUrl: z.string().nullable(),
  examName: z.string().nullable(),
  examYear: z.number().int().nullable(),
  verificationStatus: ContentVerificationStatusSchema,
  verifiedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ContentSource = z.infer<typeof ContentSourceSchema>;

export const QualitySeveritySchema = z.enum(['INFO', 'WARNING', 'ERROR', 'BLOCKING']);
export type QualitySeverity = z.infer<typeof QualitySeveritySchema>;

export const QualityIssueStatusSchema = z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED', 'ARCHIVED']);
export type QualityIssueStatus = z.infer<typeof QualityIssueStatusSchema>;

export const ContentQualityIssueSchema = z.object({
  id: z.string().uuid(),
  entityType: z.string(),
  entityId: z.string().uuid(),
  issueCode: z.string(),
  severity: QualitySeveritySchema,
  status: QualityIssueStatusSchema,
  title: z.string(),
  description: z.string().nullable(),
  detectedBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ContentQualityIssue = z.infer<typeof ContentQualityIssueSchema>;

export const CreateContentSourceSchema = z.object({
  sourceType: ContentSourceTypeSchema,
  title: z.string().min(1),
  publisher: z.string().default('GATE Official'),
  sourceUrl: z.string().optional(),
  examYear: z.number().int().optional(),
});
export type CreateContentSourceInput = z.infer<typeof CreateContentSourceSchema>;
