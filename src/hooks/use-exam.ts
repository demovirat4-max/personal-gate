'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QuestionBankQuestion, ExamTest, ExamAttempt } from '@/contracts/exam/exam.contract';

export function useQuestionBank(subjectId?: string) {
  return useQuery<QuestionBankQuestion[]>({
    queryKey: ['question-bank', subjectId || 'all'],
    queryFn: () =>
      apiClient.get<QuestionBankQuestion[]>(`/api/v1/question-bank${subjectId ? `?subjectId=${subjectId}` : ''}`),
  });
}

export function useExamTests() {
  return useQuery<ExamTest[]>({
    queryKey: ['exam-tests'],
    queryFn: () => apiClient.get<ExamTest[]>('/api/v1/exam-tests'),
  });
}

export function useStartExamAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testId: string) => apiClient.post<ExamAttempt>(`/api/v1/exam-tests/${testId}/attempts`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-attempts'] });
    },
  });
}

export function useSubmitExamAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: string) => apiClient.post<ExamAttempt>(`/api/v1/exam-attempts/${attemptId}/submit`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-attempts'] });
    },
  });
}
