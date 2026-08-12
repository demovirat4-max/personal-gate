import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface BudgetStatus {
  monthlyLimitInr: number;
  currentSpendInr: number;
  spendPercentage: number;
  warningLevel: 'NONE' | 'WARNING_70' | 'WARNING_90' | 'EXHAUSTED_100';
  isExhausted: boolean;
}

export function useAiBudget() {
  return useQuery<BudgetStatus>({
    queryKey: ['ai', 'budget'],
    queryFn: async () => apiClient.get<BudgetStatus>('/api/v1/ai/budget'),
  });
}

export function useExecuteAi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: { capability: string; sourceId?: string; userInput?: string }) => {
      return apiClient.post<{ requestId: string; artifactId: string; output: string }>('/api/v1/ai/requests', req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'budget'] });
    },
  });
}
