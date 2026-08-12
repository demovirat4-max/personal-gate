import { NextResponse } from 'next/server';
import { MissionService } from '@/server/services/mission.service';

export async function GET() {
  try {
    const mission = await MissionService.getDailyMission();
    return NextResponse.json({ success: true, data: mission, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 500 });
  }
}
