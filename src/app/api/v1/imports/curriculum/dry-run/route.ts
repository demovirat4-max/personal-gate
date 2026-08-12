import { NextResponse } from 'next/server';
import { CurriculumImporterOrchestrator } from '@/server/services/curriculum-importer.service';
import { ImportDryRunRequestSchema, ImportDryRunResponseSchema } from '@/contracts/curriculum/import.contract';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedRequest = ImportDryRunRequestSchema.parse(body);

    const dryRunResult = await CurriculumImporterOrchestrator.executeDryRun(parsedRequest);
    const validatedResponse = ImportDryRunResponseSchema.parse(dryRunResult);

    return NextResponse.json({
      success: true,
      data: validatedResponse,
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
          code: err.name === 'ZodError' ? 'VALIDATION_ERROR' : 'IMPORT_DRY_RUN_FAILED',
          message: err.message || 'Failed to process import dry run',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1.0.0',
        },
      },
      { status: 400 }
    );
  }
}
