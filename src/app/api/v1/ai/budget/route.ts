import { NextResponse } from 'next/server';
import { AiBudgetService } from '@/server/services/ai-budget.service';

export async function GET() {
  try {
    const budget = await AiBudgetService.checkBudget();
    return NextResponse.json({ success: true, data: budget, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 500 });
  }
}
