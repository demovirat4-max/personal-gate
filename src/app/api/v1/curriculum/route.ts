import { NextResponse } from 'next/server';
import { CurriculumService } from '@/server/services/curriculum.service';
import { CurriculumTreeResponseSchema } from '@/contracts/curriculum/curriculum.contract';

export async function GET() {
  try {
    const data = await CurriculumService.getCurriculumTree();
    const validatedData = CurriculumTreeResponseSchema.parse(data);

    return NextResponse.json({
      success: true,
      data: validatedData,
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
          message: err.message || 'Failed to fetch curriculum tree',
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
