import { NextResponse } from 'next/server';
import { QuizService } from '@/server/services/quiz.service';

export async function POST(req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const { attemptId } = await params;
    const body = await req.json();
    const result = await QuizService.submitAttempt(attemptId, body);
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 500 });
  }
}
