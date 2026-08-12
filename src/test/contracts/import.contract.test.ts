import { describe, it, expect } from 'vitest';
import {
  CanonicalImportRowSchema,
  ImportDryRunResponseSchema,
  ImportCommitRequestSchema,
} from '@/contracts/curriculum/import.contract';

describe('Phase 2 Import Contract Tests', () => {
  it('validates canonical import row schema', () => {
    const validRow = {
      subject: 'Algorithms',
      topic: 'Sorting',
      lectureTitle: 'QuickSort Analysis',
      youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ',
      lectureOrder: 1,
      priority: 'HIGH',
      durationSeconds: 1200,
    };

    expect(CanonicalImportRowSchema.parse(validRow)).toBeDefined();
  });

  it('rejects canonical row missing required fields', () => {
    const invalidRow = {
      subject: 'Algorithms',
    };

    expect(() => CanonicalImportRowSchema.parse(invalidRow)).toThrow();
  });

  it('validates commit request schema', () => {
    const commitReq = {
      batchId: '123e4567-e89b-12d3-a456-426614174000',
      reviewToken: 'rev_tok_12345',
      idempotencyKey: 'idemp_key_12345',
    };

    expect(ImportCommitRequestSchema.parse(commitReq)).toBeDefined();
  });
});
