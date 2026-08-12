import { NextResponse } from 'next/server';
import { StrategyService } from '@/server/services/strategy.service';

export async function POST() {
  try {
    const result = await StrategyService.generateSchedule('user_default');
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'STRATEGY_GENERATE_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
