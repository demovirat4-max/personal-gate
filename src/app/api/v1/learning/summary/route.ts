import { NextResponse } from 'next/server';
import { MissionService } from '@/server/services/mission.service';

export async function GET() {
  try {
    const summary = await MissionService.getLearningSummary();
    return NextResponse.json({ success: true, data: summary, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 500 });
  }
}
