import { NextResponse } from 'next/server';
import { StrategyService } from '@/server/services/strategy.service';
import { CreatePreparationProfileSchema } from '@/contracts/strategy/strategy.contract';

export async function GET() {
  try {
    const profile = await StrategyService.getProfile('user_default');
    return NextResponse.json({ success: true, data: profile });
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
    const parsed = CreatePreparationProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid profile parameters' } },
        { status: 400 }
      );
    }

    const profile = await StrategyService.saveProfile('user_default', parsed.data);
    return NextResponse.json({ success: true, data: profile });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'STRATEGY_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
