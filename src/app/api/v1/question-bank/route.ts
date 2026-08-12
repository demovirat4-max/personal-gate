import { NextResponse } from 'next/server';
import { ExamService } from '@/server/services/exam.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId') || undefined;
    const questions = await ExamService.getQuestions(subjectId);

    return NextResponse.json({ success: true, data: questions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: 'EXAM_ERROR', message: err.message } }, { status: 500 });
  }
}
