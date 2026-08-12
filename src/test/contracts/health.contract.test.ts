import { describe, it, expect } from 'vitest';
import { SystemHealthDataSchema, SystemHealthResponseSchema } from '@/contracts/system/health.contract';

describe('API Contract Tests - System Health Schema', () => {
  it('validates a correct system health response envelope', () => {
    const validPayload = {
      success: true,
      meta: {
        timestamp: '2026-08-11T14:52:00.000Z',
        requestId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        version: 'v1',
      },
      data: {
        status: 'ok',
        environment: 'test',
        version: 'v1.0.0',
        timestamp: '2026-08-11T14:52:00.000Z',
        capabilities: {
          multiDeviceSync: true,
          aiProviderConfigured: true,
          pyqSeedPipelineReady: true,
          deterministicSchedulerReady: true,
        },
      },
      error: null,
    };

    const result = SystemHealthResponseSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects payload with invalid status code', () => {
    const invalidPayload = {
      success: true,
      meta: {
        timestamp: '2026-08-11T14:52:00.000Z',
        requestId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        version: 'v1',
      },
      data: {
        status: 'INVALID_STATUS',
        environment: 'test',
        version: 'v1.0.0',
        timestamp: '2026-08-11T14:52:00.000Z',
        capabilities: {
          multiDeviceSync: true,
          aiProviderConfigured: true,
          pyqSeedPipelineReady: true,
          deterministicSchedulerReady: true,
        },
      },
      error: null,
    };

    const result = SystemHealthResponseSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
