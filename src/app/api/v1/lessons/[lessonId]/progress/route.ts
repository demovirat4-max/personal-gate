import { NextResponse } from 'next/server';
import { ProgressService } from '@/server/services/progress.service';

export async function GET(_req: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await params;
    const progress = await ProgressService.getProgress(lessonId);
    return NextResponse.json({ success: true, data: progress, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await params;
    const body = await req.json();
    const updated = await ProgressService.updateProgress(lessonId, body);
    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 500 });
  }
}
