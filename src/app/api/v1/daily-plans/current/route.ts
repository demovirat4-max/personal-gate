import { NextResponse } from 'next/server';
import { AdaptiveService } from '@/server/services/adaptive.service';

export async function GET() {
  try {
    const plan = await AdaptiveService.generateDailyPlan('user_default', 120);
    return NextResponse.json({ success: true, data: plan });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'DAILY_PLAN_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
