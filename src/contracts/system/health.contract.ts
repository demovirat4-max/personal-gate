import { z } from 'zod';

export const SystemHealthDataSchema = z.object({
  status: z.enum(['ok', 'degraded', 'maintenance']),
  environment: z.string(),
  version: z.string(),
  timestamp: z.string(),
  capabilities: z.object({
    multiDeviceSync: z.boolean(),
    aiProviderConfigured: z.boolean(),
    pyqSeedPipelineReady: z.boolean(),
    deterministicSchedulerReady: z.boolean(),
  }),
});

export const SystemHealthResponseSchema = z.object({
  success: z.literal(true),
  meta: z.object({
    timestamp: z.string(),
    requestId: z.string(),
    version: z.string(),
  }),
  data: SystemHealthDataSchema,
  error: z.null(),
});

export type SystemHealthData = z.infer<typeof SystemHealthDataSchema>;
export type SystemHealthResponse = z.infer<typeof SystemHealthResponseSchema>;
