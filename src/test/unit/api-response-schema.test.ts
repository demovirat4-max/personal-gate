import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiMetaSchema, ApiErrorDetailSchema, createApiResponseSchema } from '@/contracts/common/api-envelope.contract';
import { ApiClient, ApiClientError } from '@/lib/api/api-client';
import { z } from 'zod';

describe('Shared API Response Schemas & Error Normalization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('validates a valid ApiMetaSchema object', () => {
    const meta = {
      timestamp: '2026-08-11T14:52:00.000Z',
      version: 'v1',
    };
    expect(ApiMetaSchema.parse(meta)).toEqual({
      timestamp: '2026-08-11T14:52:00.000Z',
      version: 'v1',
    });
  });

  it('validates a valid ApiErrorDetailSchema object', () => {
    const errorDetail = {
      code: 'UNAUTHORIZED',
      message: 'Session token invalid or expired',
      details: { trace: 'invalid_jwt' },
    };
    expect(ApiErrorDetailSchema.parse(errorDetail)).toEqual(errorDetail);
  });

  it('correctly creates and validates an ApiResponse envelope schema', () => {
    const dataSchema = z.object({
      id: z.string(),
      status: z.string(),
    });
    const envelopeSchema = createApiResponseSchema(dataSchema);

    const validData = {
      success: true,
      data: { id: '123', status: 'ok' },
      error: null,
      meta: {
        timestamp: '2026-08-11T14:52:00.000Z',
        version: 'v1',
      },
    };
    expect(envelopeSchema.parse(validData)).toEqual(validData);
  });

  it('rejects an envelope payload missing required meta fields', () => {
    const invalidData = {
      success: true,
      data: { id: '123' },
      error: null,
    };
    const envelopeSchema = createApiResponseSchema(z.object({ id: z.string() }));
    expect(() => envelopeSchema.parse(invalidData)).toThrow();
  });

  it('normalizes error responses from API server', async () => {
    const mockErrorEnvelope = {
      success: false,
      data: null,
      error: {
        code: 'NOT_FOUND',
        message: 'Requested resource does not exist',
        details: { resourceId: 'res-999' },
      },
      meta: {
        timestamp: '2026-08-11T14:52:00.000Z',
        version: 'v1.0.0',
      },
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockErrorEnvelope,
    } as Response);

    try {
      await ApiClient.getSystemHealth();
      expect.unreachable('Should have thrown ApiClientError');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiClientError);
      const apiErr = err as ApiClientError;
      expect(apiErr.code).toBe('NOT_FOUND');
      expect(apiErr.message).toBe('Requested resource does not exist');
      expect(apiErr.details).toEqual({ resourceId: 'res-999' });
    }
  });

  it('throws ApiClientError when response contract schema is violated', async () => {
    const mockInvalidEnvelope = {
      success: true,
      data: {
        status: 'ok',
        // missing mandatory fields for SystemHealthDataSchema
      },
      error: null,
      meta: {
        timestamp: '2026-08-11T14:52:00.000Z',
        version: 'v1.0.0',
      },
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockInvalidEnvelope,
    } as Response);

    try {
      await ApiClient.getSystemHealth();
      expect.unreachable('Should have thrown ApiClientError');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiClientError);
    }
  });

  it('handles network failure properly', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Failed to fetch'));

    try {
      await ApiClient.getSystemHealth();
      expect.unreachable('Should have thrown ApiClientError');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect((err as ApiClientError).code).toBe('NETWORK_ERROR');
    }
  });
});
