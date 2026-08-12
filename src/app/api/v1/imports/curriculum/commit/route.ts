import { NextResponse } from 'next/server';
import { CurriculumImporterOrchestrator } from '@/server/services/curriculum-importer.service';
import { ImportCommitRequestSchema, ImportCommitResponseSchema } from '@/contracts/curriculum/import.contract';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedRequest = ImportCommitRequestSchema.parse(body);

    const commitResult = await CurriculumImporterOrchestrator.executeCommit(parsedRequest);
    const validatedResponse = ImportCommitResponseSchema.parse(commitResult);

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
          code: err.name === 'ZodError' ? 'VALIDATION_ERROR' : 'IMPORT_COMMIT_FAILED',
          message: err.message || 'Failed to commit import batch',
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
