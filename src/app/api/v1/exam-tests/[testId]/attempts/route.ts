import { NextResponse } from 'next/server';
import { ExamService } from '@/server/services/exam.service';

export async function POST(req: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const { testId } = await params;
    const attempt = await ExamService.startAttempt(testId, 'user_default');
    return NextResponse.json({ success: true, data: attempt });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'EXAM_ATTEMPT_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
