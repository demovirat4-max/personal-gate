import { NextResponse } from 'next/server';
import { QuizService } from '@/server/services/quiz.service';

export async function PUT(req: Request, { params }: { params: Promise<{ attemptId: string; questionId: string }> }) {
  try {
    const { attemptId, questionId } = await params;
    const body = await req.json();
    await QuizService.saveAnswer(attemptId, questionId, body);
    return NextResponse.json({ success: true, data: { saved: true }, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 500 });
  }
}
