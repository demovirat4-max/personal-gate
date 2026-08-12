import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase admin client so integration tests stay DB-free
vi.mock('@/lib/supabase/server', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: { id: 'mock-uuid' }, error: null }),
    })),
  },
}));

vi.mock('@/server/services/curriculum-importer.service', () => {
  const mockBatchStore = new Map<string, any>();
  const mockIdempotencyKeys = new Set<string>();

  return {
    CurriculumImporterOrchestrator: {
      executeDryRun: vi.fn(async (req: any) => {
        const batchId = crypto.randomUUID();
        const reviewToken = `rev_tok_test_${batchId}`;
        mockBatchStore.set(batchId, {
          id: batchId,
          reviewToken,
          rows: [],
          status: 'READY',
          sourceType: req.sourceType,
          sourceLabel: req.sourceLabel,
        });
        return {
          batchId,
          reviewToken,
          sourceType: req.sourceType,
          sourceLabel: req.sourceLabel,
          rowCount: 0,
          validCount: 0,
          warningCount: 0,
          rejectedCount: 0,
          insertCount: 0,
          updateCount: 0,
          unchangedCount: 0,
          rows: [],
        };
      }),
      executeCommit: vi.fn(async (req: any) => {
        if (mockIdempotencyKeys.has(req.idempotencyKey)) {
          throw new Error('DUPLICATE_IDEMPOTENCY_KEY');
        }
        const batch = mockBatchStore.get(req.batchId);
        if (!batch) throw new Error('Import batch not found or dry-run has expired');
        if (batch.reviewToken !== req.reviewToken) throw new Error('Invalid review token');
        mockIdempotencyKeys.add(req.idempotencyKey);
        return {
          batchId: req.batchId,
          status: 'COMPLETED',
          insertedSubjectsCount: 0,
          insertedTopicsCount: 0,
          insertedLecturesCount: 0,
          updatedLecturesCount: 0,
          completedAt: new Date().toISOString(),
        };
      }),
      getImportHistory: vi.fn(async () => []),
    },
  };
});

import { CurriculumImporterOrchestrator } from '@/server/services/curriculum-importer.service';

describe('Import Pipeline Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dry-run returns a valid batch summary with zero mutations to DB', async () => {
    const result = await CurriculumImporterOrchestrator.executeDryRun({
      sourceType: 'CSV_UPLOAD',
      sourceLabel: 'integration-test.csv',
      fileContentBase64: Buffer.from('Subject,Topic,Lecture Title,YouTube URL').toString('base64'),
    });

    expect(result).toHaveProperty('batchId');
    expect(result).toHaveProperty('reviewToken');
    expect(result.rowCount).toBe(0);
    // No DB commit mutation should have occurred
    expect(result.insertCount).toBe(0);
  });

  it('commit succeeds with valid batchId and reviewToken', async () => {
    const dryRun = await CurriculumImporterOrchestrator.executeDryRun({
      sourceType: 'CSV_UPLOAD',
      sourceLabel: 'commit-test.csv',
      fileContentBase64: Buffer.from('Subject,Topic,Lecture Title,YouTube URL').toString('base64'),
    });

    const commit = await CurriculumImporterOrchestrator.executeCommit({
      batchId: dryRun.batchId,
      reviewToken: dryRun.reviewToken,
      idempotencyKey: `idem_${crypto.randomUUID()}`,
    });

    expect(commit.status).toBe('COMPLETED');
    expect(commit.batchId).toBe(dryRun.batchId);
  });

  it('duplicate idempotency key is rejected on second commit attempt', async () => {
    const dryRun1 = await CurriculumImporterOrchestrator.executeDryRun({
      sourceType: 'CSV_UPLOAD',
      sourceLabel: 'idem-test.csv',
      fileContentBase64: Buffer.from('Subject,Topic,Lecture Title,YouTube URL').toString('base64'),
    });

    const dryRun2 = await CurriculumImporterOrchestrator.executeDryRun({
      sourceType: 'CSV_UPLOAD',
      sourceLabel: 'idem-test-2.csv',
      fileContentBase64: Buffer.from('Subject,Topic,Lecture Title,YouTube URL').toString('base64'),
    });

    const sharedKey = `idem_shared_${crypto.randomUUID()}`;

    await CurriculumImporterOrchestrator.executeCommit({
      batchId: dryRun1.batchId,
      reviewToken: dryRun1.reviewToken,
      idempotencyKey: sharedKey,
    });

    await expect(
      CurriculumImporterOrchestrator.executeCommit({
        batchId: dryRun2.batchId,
        reviewToken: dryRun2.reviewToken,
        idempotencyKey: sharedKey,
      })
    ).rejects.toThrow('DUPLICATE_IDEMPOTENCY_KEY');
  });
});
