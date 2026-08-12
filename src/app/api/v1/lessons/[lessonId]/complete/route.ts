import { NextResponse } from 'next/server';
import { ProgressService } from '@/server/services/progress.service';

export async function POST(_req: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await params;
    const completed = await ProgressService.markComplete(lessonId);
    return NextResponse.json({ success: true, data: completed, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 500 });
  }
}
