import { ApiResponseEnvelopeSchema } from '@/contracts/common/api-envelope.contract';
import { SystemHealthData, SystemHealthDataSchema } from '@/contracts/system/health.contract';
import { CurriculumTreeResponse, CurriculumTreeResponseSchema } from '@/contracts/curriculum/curriculum.contract';
import {
  ImportDryRunRequest,
  ImportDryRunResponse,
  ImportDryRunResponseSchema,
  ImportCommitRequest,
  ImportCommitResponse,
  ImportCommitResponseSchema,
  ImportBatchSummary,
} from '@/contracts/curriculum/import.contract';
import { z } from 'zod';

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class ApiClient {
  private static async request<T>(path: string, options?: RequestInit, schema?: z.ZodType<T>): Promise<T> {
    const baseUrl = typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    try {
      const res = await fetch(`${baseUrl}/api/v1${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const json = await res.json();
      const envelope = ApiResponseEnvelopeSchema.parse(json);

      if (!envelope.success || envelope.error) {
        throw new ApiClientError(
          envelope.error?.code || 'UNKNOWN_ERROR',
          envelope.error?.message || 'An unexpected server error occurred',
          envelope.error?.details
        );
      }

      if (schema) {
        return schema.parse(envelope.data);
      }

      return envelope.data as T;
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError('NETWORK_ERROR', err.message || 'Failed to connect to API server');
    }
  }

  static async getSystemHealth(): Promise<SystemHealthData> {
    return this.request<SystemHealthData>('/system/health', { method: 'GET' }, SystemHealthDataSchema);
  }

  static async getCurriculumTree(): Promise<CurriculumTreeResponse> {
    return this.request<CurriculumTreeResponse>('/curriculum', { method: 'GET' }, CurriculumTreeResponseSchema);
  }

  static async importDryRun(payload: ImportDryRunRequest): Promise<ImportDryRunResponse> {
    return this.request<ImportDryRunResponse>(
      '/imports/curriculum/dry-run',
      { method: 'POST', body: JSON.stringify(payload) },
      ImportDryRunResponseSchema
    );
  }

  static async importCommit(payload: ImportCommitRequest): Promise<ImportCommitResponse> {
    return this.request<ImportCommitResponse>(
      '/imports/curriculum/commit',
      { method: 'POST', body: JSON.stringify(payload) },
      ImportCommitResponseSchema
    );
  }

  static async getImportHistory(): Promise<ImportBatchSummary[]> {
    return this.request<ImportBatchSummary[]>('/imports/curriculum/history', { method: 'GET' });
  }
}
