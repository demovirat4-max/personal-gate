import { NextResponse } from 'next/server';
import { ExamService } from '@/server/services/exam.service';

export async function POST(req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const { attemptId } = await params;
    const submitted = await ExamService.submitAttempt(attemptId, 'user_default');
    return NextResponse.json({ success: true, data: submitted });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'EXAM_SUBMIT_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
