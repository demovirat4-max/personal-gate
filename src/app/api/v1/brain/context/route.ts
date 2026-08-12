import { NextResponse } from 'next/server';
import { GlobalBrainService } from '@/server/services/global-brain.service';

export async function GET() {
  try {
    const res = await GlobalBrainService.generateBrainSnapshot('user_default', 'MANUAL_REFRESH');
    return NextResponse.json({ success: true, data: res });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: 'BRAIN_ERROR', message: err.message } }, { status: 500 });
  }
}

export async function POST() {
  try {
    const res = await GlobalBrainService.generateBrainSnapshot('user_default', 'COMMAND');
    return NextResponse.json({ success: true, data: res });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: 'BRAIN_ERROR', message: err.message } }, { status: 500 });
  }
}
