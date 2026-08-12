'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DailyPlan, StudySession, CreateStudySessionInput } from '@/contracts/learning/adaptive.contract';

export function useCurrentDailyPlan() {
  return useQuery<DailyPlan>({
    queryKey: ['daily-plans', 'current'],
    queryFn: () => apiClient.get<DailyPlan>('/api/v1/daily-plans/current'),
  });
}

export function useStartStudySession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStudySessionInput) => apiClient.post<StudySession>('/api/v1/study-sessions', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['daily-plans'] });
    },
  });
}

export function useCompleteStudySession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => apiClient.post<StudySession>(`/api/v1/study-sessions/${sessionId}/complete`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['daily-plans'] });
    },
  });
}
