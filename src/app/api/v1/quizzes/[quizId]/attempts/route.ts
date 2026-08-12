import { NextResponse } from 'next/server';
import { QuizService } from '@/server/services/quiz.service';

export async function POST(_req: Request, { params }: { params: Promise<{ quizId: string }> }) {
  try {
    const { quizId } = await params;
    const attempt = await QuizService.createAttempt(quizId);
    return NextResponse.json({ success: true, data: attempt, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 500 });
  }
}
