import { NextResponse } from 'next/server';
import { CurriculumImporterOrchestrator } from '@/server/services/curriculum-importer.service';
import { ImportBatchSummarySchema } from '@/contracts/curriculum/import.contract';
import { z } from 'zod';

export async function GET() {
  try {
    const history = await CurriculumImporterOrchestrator.getImportHistory();
    const validatedHistory = z.array(ImportBatchSummarySchema).parse(history);

    return NextResponse.json({
      success: true,
      data: validatedHistory,
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1.0.0',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: err.message || 'Failed to fetch import history',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1.0.0',
        },
      },
      { status: 500 }
    );
  }
}
