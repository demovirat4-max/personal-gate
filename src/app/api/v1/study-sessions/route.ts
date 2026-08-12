import { NextResponse } from 'next/server';
import { AdaptiveService } from '@/server/services/adaptive.service';
import { CreateStudySessionSchema } from '@/contracts/learning/adaptive.contract';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateStudySessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid session input data' } },
        { status: 400 }
      );
    }

    const session = await AdaptiveService.startSession('user_default', parsed.data);
    return NextResponse.json({ success: true, data: session });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'STUDY_SESSION_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
