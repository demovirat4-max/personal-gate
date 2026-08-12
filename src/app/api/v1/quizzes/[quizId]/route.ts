import { NextResponse } from 'next/server';
import { QuizService } from '@/server/services/quiz.service';

export async function GET(_req: Request, { params }: { params: Promise<{ quizId: string }> }) {
  try {
    const { quizId } = await params;
    const quiz = await QuizService.getQuizForClient(quizId);
    return NextResponse.json({ success: true, data: quiz, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 404 });
  }
}
