import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation(() => ({
        eq: vi.fn().mockResolvedValue({
          data: [{ estimated_cost_inr: 50.0 }],
          error: null,
        }),
      })),
    })),
  },
}));

import { AiBudgetService } from '@/server/services/ai-budget.service';

describe('AI Budget Service Tests', () => {
  it('calculates monthly limit of ₹1,000 and status', async () => {
    const status = await AiBudgetService.checkBudget('test_user_budget');
    expect(status.monthlyLimitInr).toBe(1000);
    expect(status.currentSpendInr).toBe(50);
    expect(status.spendPercentage).toBe(5);
    expect(status.isExhausted).toBe(false);
  });
});
