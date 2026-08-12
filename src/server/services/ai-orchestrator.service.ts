import { supabaseAdmin } from '@/lib/supabase/server';
import { NvidiaZzlmProvider } from '@/server/ai/nvidia-zzlm.provider';
import { CAPABILITY_REGISTRY, CapabilityType } from '@/server/ai/capability.registry';
import { ContextBuilder } from '@/server/ai/context.builder';
import { AiBudgetService } from './ai-budget.service';

export class AiOrchestratorService {
  private static provider = new NvidiaZzlmProvider();

  /**
   * Executes synchronous AI generation request
   */
  static async executeRequest(params: {
    capability: CapabilityType;
    sourceId?: string;
    userInput?: string;
    userId?: string;
  }) {
    const userId = params.userId || 'default_user';

    // 1. Budget Enforcement Check
    try {
      const budget = await AiBudgetService.checkBudget(userId);
      if (budget.isExhausted) {
        throw new Error('AI_MONTHLY_BUDGET_EXHAUSTED: ₹1,000 monthly AI budget ceiling reached.');
      }
    } catch (budgetErr: any) {
      if (budgetErr.message.includes('AI_MONTHLY_BUDGET_EXHAUSTED')) {
        throw budgetErr;
      }
      // Non-fatal budget check fallback
    }

    const capDef = CAPABILITY_REGISTRY[params.capability];
    if (!capDef) throw new Error(`AI_CAPABILITY_UNSUPPORTED: Unknown capability ${params.capability}`);

    // 2. Build Grounded Context
    const groundedContext = await ContextBuilder.buildContext(params.capability, params.sourceId);

    // 3. Create Request Log Entry
    const requestId = crypto.randomUUID();
    try {
      await supabaseAdmin.from('ai_requests').insert({
        id: requestId,
        user_id: userId,
        capability: params.capability,
        provider: this.provider.id,
        status: 'RUNNING',
      });
    } catch (_) {
      // Ignore log insertion failure
    }

    try {
      // 4. Call Provider Adapter
      const response = await this.provider.generate({
        requestId,
        capability: params.capability,
        systemInstruction: capDef.systemInstruction,
        groundedContext,
        userInput: params.userInput,
        maxTokens: capDef.maxOutputTokens,
        temperature: capDef.temperature,
      });

      // 5. Update Request Log Status & Budget Ledger (non-blocking)
      try {
        await supabaseAdmin
          .from('ai_requests')
          .update({
            status: 'SUCCEEDED',
            input_tokens: response.inputTokens,
            output_tokens: response.outputTokens,
            total_tokens: response.totalTokens,
            estimated_cost_inr: response.estimatedCostInr,
            finish_reason: response.finishReason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', requestId);

        await AiBudgetService.recordUsage(
          requestId,
          params.capability,
          response.inputTokens,
          response.outputTokens,
          response.estimatedCostInr,
          userId
        );
      } catch (_) {
        // Non-blocking log update
      }

      // 6. Return response to UI
      return {
        requestId,
        artifactId: null,
        output: response.output,
        usage: {
          totalTokens: response.totalTokens,
          costInr: response.estimatedCostInr,
        },
      };
    } catch (err: any) {
      try {
        await supabaseAdmin
          .from('ai_requests')
          .update({ status: 'FAILED', error_code: err.message, updated_at: new Date().toISOString() })
          .eq('id', requestId);
      } catch (_) {}

      throw err;
    }
  }
}
