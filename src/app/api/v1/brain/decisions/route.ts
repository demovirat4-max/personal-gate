import { NextResponse } from 'next/server';
import { GlobalBrainService } from '@/server/services/global-brain.service';

export async function GET() {
  try {
    const decisions = await GlobalBrainService.getDecisions('user_default');
    return NextResponse.json({ success: true, data: decisions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: 'BRAIN_ERROR', message: err.message } }, { status: 500 });
  }
}
