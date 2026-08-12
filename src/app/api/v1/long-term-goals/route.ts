import { NextResponse } from 'next/server';
import { StrategyService } from '@/server/services/strategy.service';
import { CreateGoalSchema } from '@/contracts/strategy/strategy.contract';

export async function GET() {
  try {
    const goals = await StrategyService.getGoals('user_default');
    return NextResponse.json({ success: true, data: goals });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'STRATEGY_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid goal parameters' } },
        { status: 400 }
      );
    }

    const goal = await StrategyService.createGoal('user_default', parsed.data);
    return NextResponse.json({ success: true, data: goal });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'STRATEGY_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
