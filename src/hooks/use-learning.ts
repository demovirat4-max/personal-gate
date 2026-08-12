import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { LessonProgress, UpdateProgressRequest } from '@/contracts/learning/progress.contract';
import { QuizClient, QuizAttempt, QuizResult } from '@/contracts/learning/quiz.contract';
import { Mistake, UpdateMistakeRequest } from '@/contracts/learning/mistake.contract';
import { RevisionItem, CompleteRevisionRequest } from '@/contracts/learning/revision.contract';
import { DailyMissionResponse, LearningSummary } from '@/contracts/learning/mission.contract';

// 1. Progress Hooks
export function useLessonProgress(lessonId: string | null) {
  return useQuery<LessonProgress | null>({
    queryKey: ['learning', 'progress', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      return apiClient.get<LessonProgress | null>(`/api/v1/lessons/${lessonId}/progress`);
    },
    enabled: !!lessonId,
  });
}

export function useUpdateProgress(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: UpdateProgressRequest) => {
      return apiClient.put<LessonProgress>(`/api/v1/lessons/${lessonId}/progress`, req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning', 'progress', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['learning', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['learning', 'mission'] });
    },
  });
}

export function useMarkComplete(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiClient.post<LessonProgress>(`/api/v1/lessons/${lessonId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning', 'progress', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['learning', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['learning', 'mission'] });
      queryClient.invalidateQueries({ queryKey: ['curriculum', 'tree'] });
    },
  });
}

// 2. Quiz Hooks
export function useQuiz(quizId: string | null) {
  return useQuery<QuizClient>({
    queryKey: ['learning', 'quiz', quizId],
    queryFn: async () => {
      if (!quizId) throw new Error('Quiz ID required');
      return apiClient.get<QuizClient>(`/api/v1/quizzes/${quizId}`);
    },
    enabled: !!quizId,
  });
}

export function useCreateAttempt(quizId: string) {
  return useMutation({
    mutationFn: async () => {
      return apiClient.post<QuizAttempt>(`/api/v1/quizzes/${quizId}/attempts`, {});
    },
  });
}

export function useSaveAnswer(attemptId: string) {
  return useMutation({
    mutationFn: async ({ questionId, selectedAnswerJson }: { questionId: string; selectedAnswerJson: any }) => {
      return apiClient.put<{ saved: boolean }>(`/api/v1/quiz-attempts/${attemptId}/answers/${questionId}`, {
        selectedAnswerJson,
      });
    },
  });
}

export function useSubmitAttempt(attemptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (idempotencyKey: string) => {
      return apiClient.post<QuizResult>(`/api/v1/quiz-attempts/${attemptId}/submit`, { idempotencyKey });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning', 'mistakes'] });
      queryClient.invalidateQueries({ queryKey: ['learning', 'revisions'] });
      queryClient.invalidateQueries({ queryKey: ['learning', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['learning', 'mission'] });
    },
  });
}

// 3. Mistake Hooks
export function useMistakes(statusFilter?: string) {
  return useQuery<Mistake[]>({
    queryKey: ['learning', 'mistakes', statusFilter],
    queryFn: async () => {
      const url = statusFilter ? `/api/v1/mistakes?status=${statusFilter}` : '/api/v1/mistakes';
      return apiClient.get<Mistake[]>(url);
    },
  });
}

export function useUpdateMistake(mistakeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: UpdateMistakeRequest) => {
      return apiClient.patch<Mistake>(`/api/v1/mistakes/${mistakeId}`, req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning', 'mistakes'] });
      queryClient.invalidateQueries({ queryKey: ['learning', 'summary'] });
    },
  });
}

// 4. Revision Hooks
export function useRevisions() {
  return useQuery<RevisionItem[]>({
    queryKey: ['learning', 'revisions'],
    queryFn: async () => {
      return apiClient.get<RevisionItem[]>('/api/v1/revisions');
    },
  });
}

export function useCompleteRevision(revisionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: CompleteRevisionRequest) => {
      return apiClient.post<RevisionItem>(`/api/v1/revisions/${revisionId}/reviews`, req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning', 'revisions'] });
      queryClient.invalidateQueries({ queryKey: ['learning', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['learning', 'mission'] });
    },
  });
}

// 5. Daily Mission & Learning Summary Hooks
export function useDailyMission() {
  return useQuery<DailyMissionResponse>({
    queryKey: ['learning', 'mission'],
    queryFn: async () => {
      return apiClient.get<DailyMissionResponse>('/api/v1/mission/today');
    },
  });
}

export function useLearningSummary() {
  return useQuery<LearningSummary>({
    queryKey: ['learning', 'summary'],
    queryFn: async () => {
      return apiClient.get<LearningSummary>('/api/v1/learning/summary');
    },
  });
}
