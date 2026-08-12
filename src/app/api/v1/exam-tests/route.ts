import { NextResponse } from 'next/server';
import { ExamService } from '@/server/services/exam.service';

export async function GET() {
  try {
    const tests = await ExamService.getTests();
    return NextResponse.json({ success: true, data: tests });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: 'EXAM_ERROR', message: err.message } }, { status: 500 });
  }
}
