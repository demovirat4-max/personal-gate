import { z } from 'zod';

export const ApiErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});
export type ApiErrorDetail = z.infer<typeof ApiErrorDetailSchema>;

export const ApiMetaSchema = z.object({
  timestamp: z.string(),
  version: z.string().default('v1.0.0'),
  correlationId: z.string().optional(),
});
export type ApiMeta = z.infer<typeof ApiMetaSchema>;

export const ApiResponseEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  error: ApiErrorDetailSchema.nullable(),
  meta: ApiMetaSchema,
});
export type ApiResponseEnvelope = z.infer<typeof ApiResponseEnvelopeSchema>;

export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.nullable(),
    error: ApiErrorDetailSchema.nullable(),
    meta: ApiMetaSchema,
  });
}
