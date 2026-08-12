import { NextResponse } from 'next/server';
import { AdaptiveService } from '@/server/services/adaptive.service';

export async function POST(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const session = await AdaptiveService.completeSession(sessionId, 'user_default');
    return NextResponse.json({ success: true, data: session });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'STUDY_SESSION_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
