'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  PreparationProfile,
  CreatePreparationProfileInput,
  LongTermGoal,
  CreateGoalInput,
} from '@/contracts/strategy/strategy.contract';

export function usePreparationProfile() {
  return useQuery<PreparationProfile | null>({
    queryKey: ['preparation-profile'],
    queryFn: () => apiClient.get<PreparationProfile | null>('/api/v1/preparation-profile'),
  });
}

export function useSavePreparationProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePreparationProfileInput) =>
      apiClient.post<PreparationProfile>('/api/v1/preparation-profile', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preparation-profile'] });
    },
  });
}

export function useLongTermGoals() {
  return useQuery<LongTermGoal[]>({
    queryKey: ['long-term-goals'],
    queryFn: () => apiClient.get<LongTermGoal[]>('/api/v1/long-term-goals'),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalInput) => apiClient.post<LongTermGoal>('/api/v1/long-term-goals', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['long-term-goals'] });
    },
  });
}

export function useGenerateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post('/api/v1/study-schedules/generate', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-schedules'] });
    },
  });
}
