import { NextResponse } from 'next/server';
import { GlobalBrainService } from '@/server/services/global-brain.service';

export async function GET() {
  try {
    const sessions = await GlobalBrainService.getFocusSessions('user_default');
    return NextResponse.json({ success: true, data: sessions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: 'BRAIN_ERROR', message: err.message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await GlobalBrainService.createFocusSession(
      'user_default',
      body.objective || 'GATE CS Focus Session',
      body.plannedDurationMinutes || 45
    );
    return NextResponse.json({ success: true, data: session });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: 'BRAIN_ERROR', message: err.message } }, { status: 400 });
  }
}
