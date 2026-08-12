'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { BrainDecision, FocusSessionPlan } from '@/contracts/brain/brain.contract';

export function useBrainContext() {
  return useQuery<{ snapshot: any; decisions: BrainDecision[] }>({
    queryKey: ['brain-context'],
    queryFn: () => apiClient.get<{ snapshot: any; decisions: BrainDecision[] }>('/api/v1/brain/context'),
  });
}

export function useBrainDecisions() {
  return useQuery<BrainDecision[]>({
    queryKey: ['brain-decisions'],
    queryFn: () => apiClient.get<BrainDecision[]>('/api/v1/brain/decisions'),
  });
}

export function useFocusSessions() {
  return useQuery<FocusSessionPlan[]>({
    queryKey: ['focus-sessions'],
    queryFn: () => apiClient.get<FocusSessionPlan[]>('/api/v1/brain/focus-sessions'),
  });
}

export function useCreateFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { objective: string; plannedDurationMinutes?: number }) =>
      apiClient.post<FocusSessionPlan>('/api/v1/brain/focus-sessions', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
    },
  });
}
