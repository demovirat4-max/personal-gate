import { supabaseAdmin } from '@/lib/supabase/server';
import { RevisionService } from './revision.service';

export interface BudgetStatus {
  monthlyLimitInr: number;
  currentSpendInr: number;
  spendPercentage: number;
  warningLevel: 'NONE' | 'WARNING_70' | 'WARNING_90' | 'EXHAUSTED_100';
  isExhausted: boolean;
}

export class AiBudgetService {
  private static MONTHLY_CEILING_INR = parseFloat(process.env.AI_MONTHLY_BUDGET_INR || '1000');

  /**
   * Checks current monthly spend against ₹1,000 hard ceiling
   */
  static async checkBudget(userId = 'default_user'): Promise<BudgetStatus> {
    const currentMonth = RevisionService.getKolkataTodayDate().slice(0, 7); // YYYY-MM

    const { data, error } = await supabaseAdmin
      .from('ai_usage_ledger')
      .select('estimated_cost_inr')
      .eq('user_id', userId)
      .eq('usage_month', currentMonth);

    if (error) throw new Error(`Failed to check budget: ${error.message}`);

    const currentSpendInr = (data || []).reduce(
      (acc: number, row: any) => acc + parseFloat(row.estimated_cost_inr || 0),
      0
    );
    const spendPercentage = Math.min(100, Math.round((currentSpendInr / this.MONTHLY_CEILING_INR) * 100));

    let warningLevel: BudgetStatus['warningLevel'] = 'NONE';
    if (spendPercentage >= 100) warningLevel = 'EXHAUSTED_100';
    else if (spendPercentage >= 90) warningLevel = 'WARNING_90';
    else if (spendPercentage >= 70) warningLevel = 'WARNING_70';

    return {
      monthlyLimitInr: this.MONTHLY_CEILING_INR,
      currentSpendInr: parseFloat(currentSpendInr.toFixed(2)),
      spendPercentage,
      warningLevel,
      isExhausted: spendPercentage >= 100,
    };
  }

  /**
   * Records usage and cost in ledger
   */
  static async recordUsage(
    requestId: string,
    capability: string,
    inputTokens: number,
    outputTokens: number,
    costInr: number,
    userId = 'default_user'
  ): Promise<void> {
    const today = RevisionService.getKolkataTodayDate();
    const month = today.slice(0, 7);

    await supabaseAdmin.from('ai_usage_ledger').insert({
      user_id: userId,
      request_id: requestId,
      provider: 'nvidia-zzlm',
      model: process.env.ZZLM_MODEL || 'zzlm-5.2',
      capability,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost_inr: costInr,
      usage_date: today,
      usage_month: month,
    });
  }
}
