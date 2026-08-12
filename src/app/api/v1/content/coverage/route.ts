import { NextResponse } from 'next/server';
import { ContentQualityService } from '@/server/services/content-quality.service';

export async function GET() {
  try {
    const coverage = await ContentQualityService.getCoverageSnapshot();
    return NextResponse.json({ success: true, data: coverage });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'CONTENT_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
